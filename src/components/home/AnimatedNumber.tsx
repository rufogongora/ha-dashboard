import { useEffect, useRef, useState } from "react";

const DURATION_MS = 900;

/** Eases from the previously shown value to the new one (from 0 on first
 * mount), so live numbers roll instead of jumping. */
export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : DURATION_MS;
    const from = fromRef.current;
    const startedAt = performance.now();
    let frame = 0;
    function step(now: number) {
      const p = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (value - from) * eased;
      fromRef.current = v;
      setShown(v);
      if (p < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{shown.toFixed(decimals)}</>;
}
