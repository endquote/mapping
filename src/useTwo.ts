import { MutableRefObject, useEffect, useState } from "react";
import Two from "two.js";

export function useTwo(
  divRef: MutableRefObject<HTMLDivElement>,
  twoRef: MutableRefObject<Two>
) {
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    if (twoRef.current) {
      Two.Instances = Two.Instances.filter((i) => i !== twoRef.current);
    }

    twoRef.current = new Two({
      fullscreen: true,
      autostart: true,
      type: Two.Types.svg,
    });

    const two = twoRef.current;
    const div = divRef.current;

    two.appendTo(divRef.current);
    two.bind("update", () => setFrameCount(two.frameCount));

    return () => {
      two.clear();
      two.unbind("update");
      two.pause();
      div.removeChild(two.renderer.domElement);
    };
  }, [divRef, twoRef]);

  return frameCount;
}
