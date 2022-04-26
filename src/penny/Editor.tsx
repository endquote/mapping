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

  // store the circles as arrays: [x, y, radius]
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
      onClick: () => {
        if (!remove.pressed) {
          // add a circle on click
          pennies.push([
            parseFloat((mouse.x - scene.position.x).toFixed(2)),
            parseFloat((mouse.y - scene.position.y).toFixed(2)),
            radius,
          ]);
          // setPennies([...pennies]);
        } else {
          // remove circle on shift-click
          setPennies((pennies) => {
            const cursor = new Vector(
              mouse.x - scene.position.x,
              mouse.y - scene.position.x
            );
            const p = [...pennies];
            // yes i know this is the slowest way to do it
            p.sort(
              (a, b) =>
                Two.Vector.distanceBetween(new Vector(a[0], a[1]), cursor) -
                Two.Vector.distanceBetween(new Vector(b[0], b[1]), cursor)
            );
            // p.shift();
            return p;
          });
        }
      },
    },
    { target: divRef }
  );

  // different circle sizes
  const radii = useRef([14, 22, 35, 43]);
  const [radius, setRadius] = useState(radii.current[0]);

  // set up keyboard handling
  const { nextRadius, toggleBg, remove, reset, nudgeUp, nudgeDown } =
    useKeyState({
      nextRadius: "R",
      nudgeUp: "T",
      nudgeDown: "E",
      toggleBg: "B",
      remove: "shift",
      reset: "shift+O",
    });

  useEffect(() => {
    setRadius((radius) => {
      // R to go to the next radius
      if (nextRadius.pressed) {
        const ri = radii.current;
        const close = [...ri].sort(
          (a, b) => Math.abs(a - radius) - Math.abs(b - radius)
        )[0];
        let i = ri.indexOf(close);
        if (radius !== ri[i]) {
          // jump to the closest one
          return ri[i];
        }
        // jump to the next one
        i = i === ri.length - 1 ? 0 : i + 1;
        return ri[i];
      }

      // T to increase radius
      if (nudgeUp.pressed) {
        return radius + 1;
      }

      // E to decreate radius
      if (nudgeDown.pressed) {
        return radius - 1;
      }

      return radius;
    });
  }, [nextRadius, nudgeUp, nudgeDown]);

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
    // const bigR = [...radii.current].sort().pop()!;
    // scene.position.x = scene.position.y = bigR * 2;

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
    cursor.stroke = "rgba(0,0,0,1)";
    cursor.linewidth = 0.5;
    cursor.fill = "rgba(255,0,0,.3)";
    cursor.opacity = 1;
    scene.add(cursor);
  }, [scene]);

  // track the mouse position with the cursor
  useEffect(() => {
    const cursor = scene.children[2] as Circle;
    cursor.radius = radius - cursor.linewidth / 2;
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
      circle.fill = "red";
      circle.opacity = 0.6;
      pennyGroup.add(circle);
    }
  }, [scene, pennies]);

  return <div ref={divRef} style={{ cursor: "none" }}></div>;
}
