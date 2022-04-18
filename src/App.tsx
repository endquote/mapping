import React from "react";
import "./App.css";
import CornerPin from "./CornerPin";
import Penny from "./Penny";

export default function App() {
  return (
    <div>
      <CornerPin width={1920} height={1080} storageKey={"penny"}>
        <Penny storageKey={"penny"} />
      </CornerPin>
    </div>
  );
}
