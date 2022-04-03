import React, { useEffect, useRef } from "react";
import Two from "two.js";

export default function Canvas() {
  const domElement = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const node = domElement.current;

    const two = new Two({
      fullscreen: true,
      autostart: true,
    }).appendTo(domElement.current);

    const rect = two.makeRectangle(two.width / 2, two.height / 2, 50, 50);

    const update = () => {
      rect.rotation += 0.01;
    };

    two.bind("update", update);

    return () => {
      two.unbind("update");
      two.pause();
      node.removeChild(two.renderer.domElement);
    };
  }, []);

  return <div ref={domElement} />;
}
