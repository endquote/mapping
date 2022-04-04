import React, { useEffect, useRef, useState } from "react";
import Two from "two.js";
import { Texture } from "two.js/src/effects/texture";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";

type Corner = "nw" | "ne" | "se" | "sw";

export default function Canvas() {
  const domElement = useRef<HTMLDivElement>(null!);
  const two: Two = new Two({ fullscreen: true, autostart: true });
  const size: Vector = new Vector(1920, 1080);
  const arrowKeys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];

  const [movingCorner, setMovingCorner] = useState<Corner | undefined>();
  // I don't totally understand the need for a ref https://stackoverflow.com/a/55265764
  const movingCornerRef = useRef(movingCorner);

  const cornerKeyMap: Record<string, Corner> = {
    KeyQ: "nw",
    KeyW: "ne",
    KeyA: "sw",
    KeyS: "se",
  };

  const [corners, setCorners] = useState<Record<Corner, Vector>>({
    nw: new Vector(-size.x / 2, -size.y / 2),
    ne: new Vector(size.x / 2, -size.y / 2),
    sw: new Vector(-size.x / 2, size.y / 2),
    se: new Vector(size.x / 2, size.y / 2),
  });

  let bg: Rectangle;

  const setup = () => {
    bg = two.makeRectangle(size.x / 2, size.y / 2, size.x, size.y);
    // TODO: Maybe file an issue on the fact that rect.fill taking a texture is not documented or typed
    // @ts-ignore
    bg.fill = new Texture("/bg.jpg");
  };

  const update = () => {};

  const onKeyUp = (e: KeyboardEvent) => {
    if (movingCornerRef.current && arrowKeys.includes(e.code)) {
      const amount = 10;
      const corner = corners[movingCornerRef.current];
      if (e.code === "ArrowUp") {
        corner.y -= amount;
      } else if (e.code === "ArrowRight") {
        corner.x += amount;
      } else if (e.code === "ArrowDown") {
        corner.y += amount;
      } else if (e.code === "ArrowLeft") {
        corner.x -= amount;
      }
      setCorners({ ...corners });
    } else {
      movingCornerRef.current = cornerKeyMap[e.code];
      setMovingCorner(cornerKeyMap[e.code]);
    }
    e.preventDefault();
  };

  useEffect(() => {
    console.log("movingCorner", movingCorner);
  }, [movingCorner]);

  useEffect(() => {
    console.log("corners", corners);
  }, [corners]);

  useEffect(() => {
    const el = domElement.current;
    two.appendTo(el);
    setup();
    two.bind("update", update);
    window.addEventListener("keyup", onKeyUp, false);

    return () => {
      two.unbind("update");
      two.pause();
      el.removeChild(two.renderer.domElement);
      window.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  return <div ref={domElement} />;
}
