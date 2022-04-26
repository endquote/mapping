import React from "react";
import "./App.css";
import CornerPin from "./CornerPin";
import WhiteLight from "./penny/WhiteLight";

const storageKey = "penny";

export default function App() {
  return (
    <CornerPin width={1920} height={1080} storageKey={storageKey}>
      <WhiteLight storageKey={storageKey} />
    </CornerPin>
  );
}
