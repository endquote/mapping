import React, { useEffect, useRef, useState } from "react";
import Two from "two.js";
import { Texture } from "two.js/src/effects/texture";
import { Group } from "two.js/src/group";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";
import { useKeyState } from "use-key-state";

type Corner = "NW" | "NE" | "SE" | "SW";

export default function Canvas() {
  const domElement = useRef<HTMLDivElement>(null!);
  const [two] = useState<Two>(new Two({ fullscreen: true, autostart: true }));
  const [sceneSize] = useState<Vector>(new Vector(1920, 1080));
  const [sceneRoot] = useState<Group>(new Group());

  // select a corner by pressing Q/W/S/A

  const [selectedCorner, setSelectedCorner] = useState<Corner | undefined>();

  const { selectNW, selectNE, selectSE, selectSW } = useKeyState({
    selectNW: "Q",
    selectNE: "W",
    selectSE: "S",
    selectSW: "A",
  });

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
    if (!selectedCorner) {
      return;
    }

    const pin = pins[selectedCorner];
    let changed = false;

    if (nudgeN.pressed) {
      pin.y -= 1;
      changed = true;
    }

    if (nudgeE.pressed) {
      pin.x += 1;
      changed = true;
    }

    if (nudgeS.pressed) {
      pin.y += 1;
      changed = true;
    }

    if (nudgeW.pressed) {
      pin.x -= 1;
      changed = true;
    }

    if (changed) {
      setPins({ ...pins });
    }
  }, [nudgeN, nudgeS, nudgeW, nudgeE]);

  useEffect(() => {
    console.log(pins);
  }, [pins]);

  const setup = () => {
    two.add(sceneRoot);

    const bg = new Rectangle(0, 0, sceneSize.x, sceneSize.y);
    // @ts-ignore
    bg.fill = new Texture("/bg.jpg");
    sceneRoot.add(bg);

    sceneRoot.matrix.manual = true;
    sceneRoot.matrix.translate(sceneSize.x / 2, sceneSize.y / 2);
  };

  const update = () => {};

  useEffect(() => {
    const el = domElement.current;
    two.appendTo(el);
    setup();
    two.bind("update", update);

    return () => {
      two.unbind("update");
      two.pause();
      el.removeChild(two.renderer.domElement);
    };
  }, []);

  return <div ref={domElement} />;
}
