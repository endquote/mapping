import { useGesture } from "@use-gesture/react";
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

type Penny = { v: Vector; r: number; c: Circle };

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
  const debugLine = useRef(new Line());
  const edges = useRef<Penny[]>([]);

  const [click, setClick] = useState(0);

  useGesture(
    {
      onClick: () => setClick((click) => click + 1),
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

    debugLine.current.stroke = "pink";
    debugLine.current.linewidth = 2;
    scene.add(debugLine.current);
  }, [scene]);

  useEffect(() => {
    pennies.forEach((p) => {
      p.c.fill = "red";
    });

    const dlv = debugLine.current.vertices as Anchor[];
    const { x: w, y: h } = sceneSize.current;

    let line: Penny[] = [];

    while (line.length < 10) {
      // find the pennies which overlap the edges of the scene
      if (!edges.current.length) {
        edges.current = pennies.filter(
          (p) =>
            p.v.x - p.r < 0 ||
            p.v.y - p.r < 0 ||
            p.v.x + p.r > w ||
            p.v.y + p.r > h
        );
      }

      // pick an edge at random to start from
      const originIndex = Math.floor(seedRandom() * edges.current.length);
      const origin = edges.current[originIndex];
      edges.current.splice(originIndex, 1);

      dlv[0].x = dlv[1].x = origin.v.x;
      dlv[0].y = dlv[1].y = origin.v.y;

      // find the pennies close to the origin
      const neighbors = pennies
        .filter((p) => p != origin)
        .filter((p) => dist(p.v, origin.v) < p.r + origin.r + 5);

      // pick a random one to set the line direction
      const neighbor = neighbors[Math.floor(seedRandom() * neighbors.length)];

      // determine the direction of the line as a normalized vector
      const direction = neighbor.v
        .clone()
        .sub(origin.v.x, origin.v.y)
        .normalize();

      line = [origin, neighbor];

      const target = neighbor.v.clone();
      const inc = 10;

      // check at points in the direction of the line to find pennies that intersect
      while (target.x >= 0 && target.y >= 0 && target.x <= w && target.y <= h) {
        target.add(inc * direction.x, inc * direction.y);
        const hit = pennies.find((p) => dist(p.v, target) < p.r);
        if (!hit || line.includes(hit)) {
          continue;
        }
        dlv[1].x = target.x;
        dlv[1].y = target.y;
        line.push(hit);
      }
    }

    line.forEach((p) => (p.c.fill = "green"));
  }, [click]);

  return <div ref={divRef}></div>;
}
