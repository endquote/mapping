import React from "react";
import "./App.css";
import CornerPin from "./CornerPin";
import Editor from "./penny/Editor";

export default function App() {
  return (
    <div>
      <CornerPin width={1920} height={1080} storageKey={"penny"}>
        <Editor storageKey={"penny"} />
      </CornerPin>
    </div>
  );
}
