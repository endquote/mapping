import PerspT from "perspective-transform";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useKeyState } from "use-key-state";
import useLocalStorageState from "use-local-storage-state";

type Corner = "NW" | "NE" | "SE" | "SW";

type Point = { x: number; y: number };

// basically a port of this to React
// https://github.com/jlouthan/perspective-transform/tree/gh-pages/examples/css-matrix3d

export default function CornerPin(
  {
    width,
    height,
    children,
    storageKey,
  }: {
    width: number;
    height: number;
    children: ReactNode;
    storageKey: string;
  } = { width: 1920, height: 1080, children: null, storageKey: "cornerpin" }
) {
  const domElement = useRef<HTMLDivElement>(null!);

  // pins represent where each corner of the image is nudged to
  const [pins, setPins, { removeItem: resetPins }] = useLocalStorageState<
    Record<Corner, Point>
  >(`${storageKey}:pins`, {
    defaultValue: {
      NW: { x: 0, y: 0 },
      NE: { x: width, y: 0 },
      SE: { x: width, y: height },
      SW: { x: 0, y: height },
    },
  });

  // the corner currently being nudged, if none selected then nudge all
  const [selectedCorner, setSelectedCorner] = useState<Corner | undefined>();

  // the matrix transform to apply to the image
  const [transform, setTransform] = useState(
    // prettier-ignore
    [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]
  );

  // toggle the transform with space bar, reset it with shift+space

  const { apply, reset } = useKeyState({
    apply: "space",
    reset: "shift+space",
  });

  const [applyPins, setApplyPins] = useLocalStorageState(
    `${storageKey}:applyPins`,
    { defaultValue: true }
  );

  useEffect(() => {
    if (reset.down) {
      resetPins();
    }
    if (apply.down) {
      setApplyPins((applyPins) => {
        return !applyPins;
      });
    }
  }, [apply, reset, resetPins, setApplyPins]);

  // select a corner by pressing Q/W/S/A

  const { selectNW, selectNE, selectSE, selectSW } = useKeyState({
    selectNW: "Q",
    selectNE: "W",
    selectSE: "S",
    selectSW: "A",
    fullScreen: "F",
  });

  useEffect(() => {
    setSelectedCorner((selectedCorner) => {
      if (selectNW.pressed) {
        return selectedCorner === "NW" ? undefined : "NW";
      } else if (selectNE.pressed) {
        return selectedCorner === "NE" ? undefined : "NE";
      } else if (selectSE.pressed) {
        return selectedCorner === "SE" ? undefined : "SE";
      } else if (selectSW.pressed) {
        return selectedCorner === "SW" ? undefined : "SW";
      }
      return selectedCorner;
    });
  }, [selectNW, selectNE, selectSE, selectSW]);

  // nudge the selected corner with arrow keys

  const { nudgeN, nudgeS, nudgeW, nudgeE } = useKeyState(
    {
      nudgeN: "up",
      nudgeS: "down",
      nudgeW: "left",
      nudgeE: "right",
    },
    {
      ignoreRepeatEvents: false,
      captureEvents: true,
    }
  );

  useEffect(() => {
    if (!applyPins) {
      return;
    }
    setPins((pins) => {
      const targets = selectedCorner
        ? [pins[selectedCorner]]
        : Object.values(pins);

      for (const pin of targets) {
        if (nudgeN.down) {
          pin.y -= 1;
        }
        if (nudgeE.down) {
          pin.x += 1;
        }
        if (nudgeS.down) {
          pin.y += 1;
        }
        if (nudgeW.down) {
          pin.x -= 1;
        }
      }

      return pins;
    });
  }, [applyPins, nudgeE, nudgeN, nudgeS, nudgeW, selectedCorner, setPins]);

  useEffect(() => {
    // prettier-ignore
    const src = [
      0, 0, width, 0,
      width, height, 0, height
    ];

    // prettier-ignore
    const dest = [
      pins.NW.x, pins.NW.y, pins.NE.x, pins.NE.y,
      pins.SE.x, pins.SE.y, pins.SW.x, pins.SW.y,
    ];

    const { coeffs: c } = PerspT(src, dest);

    // prettier-ignore
    const m = [
      c[0], c[3], 0, c[6],
      c[1], c[4], 0, c[7],
      0, 0, 1, 0,
      c[2], c[5], 0, c[8],
    ];

    // console.log(src, dest, c);

    setTransform(m);
  }, [pins, height, width]);

  // enter full screen with F key

  const { fullScreen } = useKeyState({ fullScreen: "F" });

  useEffect(() => {
    if (fullScreen.down) {
      domElement.current.requestFullscreen({ navigationUI: "hide" });
    }
  }, [fullScreen]);

  return (
    <div ref={domElement}>
      <div
        style={{
          transform: applyPins ? `matrix3d(${transform.join(",")})` : "",
          transformOrigin: "0 0",
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
