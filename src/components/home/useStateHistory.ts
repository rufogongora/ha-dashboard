import { useEffect, useState } from "react";
import { useHa } from "../../ha/HaProvider";

export interface StatePoint {
  state: string;
  /** Epoch ms the state took effect. */
  t: number;
}

/** HA's compressed history format: s = state, lc/lu = last changed /
 * updated in epoch seconds (lc is omitted when it equals lu). */
type Compressed = { s: string; lc?: number; lu: number };

/**
 * Raw state changes for some entities over the last `hours`, fetched once
 * when the caller mounts (the detail sheets) — for logs and timelines,
 * where useEntityHistory's averaged buckets would lose the actual events.
 */
export function useStateHistory(entityIds: string[], hours: number) {
  const { sendMessage } = useHa();
  const [history, setHistory] = useState<Record<string, StatePoint[]> | null>(null);
  const key = entityIds.join(",");

  useEffect(() => {
    let cancelled = false;
    sendMessage<Record<string, Compressed[]>>({
      type: "history/history_during_period",
      start_time: new Date(Date.now() - hours * 3600 * 1000).toISOString(),
      entity_ids: key.split(","),
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false,
    })
      .then((res) => {
        if (cancelled) return;
        const out: Record<string, StatePoint[]> = {};
        for (const [id, points] of Object.entries(res)) {
          out[id] = points.map((p) => ({ state: p.s, t: (p.lc ?? p.lu) * 1000 }));
        }
        setHistory(out);
      })
      .catch(() => {
        if (!cancelled) setHistory({});
      });
    return () => {
      cancelled = true;
    };
  }, [key, hours, sendMessage]);

  return history;
}
