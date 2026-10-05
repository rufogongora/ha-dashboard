import { Gamepad2 } from "lucide-react";
import { GAMING } from "../../config/gaming";
import { useHa } from "../../ha/HaProvider";
import { useNow } from "../../lib/useNow";
import { useStateHistory, type StatePoint } from "../home/useStateHistory";

const ACCENT = "#0070d1"; // PlayStation blue
const TINT = "#d3e6fb";
const DAYS = 7;

/** 1.42 h -> "1 h 25 min", 0.2 h -> "12 min". */
function hm(hours: number) {
  const mins = Math.round(hours * 60);
  if (mins < 60) return `${mins} min`;
  return mins % 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins / 60} h`;
}

/**
 * Hours spent in an "active" state per local day for the last DAYS days
 * (oldest first, today last), splitting sessions that cross midnight.
 */
function dailyHours(points: StatePoint[], active: string[], now: Date) {
  const midnights: number[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    midnights.push(d.getTime());
  }
  const totals = new Array<number>(DAYS).fill(0);
  points.forEach((p, i) => {
    if (!active.includes(p.state)) return;
    const start = Math.max(p.t, midnights[0]);
    const end = i + 1 < points.length ? points[i + 1].t : now.getTime();
    midnights.forEach((m, d) => {
      const dayEnd = d + 1 < DAYS ? midnights[d + 1] : now.getTime();
      const overlap = Math.min(end, dayEnd) - Math.max(start, m);
      if (overlap > 0) totals[d] += overlap / 3600000;
    });
  });
  return { totals, midnights };
}

function WeekChart({ totals, midnights }: { totals: number[]; midnights: number[] }) {
  const max = Math.max(1, ...totals);
  return (
    <div className="flex h-28 items-end gap-2">
      {totals.map((h, i) => {
        const today = i === totals.length - 1;
        return (
          <div key={midnights[i]} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-semibold tabular-nums text-text-dim">
              {h >= 0.05 ? (h >= 1 ? `${h.toFixed(1)}h` : `${Math.round(h * 60)}m`) : ""}
            </span>
            <div className="flex h-16 w-full items-end">
              <div
                className="w-full rounded-md transition-[height] duration-700"
                style={{
                  height: `${Math.max(h > 0 ? 6 : 2, (h / max) * 100)}%`,
                  background: today ? ACCENT : `color-mix(in srgb, ${ACCENT} 45%, transparent)`,
                }}
              />
            </div>
            <span className={`text-[11px] ${today ? "font-bold text-text" : "text-text-dim"}`}>
              {today ? "Today" : new Date(midnights[i]).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function lastSeen(iso: string | undefined, now: Date) {
  if (!iso) return null;
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return null;
  const time = t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  if (t.getTime() >= startOfToday.getTime()) return `today ${time}`;
  if (t.getTime() >= startOfToday.getTime() - 86400000) return `yesterday ${time}`;
  return `${t.toLocaleDateString(undefined, { weekday: "short" })} ${time}`;
}

/** Andy's console time: what he's on now, today, this week, and 7 days. */
export function GamingCard({ index = 0 }: { index?: number }) {
  const { entities, hassUrl } = useHa();
  const now = useNow(60_000);
  const { ps5 } = GAMING;
  const history = useStateHistory([ps5.player], DAYS * 24);
  const player = entities[ps5.player];
  if (!player) return null;

  const state = player.state;
  const active = ps5.activeStates.includes(state);
  const title = player.attributes.media_title as string | undefined;
  const cover = player.attributes.entity_picture as string | undefined;
  const today = parseFloat(entities[ps5.today]?.state ?? "");
  const week = parseFloat(entities[ps5.week]?.state ?? "");
  const seen = lastSeen(entities[ps5.lastOnline]?.state, now);

  const points = history?.[ps5.player] ?? [];
  const chart = history ? dailyHours(points, ps5.activeStates, now) : null;
  // A brand-new integration has no history yet; say so instead of showing
  // a misleadingly empty week.
  const trackingSince = points[0]?.t;
  const partial = chart && trackingSince !== undefined && trackingSince > chart.midnights[0] + 3600000;

  return (
    <div
      className="glass rise flex flex-col gap-4 rounded-[26px] p-5"
      style={{ background: `color-mix(in srgb, ${TINT} var(--tint-strength), var(--glass))`, animationDelay: `${100 + index * 70}ms` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: "var(--chip-off)", color: ACCENT }}
        >
          <Gamepad2 size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[19px] font-semibold tracking-[-0.3px] text-text">{GAMING.kid}'s gaming</div>
          <div className="truncate text-[13px] text-text-dim">
            {state === "playing"
              ? `Playing on PS5 now`
              : active
                ? "Online on PS5"
                : seen
                  ? `Last on PS5 ${seen}`
                  : "Not playing"}
          </div>
        </div>
        {active && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-text-dim">
            <span className="live-dot h-2 w-2 rounded-full" style={{ background: ACCENT }} />
            Live
          </span>
        )}
      </div>

      {active && title && (
        <div className="flex items-center gap-3 rounded-2xl p-2.5" style={{ background: "var(--chip-off)" }}>
          {cover && <img src={`${hassUrl ?? ""}${cover}`} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />}
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">Now playing</div>
            <div className="truncate text-[15px] font-semibold text-text">{title}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl px-3.5 py-3" style={{ background: "var(--chip-off)" }}>
          <div className="text-xs text-text-dim">Today</div>
          <div className="text-[26px] font-light leading-tight tracking-[-0.5px] tabular-nums text-text">
            {Number.isFinite(today) ? hm(today) : "—"}
          </div>
          <div className="text-xs text-text-dim">PS5</div>
        </div>
        <div className="rounded-2xl px-3.5 py-3" style={{ background: "var(--chip-off)" }}>
          <div className="text-xs text-text-dim">This week</div>
          <div className="text-[26px] font-light leading-tight tracking-[-0.5px] tabular-nums text-text">
            {Number.isFinite(week) ? hm(week) : "—"}
          </div>
          <div className="text-xs text-text-dim">since Monday</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">Last 7 days</div>
        {chart ? <WeekChart totals={chart.totals} midnights={chart.midnights} /> : <div className="h-28 animate-pulse rounded-2xl bg-chip" />}
        {partial && (
          <p className="text-xs text-text-dim">
            Tracking started {lastSeen(new Date(trackingSince!).toISOString(), now)} — earlier days fill in as he plays.
          </p>
        )}
      </div>
    </div>
  );
}
