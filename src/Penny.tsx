import { useGesture } from "@use-gesture/react";
import React, { useEffect, useRef, useState } from "react";
import Two from "two.js";
import { Texture } from "two.js/src/effects/texture";
import { Group } from "two.js/src/group";
import { Circle } from "two.js/src/shapes/circle";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";
import useLocalStorageState from "use-local-storage-state";
import { useTwo } from "./useTwo";

type PennyProps = {
  storageKey: string;
};

export default function Penny({ storageKey }: PennyProps) {
  const [circles, setCircles, { removeItem: resetCircles }] =
    useLocalStorageState<number[][]>(`${storageKey}:circles`, {
      defaultValue: [],
    });

  // initialize two.js

  const divRef = useRef<HTMLDivElement>(null!);
  const twoRef = useRef<Two>(null!);
  const frameCount = useTwo(divRef, twoRef);
  const sceneSize = useRef<Vector>(new Vector(1920, 1080));

  // handle mouse events

  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useGesture(
    {
      onMove: ({ event }) => setMouse({ x: event.offsetX, y: event.offsetY }),
      onClick: ({ event }) => console.log("click", event),
    },
    { target: divRef }
  );

  useEffect(() => {
    const two = twoRef.current;
    const { x, y } = sceneSize.current;

    if (frameCount === 0) {
      two.clear();

      const bg = new Rectangle(0, 0, x, y);
      bg.fill = new Texture("/bg.jpg") as unknown as string;
      bg.linewidth = 0;
      bg.position.x = x / 2;
      bg.position.y = y / 2;
      two.add(bg);

      const circle = new Circle(0, 0, 20);
      circle.fill = "green";
      circle.linewidth = 0;
      two.add(circle);
    }

    const circle = (two.scene as Group).children[1] as Circle;
    circle.position.x = mouse.x;
    circle.position.y = mouse.y;
  }, [frameCount, mouse]);

  return <div ref={divRef}></div>;
}
