import React, { useEffect, useState } from "react";
import { getHeight, getWidth } from "./viewport";
import "./App.css";
import Canvas from "./Canvas";

export default function App() {
  const [isMobile, setIsMobile] = useState(window.navigator.maxTouchPoints > 0);
  const [width, setWidth] = useState(getWidth());
  const [height, setHeight] = useState(getHeight());

  function resize() {
    if (window.navigator.maxTouchPoints > 0) {
      document.oncontextmenu = () => false;
    }
    setIsMobile(window.navigator.maxTouchPoints > 0);
    setWidth(getWidth());
    setHeight(getHeight());
  }

  function pointermove(e: MouseEvent) {
    // var mouse = transposeEvent(e);
    // console.log(mouse.clientX, mouse.clientY);
  }

  useEffect(() => {
    window.addEventListener("resize", resize, false);
    window.addEventListener("orientationchange", resize, false);
    window.addEventListener("pointermove", pointermove, false);
    return () => {
      window.removeEventListener("resize", resize, false);
      window.removeEventListener("orientationchange", resize, false);
      window.removeEventListener("pointermove", pointermove, false);
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
