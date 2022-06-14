import CornerPin from "../CornerPin";
import Scene from "./WhiteLight";

const storageKey = "penny";

export default function PennyRound() {
  return (
    <CornerPin width={1920} height={1080} storageKey={storageKey}>
      <Scene storageKey={storageKey} />
    </CornerPin>
  );
}
