import { HardDrive, Moon, Power } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import type { HassEntity } from "home-assistant-js-websocket";
import type { ComputerAction, ComputerMeter, CuratedComputer } from "../../config/computers";
import { useHa } from "../../ha/HaProvider";
import { useNow } from "../../lib/useNow";

const ACCENT = "#4f79c9";
const WARN = "#d9822b";
const DANGER = "#d14d5b";
const ONLINE = "#2fae7e";
const CONFIRM_MS = 3000;

function isLive(e: HassEntity | undefined) {
  return !!e && e.state !== "unavailable" && e.state !== "unknown";
}

function duration(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

function formatFact(e: HassEntity | undefined, format: "since" | "ago" | "value", now: Date) {
  if (!isLive(e)) return "—";
  if (format === "value") {
    const unit = e!.attributes.unit_of_measurement as string | undefined;
    return unit ? `${e!.state} ${unit}` : e!.state;
  }
  const t = new Date(e!.state).getTime();
  if (!Number.isFinite(t)) return "—";
  const ms = now.getTime() - t;
  if (format === "since") return duration(ms);
  return ms < 60_000 ? "just now" : `${duration(ms)} ago`;
}

/** A metric as a 0–100 bar: percentages as-is; temperatures scaled to a
 * rough "how hot" range so the bar still reads at a glance. */
function meterReading(e: HassEntity | undefined, meter: ComputerMeter) {
  if (!isLive(e)) return null;
  const raw = Number(meter.attribute ? e!.attributes[meter.attribute] : parseFloat(e!.state));
  const v = meter.invert ? 100 - raw : raw;
  if (!Number.isFinite(v)) return null;
  const unit = meter.attribute ? "%" : ((e!.attributes.unit_of_measurement as string | undefined) ?? "");
  if (unit === "°F" || unit === "°C") {
    const c = unit === "°F" ? ((v - 32) * 5) / 9 : v;
    // A sensor stuck at exactly 0 °C isn't actually reading anything.
    if (c === 0) return null;
    const pct = Math.min(100, Math.max(0, ((c - 30) / (95 - 30)) * 100));
    return { text: `${Math.round(v)}${unit}`, pct, warn: c >= 75, danger: c >= 88 };
  }
  const pct = Math.min(100, Math.max(0, v));
  const text = `${Math.round(v)}${unit.startsWith("%") ? "%" : unit}`;
  return meter.lowIsBad
    ? { text, pct, warn: v <= 20, danger: v <= 10 }
    : { text, pct, warn: v >= 75, danger: v >= 90 };
}

function Bar({
  meter,
  entity,
  icon,
}: {
  meter: ComputerMeter;
  entity: HassEntity | undefined;
  icon?: boolean;
}) {
  const r = meterReading(entity, meter);
  const color = r?.danger ? DANGER : r?.warn ? WARN : ACCENT;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="flex items-center gap-1.5 text-text-dim">
          {icon && <HardDrive size={13} />}
          {meter.label}
        </span>
        <span className="font-semibold tabular-nums text-text" style={r?.warn ? { color } : undefined}>
          {r?.text ?? "—"}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-text-dim/20">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${r?.pct ?? 0}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ActionButton({ action }: { action: ComputerAction }) {
  const { callService } = useHa();
  const [armed, setArmed] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), CONFIRM_MS);
    return () => clearTimeout(t);
  }, [armed]);

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), CONFIRM_MS);
    return () => clearTimeout(t);
  }, [sent]);

  function onClick() {
    navigator.vibrate?.(12);
    if (action.confirm && !armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    callService(action.domain, action.service, {}, { entity_id: action.entityId })
      .then(() => setSent(true))
      .catch(() => {});
  }

  const Icon = action.icon ?? (action.when === "offline" ? Power : Moon);
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-[background-color,color,transform] active:scale-95",
        armed ? "text-white" : "text-text",
      )}
      style={{ background: armed ? DANGER : "var(--chip-off)" }}
    >
      <Icon size={15} />
      {sent ? `${action.label} sent` : armed ? `Tap again to ${action.label.toLowerCase()}` : action.label}
    </button>
  );
}

export function ComputerCard({ computer, index }: { computer: CuratedComputer; index: number }) {
  const { entities } = useHa();
  const now = useNow(30_000);
  const ids = [
    computer.onlineEntity,
    ...computer.meters.map((m) => m.entityId),
    ...computer.facts.map((f) => f.entityId),
    ...(computer.disks ?? []).map((d) => d.entityId),
  ];
  const configured = ids.some((id) => entities[id]);
  const ping = computer.pingEntity ? entities[computer.pingEntity] : undefined;
  const online = isLive(entities[computer.onlineEntity]) && ping?.state !== "off";
  const activity = computer.activity;
  const active = activity ? entities[activity.entityId]?.state === "on" : online;
  const pillText = activity ? (active ? activity.on : activity.off) : online ? "Online" : "Offline";
  const badges = (computer.badges ?? []).filter((b) => entities[b.entityId]?.state === "on");
  const actions = (computer.actions ?? []).filter((a) => a.when === (online ? "online" : "offline"));

  return (
    <div
      className="glass rise flex flex-col gap-4 rounded-[26px] p-5"
      style={{ animationDelay: `${100 + index * 70}ms` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: "#dce9fd", color: ACCENT }}
        >
          <computer.icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[19px] font-semibold tracking-[-0.3px] text-text">{computer.name}</div>
          <div className="text-[13px] text-text-dim">{computer.subtitle}</div>
        </div>
        {configured && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-text-dim">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: active ? ONLINE : "#9aa1b5",
                boxShadow: active ? `0 0 0 3px ${ONLINE}33` : undefined,
              }}
            />
            {pillText}
          </span>
        )}
      </div>

      {!configured ? (
        <p className="text-[13px] text-text-dim">{computer.setupHint}</p>
      ) : (
        <>
          {online && (
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              {computer.meters.map((m) => (
                <Bar key={m.entityId + (m.attribute ?? "")} meter={m} entity={entities[m.entityId]} />
              ))}
            </div>
          )}

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <span
                  key={b.entityId}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: "#ffe3e7", color: "#b4344a" }}
                >
                  <span className="live-dot h-[7px] w-[7px] rounded-full bg-[#ff4d4f]" />
                  {b.label}
                </span>
              ))}
            </div>
          )}

          {computer.disks && computer.disks.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-text-dim/15 pt-4">
              {computer.disks.map((d) => (
                <Bar key={d.entityId + (d.attribute ?? "")} meter={d} entity={entities[d.entityId]} icon />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
            {/* "Up 3 d" is meaningless while it's off; "Last active" still is. */}
            {computer.facts
              .filter((f) => online || f.format !== "since")
              .map((f) => (
                <span key={f.entityId + f.label} className="text-text-dim">
                  {f.label}{" "}
                  <span className="font-semibold text-text">
                    {formatFact(entities[f.entityId], f.format, now)}
                  </span>
                </span>
              ))}
          </div>

          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((a) => (
                <ActionButton key={a.entityId} action={a} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
