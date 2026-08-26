import {
  Droplets,
  Fan,
  Flame,
  Minus,
  Plus,
  Power,
  Snowflake,
  Thermometer,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useHa } from "../../ha/HaProvider";
import { clsx } from "clsx";

const MODE_META: Record<string, { icon: LucideIcon; label: string }> = {
  off: { icon: Power, label: "Off" },
  heat: { icon: Flame, label: "Heat" },
  cool: { icon: Snowflake, label: "Cool" },
  heat_cool: { icon: Thermometer, label: "Heat/Cool" },
  auto: { icon: Thermometer, label: "Auto" },
  fan_only: { icon: Fan, label: "Fan" },
  dry: { icon: Droplets, label: "Dry" },
};

function modeMeta(mode: string) {
  return MODE_META[mode] ?? { icon: Thermometer, label: mode };
}

export function ClimateControlModal({
  entityId,
  onClose,
}: {
  entityId: string;
  onClose: () => void;
}) {
  const { entities, callService } = useHa();
  const entity = entities[entityId];

  if (!entity) return null;

  const attrs = entity.attributes;
  const mode = entity.state; // off | heat | cool | heat_cool | auto | fan_only | dry
  const current = attrs.current_temperature as number | undefined;
  const target = attrs.temperature as number | undefined;
  const targetLow = attrs.target_temp_low as number | undefined;
  const targetHigh = attrs.target_temp_high as number | undefined;
  const hvacAction = attrs.hvac_action as string | undefined;
  const step = (attrs.target_temp_step as number | undefined) ?? 1;
  const minTemp = (attrs.min_temp as number | undefined) ?? 50;
  const maxTemp = (attrs.max_temp as number | undefined) ?? 95;
  const hvacModes = (attrs.hvac_modes as string[] | undefined) ?? [mode];
  const fanModes = attrs.fan_modes as string[] | undefined;
  const fanMode = attrs.fan_mode as string | undefined;
  const isRange = typeof targetLow === "number" && typeof targetHigh === "number";
  const off = mode === "off";

  function setMode(next: string) {
    callService("climate", "set_hvac_mode", { hvac_mode: next }, { entity_id: entityId }).catch(
      () => {},
    );
  }

  function setFan(next: string) {
    callService("climate", "set_fan_mode", { fan_mode: next }, { entity_id: entityId }).catch(
      () => {},
    );
  }

  function adjustSingle(delta: number) {
    if (typeof target !== "number") return;
    const next = clampTemp(target + delta);
    callService(
      "climate",
      "set_temperature",
      { temperature: next },
      { entity_id: entityId },
    ).catch(() => {});
  }

  function adjustRange(which: "low" | "high", delta: number) {
    if (typeof targetLow !== "number" || typeof targetHigh !== "number") return;
    const nextLow = which === "low" ? clampTemp(targetLow + delta) : targetLow;
    const nextHigh = which === "high" ? clampTemp(targetHigh + delta) : targetHigh;
    if (nextLow >= nextHigh) return;
    callService(
      "climate",
      "set_temperature",
      { target_temp_low: nextLow, target_temp_high: nextHigh },
      { entity_id: entityId },
    ).catch(() => {});
  }

  function clampTemp(value: number) {
    return Math.min(maxTemp, Math.max(minTemp, value));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />

      <div
        className="relative flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-text">{entity.attributes.friendly_name ?? entityId}</div>
            <div className="text-xs text-text-dim">
              {current !== undefined ? `Currently ${current}°` : "—"}
              {hvacAction && !off ? ` · ${hvacAction}` : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-dim hover:bg-chip hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* Target temperature */}
        {off ? (
          <div className="rounded-xl bg-chip px-4 py-6 text-center text-sm text-text-dim">
            Turn on heat or cool to set a target
          </div>
        ) : isRange ? (
          <div className="grid grid-cols-2 gap-3">
            <TempStepper
              label="Low"
              value={targetLow}
              onDecrease={() => adjustRange("low", -step)}
              onIncrease={() => adjustRange("low", step)}
            />
            <TempStepper
              label="High"
              value={targetHigh}
              onDecrease={() => adjustRange("high", -step)}
              onIncrease={() => adjustRange("high", step)}
            />
          </div>
        ) : typeof target === "number" ? (
          <div className="flex items-center justify-center gap-6">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-chip text-text hover:bg-chip-hover active:scale-95"
              onClick={() => adjustSingle(-step)}
              aria-label="Decrease target temperature"
            >
              <Minus size={18} />
            </button>
            <div className="text-3xl font-semibold tabular-nums text-text">{target}°</div>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-chip text-text hover:bg-chip-hover active:scale-95"
              onClick={() => adjustSingle(step)}
              aria-label="Increase target temperature"
            >
              <Plus size={18} />
            </button>
          </div>
        ) : null}

        {/* HVAC mode */}
        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-text-dim">
            Mode
          </div>
          <div className="flex flex-wrap gap-2">
            {hvacModes.map((m) => {
              const { icon: Icon, label } = modeMeta(m);
              const isActive = m === mode;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-accent text-white"
                      : "bg-chip text-text-dim hover:bg-chip-hover hover:text-text",
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fan mode */}
        {fanModes && fanModes.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-text-dim">
              Fan
            </div>
            <div className="flex flex-wrap gap-2">
              {fanModes.map((f) => (
                <button
                  key={f}
                  onClick={() => setFan(f)}
                  className={clsx(
                    "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    f === fanMode
                      ? "bg-accent text-white"
                      : "bg-chip text-text-dim hover:bg-chip-hover hover:text-text",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TempStepper({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-chip py-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-text-dim">{label}</div>
      <div className="text-xl font-semibold tabular-nums text-text">{value}°</div>
      <div className="flex items-center gap-2">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text hover:bg-surface-hover active:scale-95"
          onClick={onDecrease}
          aria-label={`Decrease ${label.toLowerCase()} target`}
        >
          <Minus size={14} />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text hover:bg-surface-hover active:scale-95"
          onClick={onIncrease}
          aria-label={`Increase ${label.toLowerCase()} target`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
