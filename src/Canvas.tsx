import PerspT from "perspective-transform";
import React, { useEffect, useRef, useState } from "react";
import Two from "two.js";
import { Texture } from "two.js/src/effects/texture";
import { Group } from "two.js/src/group";
import { Matrix } from "two.js/src/matrix";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";
import { useKeyState } from "use-key-state";

type Corner = "NW" | "NE" | "SE" | "SW";

export default function Canvas() {
  const domElement = useRef<HTMLDivElement>(null!);
  const [two] = useState<Two>(
    new Two({ fullscreen: true, autostart: true, type: Two.Types.svg })
  );
  const [sceneSize] = useState<Vector>(new Vector(1920, 1080));
  const [sceneRoot] = useState<Group>(new Group());
  const [transform, setTransform] = useState<Matrix>(new Matrix());

  // initialize the scene

  useEffect(() => {
    console.log("setup");
    const el = domElement.current;
    two.appendTo(el);
    two.bind("update", update);

    sceneRoot.matrix.manual = true;
    two.add(sceneRoot);

    const bg = new Rectangle(0, 0, sceneSize.x, sceneSize.y);
    // weird casting because ts-ignore breaks prettier here
    bg.fill = new Texture("/bg.jpg") as unknown as string;
    bg.linewidth = 0;
    bg.position.x = sceneSize.x / 2;
    bg.position.y = sceneSize.y / 2;
    sceneRoot.add(bg);

    pins.NW.x = 0;
    pins.NW.y = 0;
    pins.NE.x = pins.NW.x + sceneSize.x;
    pins.NE.y = pins.NW.y;
    pins.SE.x = pins.NE.x;
    pins.SE.y = pins.NE.y + sceneSize.y;
    pins.SW.x = pins.NW.x;
    pins.SW.y = pins.SE.y;

    setPins({ ...pins });

    return () => {
      two.unbind("update");
      two.pause();
      el.removeChild(two.renderer.domElement);
    };
  }, [two]);

  // select a corner by pressing Q/W/S/A

  const [selectedCorner, setSelectedCorner] = useState<Corner | undefined>();

  const { selectNW, selectNE, selectSE, selectSW } = useKeyState(
    {
      selectNW: "Q",
      selectNE: "W",
      selectSE: "S",
      selectSW: "A",
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
    }
  }, [selectNW, selectNE, selectSE, selectSW]);

  useEffect(() => {
    console.log("selectedCorner", selectedCorner);
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
      0, 0, sceneSize.x, 0,
      sceneSize.x, sceneSize.y, 0, sceneSize.y,
    ];

    // prettier-ignore
    const dest = [
      pins.NW.x, pins.NW.y, pins.NE.x, pins.NE.y,
      pins.SE.x, pins.SE.y, pins.SW.x, pins.SW.y,
    ];

    const { coeffs: c } = PerspT(src, dest);

    // prettier-ignore
    const m = new Matrix(
      c[0], c[3], c[6],
      c[1], c[4], c[7],
      c[2], c[5], c[8]
    );

    console.log(src, dest, c);

    setTransform(m);
  }, [pins]);

  useEffect(() => {
    const [a, b, c, d, e, f, g, h, i] = transform.elements;
    sceneRoot.matrix.set(a, b, c, d, e, f, g, h, i);
  }, [transform]);

  const update = () => {};

  return <div ref={domElement} />;
}
