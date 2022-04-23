import { useGesture } from "@use-gesture/react";
import React, { useEffect, useRef, useState } from "react";
import Two from "two.js";
import { Texture } from "two.js/src/effects/texture";
import { Group } from "two.js/src/group";
import { Circle } from "two.js/src/shapes/circle";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";
import { useKeyState } from "use-key-state";
import useLocalStorageState from "use-local-storage-state";
import { useTwo } from "../useTwo";
import { coords } from "./coords";

export default function Editor(
  { storageKey }: { storageKey: string } = { storageKey: "penny" }
) {
  const divRef = useRef<HTMLDivElement>(null!);

  // initialize two.js
  const [scene] = useTwo(divRef);
  const sceneSize = useRef(new Vector(1920, 1080));
  const bgTexture = useRef(new Texture("/bg.jpg") as unknown as string);

  // store the circles
  const [pennies, setPennies, { removeItem: resetPennies }] =
    useLocalStorageState<number[][]>(`${storageKey}:circles`, {
      defaultValue: coords,
    });

  // mouse location
  const [mouse, setMouse] = useState<Vector>(new Vector());

  useGesture(
    {
      // save mouse location on move
      onMove: ({ event }) => {
        setMouse(new Vector(event.offsetX, event.offsetY));
      },
      // add a circle on click
      onClick: () => {
        pennies.push([
          Math.round((mouse.x - scene.position.x) * 10000) / 10000,
          Math.round((mouse.y - scene.position.y) * 10000) / 10000,
          radius,
        ]);
        setPennies([...pennies]);
      },
    },
    { target: divRef }
  );

  // different circle sizes
  const radii = useRef([43, 35, 22, 14]);
  const [radius, setRadius] = useState(radii.current[0]);

  // set up keyboard handling
  const { nextRadius, toggleBg, remove, reset } = useKeyState({
    nextRadius: "R",
    toggleBg: "B",
    remove: "shift+D",
    reset: "shift+O",
  });

  // R to go to the next radius
  useEffect(() => {
    if (!nextRadius.pressed) {
      return;
    }
    setRadius((radius) => {
      let i = radii.current.indexOf(radius);
      i = i === radii.current.length - 1 ? 0 : i + 1;
      return radii.current[i];
    });
  }, [nextRadius]);

  // B to toggle the background
  useEffect(() => {
    if (!toggleBg.pressed) {
      return;
    }
    const bg = scene.children[0] as Rectangle;
    bg.fill = bg.fill === "black" ? bgTexture.current : "black";
  }, [toggleBg, scene]);

  // shift+D to delete the penny closest to the cursor
  useEffect(() => {
    if (!remove.pressed) {
      return;
    }
    setPennies((pennies) => {
      const cursor = new Vector(
        mouse.x - radii.current[0] * 2,
        mouse.y - radii.current[0] * 2
      );
      const p = [...pennies];
      // yes i know this is the slowest way to do it
      p.sort(
        (a, b) =>
          Two.Vector.distanceBetween(new Vector(a[0], a[1]), cursor) -
          Two.Vector.distanceBetween(new Vector(b[0], b[1]), cursor)
      );
      p.shift();
      return p;
    });
  }, [remove, mouse, setPennies]);

  // shift+O to reset to saved pennies
  useEffect(() => {
    if (!reset.pressed) {
      return;
    }
    resetPennies();
  }, [reset, resetPennies]);

  // set up the scene
  useEffect(() => {
    if (scene.children.length) {
      return;
    }

    const { x: width, y: height } = sceneSize.current;

    while (scene.children.length) {
      scene.children[0].remove();
    }

    // offset scene so that partial circles on the top and left can be hit
    scene.position.x = scene.position.y = radii.current[0] * 2;

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

    // a circle cursor
    const cursor = new Circle(0, 0, 10);
    cursor.noStroke();
    cursor.fill = "green";
    cursor.opacity = 0.8;
    scene.add(cursor);
  }, [scene]);

  // track the mouse position with the cursor
  useEffect(() => {
    const cursor = scene.children[2] as Circle;
    cursor.radius = radius;
    cursor.position.x = mouse.x - scene.position.x;
    cursor.position.y = mouse.y - scene.position.y;
  }, [scene, mouse, radius]);

  // draw the clicked circles
  useEffect(() => {
    const pennyGroup = scene.children[1] as Group;
    while (pennyGroup.children.length) {
      pennyGroup.children[0].remove();
    }

    for (const coords of pennies) {
      const circle = new Circle(coords[0], coords[1], coords[2]);
      circle.noStroke();
      circle.fill = "white";
      circle.opacity = 1;
      pennyGroup.add(circle);
    }
  }, [scene, pennies]);

  return <div ref={divRef}></div>;
}
