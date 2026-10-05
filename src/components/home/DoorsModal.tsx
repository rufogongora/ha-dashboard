import { DoorClosed, DoorOpen } from "lucide-react";
import { CURATED_DOOR_SENSORS, DOOR_ALERT_THRESHOLD_MS } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { useNow } from "../../lib/useNow";
import { Sheet, SheetSection } from "./Sheet";
import { useStateHistory, type StatePoint } from "./useStateHistory";

const LOG_DAYS = 7;
const LOG_LIMIT = 80;
const OPEN = "#d9822b";
const CLOSED = "#2fae7e";

interface Opening {
  door: string;
  start: number;
  /** null while it's still open. */
  end: number | null;
  /** Already open when the history window began, so the start is a floor. */
  clipped: boolean;
}

/** Turns a binary sensor's state changes into open → closed intervals. */
function openings(door: string, points: StatePoint[]): Opening[] {
  const out: Opening[] = [];
  let current: Opening | null = null;
  points.forEach((p, i) => {
    if (p.state === "on" && !current) {
      current = { door, start: p.t, end: null, clipped: i === 0 };
    } else if (p.state !== "on" && current) {
      current.end = p.t;
      out.push(current);
      current = null;
    }
  });
  if (current) out.push(current);
  return out;
}

function duration(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "under a minute";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return mins % 60 ? `${h} h ${mins % 60} min` : `${h} h`;
}

function dayLabel(t: number, now: Date) {
  const d = new Date(t);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

/** "today at 5:12 PM", "yesterday at 9:03 AM", "Mon at 7:40 PM". */
function when(t: number, now: Date) {
  const day = dayLabel(t, now);
  const prefix =
    day === "Today" || day === "Yesterday"
      ? day.toLowerCase()
      : new Date(t).toLocaleDateString(undefined, { weekday: "short" });
  return `${prefix} at ${time(t)}`;
}

function time(t: number) {
  return new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function DoorsModal({ onClose }: { onClose: () => void }) {
  const { entities } = useHa();
  const now = useNow(30_000);
  const history = useStateHistory(
    CURATED_DOOR_SENSORS.map((d) => d.entityId),
    LOG_DAYS * 24,
  );

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const all = history
    ? CURATED_DOOR_SENSORS.flatMap((d) => openings(d.label, history[d.entityId] ?? []))
    : [];
  const log = [...all].sort((a, b) => b.start - a.start).slice(0, LOG_LIMIT);
  const openNow = CURATED_DOOR_SENSORS.filter((d) => entities[d.entityId]?.state === "on").length;

  // Group the log under day headings.
  const groups: { day: string; items: Opening[] }[] = [];
  for (const o of log) {
    const day = dayLabel(o.start, now);
    if (groups.at(-1)?.day !== day) groups.push({ day, items: [] });
    groups.at(-1)!.items.push(o);
  }

  return (
    <Sheet
      title="Doors"
      subtitle={openNow === 0 ? "All closed" : `${openNow} open right now`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-2">
        {CURATED_DOOR_SENSORS.map((d) => {
          const entity = entities[d.entityId];
          const isOpen = entity?.state === "on";
          const unknown = !entity || entity.state === "unavailable" || entity.state === "unknown";
          const mine = all.filter((o) => o.door === d.label);
          const last = mine.at(-1);
          const today = mine.filter((o) => o.start >= startOfToday.getTime()).length;
          return (
            <div key={d.entityId} className="flex items-center gap-3 rounded-2xl bg-chip px-3.5 py-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: isOpen ? "#ffe2c2" : "#d8f3e6", color: isOpen ? OPEN : CLOSED }}
              >
                {isOpen ? <DoorOpen size={20} /> : <DoorClosed size={20} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-text">{d.label}</span>
                  <span className="shrink-0 text-xs font-semibold" style={{ color: unknown ? undefined : isOpen ? OPEN : CLOSED }}>
                    {unknown
                      ? "No signal"
                      : isOpen
                        ? `Open ${duration(now.getTime() - new Date(entity!.last_changed).getTime())}`
                        : "Closed"}
                  </span>
                </div>
                <div className="truncate text-xs text-text-dim">
                  {!history
                    ? "Loading…"
                    : last
                      ? `Last opened ${when(last.start, now)}${last.end ? ` · open ${duration(last.end - last.start)}` : ""} · ${today} today, ${mine.length} this week`
                      : `Not opened in the last ${LOG_DAYS} days`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SheetSection title={`Last ${LOG_DAYS} days`}>
        {!history ? (
          <div className="h-24 animate-pulse rounded-2xl bg-chip" />
        ) : log.length === 0 ? (
          <div className="text-sm text-text-dim">No doors opened.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((g) => (
              <div key={g.day} className="flex flex-col">
                <div className="mb-1 text-xs font-semibold text-text-dim">{g.day}</div>
                {g.items.map((o) => {
                  const length = (o.end ?? now.getTime()) - o.start;
                  const long = length >= DOOR_ALERT_THRESHOLD_MS;
                  return (
                    <div
                      key={o.door + o.start}
                      className="flex items-center gap-3 border-b border-border py-2 text-[13px] last:border-0"
                    >
                      <span className="w-[68px] shrink-0 tabular-nums text-text-dim">
                        {o.clipped ? "before" : time(o.start)}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-text">{o.door}</span>
                      <span
                        className="shrink-0 tabular-nums"
                        style={{ color: o.end === null ? OPEN : long ? OPEN : undefined }}
                      >
                        {o.end === null ? `open ${duration(length)}` : duration(length)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-text-dim">
          Times in amber were open longer than the {DOOR_ALERT_THRESHOLD_MS / 60000}-minute alarm.
        </p>
      </SheetSection>
    </Sheet>
  );
}
