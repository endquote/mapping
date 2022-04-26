import { useGesture } from "@use-gesture/react";
import React, { useEffect, useRef, useState } from "react";
import { Texture } from "two.js/src/effects/texture";
import { Group } from "two.js/src/group";
import { Circle } from "two.js/src/shapes/circle";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";
import { useKeyState } from "use-key-state";
import useLocalStorageState from "use-local-storage-state";
import { useTwo } from "../useTwo";
import { coords } from "./coords";

// filter partial pennies that are not adjacent to a cabinet
const pennies = coords.filter(
  ([x, y, r]) =>
    !(y + r > 780 && (x - r < 0 || x + r > 1920)) && !(y + r > 1080)
);

export default function Editor(
  { storageKey }: { storageKey: string } = { storageKey: "penny" }
) {
  const divRef = useRef<HTMLDivElement>(null!);

  // initialize two.js
  const [scene] = useTwo(divRef);
  const sceneSize = useRef(new Vector(1920, 1080));
  const bgTexture = useRef(new Texture("/bg.jpg") as unknown as string);


  // mouse location
  const [mouse, setMouse] = useState<Vector>(new Vector());

  useGesture(
    {
      // save mouse location on move
      onMove: ({ event }) => {
        setMouse(new Vector(event.offsetX, event.offsetY));
      },
    },
    { target: divRef }
  );

  // set up keyboard handling
  const { toggleBg } = useKeyState({
    toggleBg: "B",
  });

  // B to toggle the background
  const [showBg, setShowBg] = useLocalStorageState(`${storageKey}:showBg`, {
    defaultValue: true,
  });
  useEffect(() => {
    if (toggleBg.down) {
      setShowBg((showBg) => {
        return !showBg;
      });
    }
  }, [toggleBg, setShowBg]);

  useEffect(() => {
    const bg = scene.children[0] as Rectangle;
    if (!bg) {
      return;
    }
    bg.fill = showBg ? bgTexture.current : "black";
  }, [scene, showBg]);

  // set up the scene
  useEffect(() => {
    if (scene.children.length) {
      return;
    }

    const { x: width, y: height } = sceneSize.current;

    while (scene.children.length) {
      scene.children[0].remove();
    }

    // background image
    const bg = new Rectangle(0, 0, width, height);
    bg.noStroke();
    bg.fill = bgTexture.current;
    bg.position.x = width / 2;
    bg.position.y = height / 2;
    scene.add(bg);

    // mask the scene to the size of the background
    const mask = new Rectangle(0, 0, width, height);
    mask.noStroke();
    mask.position.x = width / 2;
    mask.position.y = height / 2;
    scene.mask = mask;

    // a group for holding the circles
    const pennyGroup = new Group();
    scene.add(pennyGroup);
  }, [scene]);

  // draw the clicked circles
  useEffect(() => {
    const pennyGroup = scene.children[1] as Group;
    while (pennyGroup.children.length) {
      pennyGroup.children[0].remove();
    }

    for (const coords of pennies) {
      const circle = new Circle(coords[0], coords[1], coords[2]);
      circle.noStroke();
      circle.fill = "red";
      circle.opacity = 0.6;
      pennyGroup.add(circle);
    }
  }, [scene]);

  return <div ref={divRef}></div>;
}
