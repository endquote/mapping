import React from "react";
import "./App.css";
import CornerPin from "./CornerPin";
import Editor from "./penny/Editor";

const storageKey = "penny";

export default function App() {
  return (
    <CornerPin width={1920} height={1080} storageKey={storageKey}>
      <Editor storageKey={storageKey} />
    </CornerPin>
  );
}
