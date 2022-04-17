import React, { useEffect, useRef, useState } from "react";
import Two from "two.js";
import { Texture } from "two.js/src/effects/texture";
import { Group } from "two.js/src/group";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";

export default function Penny() {
  const domElement = useRef<HTMLDivElement>(null!);
  const [two] = useState<Two>(
    new Two({ fullscreen: true, autostart: true, type: Two.Types.svg })
  );
  const [sceneSize] = useState<Vector>(new Vector(1920, 1080));
  const [sceneRoot] = useState<Group>(new Group());

  // initialize the scene

  useEffect(() => {
    console.log("setup");
    const el = domElement.current;
    two.appendTo(el);
    two.bind("update", update);

    two.add(sceneRoot);

    const bg = new Rectangle(0, 0, sceneSize.x, sceneSize.y);
    // weird casting because ts-ignore breaks prettier here
    bg.fill = new Texture("/bg-test.png") as unknown as string;
    bg.linewidth = 0;
    bg.position.x = sceneSize.x / 2;
    bg.position.y = sceneSize.y / 2;
    sceneRoot.add(bg);

    return () => {
      two.unbind("update");
      two.pause();
      el.removeChild(two.renderer.domElement);
    };
  }, [sceneRoot, sceneSize, two]);

  const update = () => {};

  return <div ref={domElement}></div>;
}
