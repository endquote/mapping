import React, { useEffect, useState } from "react";
import { getWidth, getHeight, transposeEvent } from "./viewport";
import "./App.css";

export default function App() {
  const [isMobile, setIsMobile] = useState(window.navigator.maxTouchPoints > 0);
  const [width, setWidth] = useState(getWidth());
  const [height, setHeight] = useState(getHeight());

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

  function pointermove(e: MouseEvent) {
    // var mouse = transposeEvent(e);
    // console.log(mouse.clientX, mouse.clientY);
  }

  function resize() {
    if (window.navigator.maxTouchPoints > 0) {
      document.oncontextmenu = () => false;
    }
    setIsMobile(window.navigator.maxTouchPoints > 0);
    setWidth(getWidth());
    setHeight(getHeight());
  }

  return (
    <div
      style={{ width, height }}
      className={["App", isMobile ? "mobile" : ""].join(" ")}
    >
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
