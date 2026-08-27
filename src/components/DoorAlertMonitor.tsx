import { useEffect, useRef, useState } from "react";
import { CURATED_DOOR_SENSORS, DOOR_ALERT_THRESHOLD_MS } from "../config/curatedHome";
import { useHa } from "../ha/HaProvider";
import { playAlarm, stopAlarm } from "../lib/alarmSound";
import { DoorAlertModal } from "./DoorAlertModal";

const CHECK_INTERVAL_MS = 10_000;

/**
 * Global, route-independent watcher — mounted once at the app root so a door
 * left open still alerts no matter which screen is showing. Re-checks on a
 * timer (not just on entity change) since "open for N minutes" only becomes
 * true as time passes, without any new state event to react to.
 */
export function DoorAlertMonitor() {
  const { entities } = useHa();
  const [openTooLong, setOpenTooLong] = useState<string[]>([]);
  // Silencing a door sticks until it actually closes (and not just for the
  // current alert), so it doesn't immediately re-open the modal on the next
  // 10s check while still open.
  const silencedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function check() {
      const now = Date.now();
      const result: string[] = [];
      for (const door of CURATED_DOOR_SENSORS) {
        const ent = entities[door.entityId];
        if (!ent) continue;
        if (ent.state !== "on") {
          silencedRef.current.delete(door.entityId);
          continue;
        }
        const openedAt = new Date(ent.last_changed).getTime();
        if (now - openedAt >= DOOR_ALERT_THRESHOLD_MS && !silencedRef.current.has(door.entityId)) {
          result.push(door.entityId);
        }
      }
      setOpenTooLong(result);
    }

    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [entities]);

  const alerting = openTooLong.length > 0;
  useEffect(() => {
    if (alerting) playAlarm();
    else stopAlarm();
  }, [alerting]);
  useEffect(() => stopAlarm, []);

  function dismiss(entityId: string) {
    silencedRef.current.add(entityId);
    setOpenTooLong((prev) => prev.filter((id) => id !== entityId));
  }

  function dismissAll() {
    for (const id of openTooLong) silencedRef.current.add(id);
    setOpenTooLong([]);
  }

  if (!alerting) return null;
  return <DoorAlertModal doorIds={openTooLong} onDismiss={dismiss} onDismissAll={dismissAll} />;
}
