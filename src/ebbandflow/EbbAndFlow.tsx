import CornerPin from "../CornerPin";
import Scene from "./Test";

const storageKey = "ebbandflow";

export default function EbbAndFlow() {
  return (
    <CornerPin width={1080} height={1920} storageKey={storageKey}>
      <Scene />
    </CornerPin>
  );
}
