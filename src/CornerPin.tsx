import PerspT from "perspective-transform";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Vector } from "two.js/src/vector";
import { useKeyState } from "use-key-state";

type Corner = "NW" | "NE" | "SE" | "SW";

type CornerPinProps = { width: number; height: number; children: ReactNode };

// basically a port of this to React
// https://github.com/jlouthan/perspective-transform/tree/gh-pages/examples/css-matrix3d

export default function CornerPin({ width, height, children }: CornerPinProps) {
  const domElement = useRef<HTMLDivElement>(null!);
  const [transform, setTransform] = useState<number[]>([
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  ]);

  // initialize the scene

  useEffect(() => {
    resetPins();
  }, [width, height]);

  const resetPins = () => {
    pins.NW.x = 0;
    pins.NW.y = 0;
    pins.NE.x = pins.NW.x + width;
    pins.NE.y = pins.NW.y;
    pins.SE.x = pins.NE.x;
    pins.SE.y = pins.NE.y + height;
    pins.SW.x = pins.NW.x;
    pins.SW.y = pins.SE.y;

    setPins({ ...pins });
  };

  // select a corner by pressing Q/W/S/A

  const [selectedCorner, setSelectedCorner] = useState<Corner | undefined>();

  const { selectNW, selectNE, selectSE, selectSW, reset } = useKeyState(
    {
      selectNW: "Q",
      selectNE: "W",
      selectSE: "S",
      selectSW: "A",
      reset: "space",
    },
    { ignoreRepeatEvents: true }
  );

  useEffect(() => {
    if (selectNW.down) {
      setSelectedCorner(selectedCorner === "NW" ? undefined : "NW");
    } else if (selectNE.down) {
      setSelectedCorner(selectedCorner === "NE" ? undefined : "NE");
    } else if (selectSE.down) {
      setSelectedCorner(selectedCorner === "SE" ? undefined : "SE");
    } else if (selectSW.down) {
      setSelectedCorner(selectedCorner === "SW" ? undefined : "SW");
    } else if (reset.down) {
      resetPins();
    }
  }, [selectNW, selectNE, selectSE, selectSW, reset]);

  useEffect(() => {
    // console.log("selectedCorner", selectedCorner);
  }, [selectedCorner]);

  // nudge the selected corner with arrow keys

  const [pins, setPins] = useState<Record<Corner, Vector>>({
    NW: new Vector(),
    NE: new Vector(),
    SE: new Vector(),
    SW: new Vector(),
  });

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
    if (
      !nudgeN.pressed &&
      !nudgeE.pressed &&
      !nudgeS.pressed &&
      !nudgeW.pressed
    ) {
      return;
    }

    const targets = selectedCorner
      ? [pins[selectedCorner]]
      : Object.values(pins);

    for (const pin of targets) {
      if (nudgeN.pressed) {
        pin.y -= 1;
      }
      if (nudgeE.pressed) {
        pin.x += 1;
      }
      if (nudgeS.pressed) {
        pin.y += 1;
      }
      if (nudgeW.pressed) {
        pin.x -= 1;
      }
    }

    setPins({ ...pins });
  }, [nudgeN, nudgeS, nudgeW, nudgeE]);

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
  }, [pins]);

  return (
    <div
      ref={domElement}
      style={{
        transform: `matrix3d(${transform.join(",")})`,
        transformOrigin: "0 0",
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {children}
    </div>
  );
}
