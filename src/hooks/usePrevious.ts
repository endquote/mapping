import { useEffect, useRef } from "react";

// https://stackoverflow.com/a/53446665/468472
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
