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
import { usePrevious } from "../hooks/usePrevious";
import { useTwo } from "../hooks/useTwo";
import { coords } from "./coords";

type Penny = { v: Vector; r: number; c: Circle };

const pennies = coords
  // filter partial pennies that are not adjacent to a cabinet
  .filter(
    ([x, y, r]) =>
      !(y + r > 780 && (x - r < 0 || x + r > 1920)) && !(y + r > 1080)
  )
  // convert to an easier-to-work-with object
  .map(([x, y, r]): Penny => {
    const v = new Vector(x, y);
    const c = new Circle();
    c.position = v;
    c.radius = r;
    return { r, v, c };
  });

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

    for (const { c } of pennies) {
      c.noStroke();
      c.fill = "red";
      c.opacity = 0.6;
      pennyGroup.add(c);
    }
  }, [scene]);

  // highlight the hovered penny
  const [hoverPenny, setHoverPenny] = useState<Penny>();
  const prevHoverPenny = usePrevious(hoverPenny);

  useEffect(() => {
    setHoverPenny(
      pennies.find((p) => Two.Vector.distanceBetween(p.v, mouse) <= p.r)
    );
  }, [mouse]);

  useEffect(() => {
    if (prevHoverPenny) {
      prevHoverPenny.c.fill = "red";
    }
    if (hoverPenny) {
      hoverPenny.c.fill = "green";
    }
  }, [hoverPenny, prevHoverPenny]);

  return <div ref={divRef}></div>;
}
