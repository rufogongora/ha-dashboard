import { useEffect, useState } from "react";
import { useHa } from "../../ha/HaProvider";

const REFRESH_MS = 5 * 60 * 1000;

/** Compressed-state shape HA returns with minimal_response: s = state,
 * lu = last_updated in epoch seconds. */
type CompressedState = { s: string; lu: number };

/**
 * Recent numeric history for one sensor, averaged into evenly spaced time
 * buckets (carrying the last value forward through gaps) — sized for a
 * sparkline, not for analysis. Refetched every few minutes.
 */
export function useEntityHistory(
  entityId: string,
  hours = 6,
  buckets = 48,
): number[] | null {
  const { status, sendMessage } = useHa();
  const [series, setSeries] = useState<number[] | null>(null);

  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;

    async function load() {
      const end = Date.now();
      const start = end - hours * 3600 * 1000;
      try {
        const res = await sendMessage<Record<string, CompressedState[]>>({
          type: "history/history_during_period",
          start_time: new Date(start).toISOString(),
          entity_ids: [entityId],
          minimal_response: true,
          no_attributes: true,
          significant_changes_only: false,
        });
        const points = (res[entityId] ?? [])
          .map((p) => ({ t: p.lu * 1000, v: parseFloat(p.s) }))
          .filter((p) => Number.isFinite(p.v));
        if (!cancelled) setSeries(bucketize(points, start, end, buckets));
      } catch {
        if (!cancelled) setSeries(null);
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [entityId, hours, buckets, status, sendMessage]);

  return series;
}

function bucketize(
  points: { t: number; v: number }[],
  start: number,
  end: number,
  count: number,
): number[] | null {
  if (points.length === 0) return null;
  const size = (end - start) / count;
  const sums = new Array<number>(count).fill(0);
  const ns = new Array<number>(count).fill(0);
  for (const p of points) {
    const i = Math.min(count - 1, Math.max(0, Math.floor((p.t - start) / size)));
    sums[i] += p.v;
    ns[i] += 1;
  }
  const out: number[] = [];
  let last = points[0].v;
  for (let i = 0; i < count; i++) {
    if (ns[i] > 0) last = sums[i] / ns[i];
    out.push(last);
  }
  return out;
}
