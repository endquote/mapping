import { MutableRefObject, useEffect, useRef, useState } from "react";
import Two from "two.js";
import { Group } from "two.js/src/group";

// initialize two.js and return the root group and other useful info
// [scene, frameCount, timeDelta, two] = useTwo(domElementRef)
export const useTwo = (
  divRef: MutableRefObject<HTMLDivElement>
): [Group, number, number, Two] => {
  const twoRef = useRef<Two>(null!);
  const sceneRef = useRef<Group>(new Group());

  const [frame, setFrame] = useState(0);
  const [timeDelta, setTimeDelta] = useState(0);

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

    two.add(sceneRef.current);
    two.appendTo(divRef.current);
    two.bind("update", () => {
      setFrame(two.frameCount);
      setTimeDelta(two.timeDelta);
    });

    return () => {
      two.clear();
      two.unbind("update");
      two.pause();
      div.removeChild(two.renderer.domElement);
    };
  }, [divRef, twoRef]);

  return [sceneRef.current, frame, timeDelta, twoRef.current];
};
