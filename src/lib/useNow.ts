import { useEffect, useState } from "react";

/** The current time, refreshed every `intervalMs` — for clocks and
 * "open for 5 min"-style labels that need to tick without new HA data. */
export function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
