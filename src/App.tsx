import "./App.css";
import CornerPin from "./CornerPin";
import Scene from "./penny/WhiteLight";

const storageKey = "penny";

export default function App() {
  return (
    <CornerPin width={1920} height={1080} storageKey={storageKey}>
      <Scene storageKey={storageKey} />
    </CornerPin>
  );
}
