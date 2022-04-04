import React, { useEffect, useState } from "react";
import "./App.css";
import Canvas from "./Canvas";
import { getHeight, getWidth } from "./viewport";

// from two.js sample
// https://codesandbox.io/s/sharp-proskuriakova-h5weu

export default function App() {
  const [isMobile, setIsMobile] = useState(window.navigator.maxTouchPoints > 0);
  const [width, setWidth] = useState(getWidth());
  const [height, setHeight] = useState(getHeight());

  const onResize = () => {
    if (window.navigator.maxTouchPoints > 0) {
      document.oncontextmenu = () => false;
    }
    setIsMobile(window.navigator.maxTouchPoints > 0);
    setWidth(getWidth());
    setHeight(getHeight());
  };

  const onPointerMove = (e: MouseEvent) => {
    // var mouse = transposeEvent(e);
    // console.log(mouse.clientX, mouse.clientY);
  };

  useEffect(() => {
    window.addEventListener("resize", onResize, false);
    window.addEventListener("orientationchange", onResize, false);
    window.addEventListener("pointermove", onPointerMove, false);

    return () => {
      window.removeEventListener("resize", onResize, false);
      window.removeEventListener("orientationchange", onResize, false);
      window.removeEventListener("pointermove", onPointerMove, false);
    };
  }, []);

  return (
    <div
      style={{ width, height }}
      className={["App", isMobile ? "mobile" : ""].join(" ")}
    >
      <Canvas />
    </div>
  );
}
