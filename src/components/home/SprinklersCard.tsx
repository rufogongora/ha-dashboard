import { CloudRain, Droplets, Pause, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { CURATED_SPRINKLERS as S } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { useNow } from "../../lib/useNow";

const ACCENT = "#2f8fd1";
const TINT = "#d6ecfb";
const CONFIRM_MS = 3000;

function minutesSince(iso: string, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60000));
}

/** Toggle pill for the controller-wide switches (rain delay, standby). */
function Pill({
  on,
  label,
  onLabel,
  icon: Icon,
  onClick,
}: {
  on: boolean;
  label: string;
  onLabel: string;
  icon: typeof Pause;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors active:scale-95"
      style={on ? { background: ACCENT, color: "#fff" } : { background: "var(--chip-off)", color: "var(--color-text)" }}
    >
      <Icon size={14} />
      {on ? onLabel : label}
    </button>
  );
}

/**
 * The Rachio controller: what's watering, run any zone for a few minutes,
 * stop, pause everything for 24 h (rain delay) or indefinitely (standby),
 * and start one of its schedules (tap twice).
 */
export function SprinklersCard({ index = 0 }: { index?: number }) {
  const { entities, callService } = useHa();
  const now = useNow(30_000);
  const [armedSchedule, setArmedSchedule] = useState<string | null>(null);

  useEffect(() => {
    if (!armedSchedule) return;
    const t = setTimeout(() => setArmedSchedule(null), CONFIRM_MS);
    return () => clearTimeout(t);
  }, [armedSchedule]);

  const zones = S.zones.filter((z) => entities[z.entityId]);
  if (zones.length === 0) return null;

  const running = zones.find((z) => entities[z.entityId]?.state === "on");
  const runningSchedule = S.schedules.find((s) => entities[s.entityId]?.state === "on");
  const rainDelay = entities[S.rainDelay]?.state === "on";
  const standby = entities[S.standby]?.state === "on";
  const wet = entities[S.rainSensor]?.state === "on";

  function call(domain: string, service: string, entityId: string, data: Record<string, unknown> = {}) {
    navigator.vibrate?.(12);
    callService(domain, service, data, { entity_id: entityId }).catch(() => {});
  }

  const status = running
    ? `Watering ${running.name} · ${minutesSince(entities[running.entityId]!.last_changed, now)} min`
    : runningSchedule
      ? `Running ${runningSchedule.name}`
      : standby
        ? "Standby — won't water"
        : rainDelay
          ? "Rain delay — skipping the next 24 h"
          : "Idle";

  return (
    <div
      className="glass rise flex flex-col gap-4 rounded-[26px] p-5"
      style={{ background: `color-mix(in srgb, ${TINT} var(--tint-strength), var(--glass))`, animationDelay: `${300 + index * 50}ms` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: "var(--chip-off)", color: ACCENT }}
        >
          <Droplets size={22} className={clsx(running && "animate-pulse")} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[19px] font-semibold tracking-[-0.3px] text-text">Sprinklers</div>
          <div className="truncate text-[13px] text-text-dim">{status}</div>
        </div>
        {wet && (
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: TINT, color: "#1d6aa0" }}>
            <CloudRain size={13} /> Rain detected
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {zones.map((z) => {
          const on = entities[z.entityId]?.state === "on";
          return (
            <div key={z.entityId} className="flex items-center gap-2 border-b border-text-dim/15 py-2 last:border-0">
              <span className={clsx("min-w-0 flex-1 truncate text-sm font-medium", on ? "font-semibold" : "text-text")} style={on ? { color: ACCENT } : undefined}>
                {z.name}
              </span>
              {on ? (
                <button
                  onClick={() => call("switch", "turn_off", z.entityId)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white active:scale-95"
                  style={{ background: ACCENT }}
                >
                  <Square size={12} /> Stop
                </button>
              ) : (
                S.runMinutes.map((m) => (
                  <button
                    key={m}
                    onClick={() => call("rachio", "start_watering", z.entityId, { duration: m })}
                    disabled={standby}
                    className="rounded-full px-2.5 py-1.5 text-xs font-semibold tabular-nums text-text active:scale-95 disabled:opacity-40"
                    style={{ background: "var(--chip-off)" }}
                    title={`Water ${z.name} for ${m} minutes`}
                  >
                    {m}m
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Pill
          on={rainDelay}
          label="Skip 24 h"
          onLabel="Skipping 24 h"
          icon={CloudRain}
          onClick={() => call("switch", rainDelay ? "turn_off" : "turn_on", S.rainDelay)}
        />
        <Pill
          on={standby}
          label="Standby"
          onLabel="On standby"
          icon={Pause}
          onClick={() => call("switch", standby ? "turn_off" : "turn_on", S.standby)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">Run a schedule</div>
        <div className="flex flex-wrap gap-1.5">
          {S.schedules
            .filter((s) => entities[s.entityId])
            .map((s) => {
              const on = entities[s.entityId]?.state === "on";
              const armed = armedSchedule === s.entityId;
              return (
                <button
                  key={s.entityId}
                  onClick={() => {
                    if (on) return call("switch", "turn_off", s.entityId);
                    if (!armed) {
                      navigator.vibrate?.(8);
                      return setArmedSchedule(s.entityId);
                    }
                    setArmedSchedule(null);
                    call("switch", "turn_on", s.entityId);
                  }}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors active:scale-95"
                  style={
                    on || armed
                      ? { background: ACCENT, color: "#fff" }
                      : { background: "var(--chip-off)", color: "var(--color-text)" }
                  }
                >
                  {on ? <Square size={11} /> : <Play size={11} />}
                  {on ? `Stop ${s.name}` : armed ? `Tap again to run` : s.name}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
