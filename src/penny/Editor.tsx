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

type PennyProps = {
  storageKey: string;
};

export default function Editor({ storageKey }: PennyProps) {
  const divRef = useRef<HTMLDivElement>(null!);

  // different circle sizes
  const radii = useRef([44, 34, 22, 13]);
  const [radius, setRadius] = useState(radii.current[0]);

  // store the circles
  const [circles, setCircles, { removeItem: resetCircles }] =
    useLocalStorageState<number[][]>(`${storageKey}:circles`, {
      defaultValue: [],
    });

  const { nextRadius, undo, reset } = useKeyState({
    nextRadius: "R",
    undo: "U",
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

  // U to remove the last circle
  useEffect(() => {
    if (!undo.pressed) {
      return;
    }
    setCircles((circles) => {
      circles.pop();
      return circles;
    });
  }, [undo, setCircles]);

  // shift+O to remove all circles
  useEffect(() => {
    if (!reset.pressed) {
      return;
    }
    resetCircles();
  }, [reset, resetCircles]);

  // mouse location
  const [mouse, setMouse] = useState<Vector>(new Vector());

  useGesture(
    {
      // save mouse location on move
      onMove: ({ event }) => {
        setMouse(new Vector(event.clientX, event.clientY));
      },
      // add a circle on click
      onClick: ({ event }) => {
        circles.push([radius, event.clientX, event.clientY]);
        setCircles([...circles]);
      },
    },
    { target: divRef }
  );

  // initialize two.js
  const [two] = useTwo(divRef);
  const sceneSize = useRef<Vector>(new Vector(1920, 1080));

  // set up the scene
  useEffect(() => {
    if (!two) {
      return;
    }

    if ((two.scene as Group).children.length) {
      return;
    }

    const { x: width, y: height } = sceneSize.current;

    two.clear();

    // background image
    const bg = new Rectangle(0, 0, width, height);
    bg.fill = new Texture("/bg.jpg") as unknown as string;
    bg.linewidth = 0;
    bg.position.x = width / 2;
    bg.position.y = height / 2;
    two.add(bg);

    // a group for holding the circles
    const circleGroup = new Group();
    two.add(circleGroup);

    // a circle cursor
    const cursor = new Circle(0, 0, 10);
    cursor.fill = "green";
    cursor.linewidth = 0;
    two.add(cursor);
  }, [two]);

  // track the mouse position with the cursor
  useEffect(() => {
    if (!two) {
      return;
    }

    const cursor = (two.scene as Group).children[2] as Circle;
    cursor.radius = radius;
    cursor.position.x = mouse.x;
    cursor.position.y = mouse.y;
  }, [two, mouse, radius]);

  // draw the clicked circles
  useEffect(() => {
    if (!two) {
      return;
    }

    const circleGroup = (two.scene as Group).children[1] as Group;
    while (circleGroup.children.length) {
      circleGroup.children[0].remove();
    }

    for (const coords of circles) {
      const circle = new Circle(coords[1], coords[2], coords[0]);
      circle.fill = "red";
      circle.linewidth = 0;
      circle.opacity = 0.5;
      circleGroup.add(circle);
    }
  }, [two, circles]);

  return <div ref={divRef}></div>;
}
