import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import Two from "two.js";
import { Anchor } from "two.js/src/anchor";
import { Texture } from "two.js/src/effects/texture";
import { Group } from "two.js/src/group";
import { Circle } from "two.js/src/shapes/circle";
import { Line } from "two.js/src/shapes/line";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";
import { useKeyState } from "use-key-state";
import useLocalStorageState from "use-local-storage-state";
import { useTwo } from "../hooks/useTwo";
import { seedRandom } from "../util/seedRandom";
import { coords } from "./coords";

type Penny = {
  v: Vector;
  r: number;
  c: Circle;
};

const dist = Two.Vector.distanceBetween;

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
    c.radius = 0.001; // gsap doesn't like when it starts from 0
    c.fill = "white";
    c.opacity = 1;

    return { r, v, c };
  });

export default function Editor(
  { storageKey }: { storageKey: string } = { storageKey: "penny" }
) {
  // initialize two.js
  const divRef = useRef<HTMLDivElement>(null!);
  const [scene] = useTwo(divRef);

  const sceneSize = useRef(new Vector(1920, 1080));
  const bgTexture = useRef(new Texture("/bg.jpg") as unknown as string);
  const debugLine = useRef(new Line());

  const lines = useRef<Penny[][]>([]);
  const timelines = useRef<gsap.core.Timeline[]>([]);

  const [currentLine, setCurrentLine] = useState(0);
  const [sceneInit, setSceneInit] = useState(false);

  // set up keyboard handling
  const { toggleBg } = useKeyState({ toggleBg: "B" });

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
      pennyGroup.add(c);
    }

    const { x: w, y: h } = sceneSize.current;
    const searchIncrement = 10;
    const minLength = 10;

    // find the pennies which overlap the edges of the scene
    const edges = pennies.filter(
      (p) =>
        p.v.x - p.r < 0 || p.v.y - p.r < 0 || p.v.x + p.r > w || p.v.y + p.r > h
    );

    // search for lines
    while (edges.length) {
      // pick an edge at random to start from
      const originIndex = Math.floor(seedRandom() * edges.length);
      const origin = edges[originIndex];
      edges.splice(originIndex, 1);

      // find the pennies close to the origin
      const neighbors = pennies
        .filter((p) => p != origin)
        .filter((p) => dist(p.v, origin.v) < p.r + origin.r + 5);

      let line: Penny[] = [];

      while (neighbors.length && line.length < minLength) {
        // pick a random one to set the line direction
        const neighborIndex = Math.floor(seedRandom() * neighbors.length);
        const neighbor = neighbors[neighborIndex];
        neighbors.splice(neighborIndex, 1);

        // determine the direction of the line as a normalized vector
        const direction = neighbor.v
          .clone()
          .sub(origin.v.x, origin.v.y)
          .normalize();

        line = [origin, neighbor];

        const target = neighbor.v.clone();

        // check at points in the direction of the line to find pennies that intersect
        while (
          target.x >= 0 &&
          target.y >= 0 &&
          target.x <= w &&
          target.y <= h
        ) {
          target.add(
            searchIncrement * direction.x,
            searchIncrement * direction.y
          );
          const hit = pennies.find((p) => dist(p.v, target) < p.r);
          if (!hit || line.includes(hit)) {
            continue;
          }
          line.push(hit);
        }
      }

      if (line.length >= minLength) {
        lines.current.push(line);
      }
    }

    // a line that should intesect each penny in the line
    debugLine.current.stroke = "pink";
    debugLine.current.linewidth = 2;
    scene.add(debugLine.current);

    setSceneInit(true);
  }, [scene]);

  // set up and begin the animations
  useEffect(() => {
    if (!sceneInit) {
      return;
    }

    for (const line of lines.current) {
      const i = lines.current.indexOf(line);
      const tl = gsap.timeline({ onStart: () => setCurrentLine(i) });
      for (const p of line) {
        tl.add(gsap.to(p.c, { radius: p.r, duration: 0.2 }), "-=.1");
      }
      for (const p of line) {
        tl.add(gsap.to(p.c, { radius: 0, duration: 0.2 }), "-=.1");
      }
      timelines.current.push(tl);
    }

    const tl = gsap
      .timeline({ onComplete: () => console.log("complete") })
      .timeScale(1);

    for (const line of timelines.current) {
      tl.add(line); //, `-=${lines.current[timelines.current.indexOf(line)].length*.1}`);
    }

    tl.play();
    console.log(`total duration: ${tl.duration()}`);
    // const inDurationRelativeToRadius = 0.8;
    // const outDurationRelativeToIn = 0.25;
    // const ease = "power2.out";

    // const maxRadius = [...line].sort((a, b) => a.r - b.r).pop()!.r;
    // const durations = line.map(
    //   (p) => (p.c.radius / maxRadius) * inDurationRelativeToRadius
    // );
  }, [sceneInit]);

  // update the debug view
  useEffect(() => {
    const line = lines.current[currentLine];
    if (!line) {
      return;
    }

    const timeline = timelines.current[currentLine];
    const duration = timeline ? timeline.duration() : 0;
    console.log(`${currentLine + 1}/${lines.current.length}, ${duration}`);
    const [origin, neighbor] = line;

    const direction = neighbor.v
      .clone()
      .sub(origin.v.x, origin.v.y)
      .normalize();

    const dlv = debugLine.current.vertices as Anchor[];
    dlv[0].x = origin.v.x;
    dlv[0].y = origin.v.y;
    dlv[1].x = origin.v.x + direction.x * 10000;
    dlv[1].y = origin.v.y + direction.y * 10000;
  }, [currentLine]);

  return <div ref={divRef}></div>;
}
