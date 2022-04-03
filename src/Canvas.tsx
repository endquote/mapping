import React, { useEffect, useRef } from "react";
import Two from "two.js";
import { Rectangle } from "two.js/src/shapes/rectangle";

export default function Canvas() {
  const domElement = useRef<HTMLDivElement>(null!);

  const two: Two = new Two({ fullscreen: true, autostart: true });
  let rect: Rectangle;

  const setup = () => {
    rect = two.makeRectangle(0, 0, 50, 50);
  };

  const update = () => {
    rect.position.x = two.width / 2;
    rect.position.y = two.height / 2;
    rect.rotation += 0.01;
  };

  useEffect(() => {
    const el = domElement.current;
    two.appendTo(el);
    setup();
    two.bind("update", update);

    return () => {
      two.unbind("update");
      two.pause();
      el.removeChild(two.renderer.domElement);
    };
  }, []);

  return <div ref={domElement} />;
}
