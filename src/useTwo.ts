import { MutableRefObject, useEffect, useRef, useState } from "react";
import Two from "two.js";

export function useTwo(divRef: MutableRefObject<HTMLDivElement>): [Two, number] {
  const [frame, setFrame] = useState(0);
  const twoRef = useRef<Two>(null!);

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
    two.bind("update", () => setFrame(two.frameCount));

    return () => {
      two.clear();
      two.unbind("update");
      two.pause();
      div.removeChild(two.renderer.domElement);
    };
  }, [divRef, twoRef]);

  return [twoRef.current, frame];
}
