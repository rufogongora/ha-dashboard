import { Droplets, Fan, Flame, Power, Snowflake, Thermometer, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useHa } from "../../ha/HaProvider";
import { clsx } from "clsx";
import { RadialDial } from "./RadialDial";

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

  function setSingleTarget(value: number) {
    callService(
      "climate",
      "set_temperature",
      { temperature: value },
      { entity_id: entityId },
    ).catch(() => {});
  }

  function setRangeTarget(which: "low" | "high", value: number) {
    if (typeof targetLow !== "number" || typeof targetHigh !== "number") return;
    const nextLow = which === "low" ? value : targetLow;
    const nextHigh = which === "high" ? value : targetHigh;
    if (nextLow >= nextHigh) return;
    callService(
      "climate",
      "set_temperature",
      { target_temp_low: nextLow, target_temp_high: nextHigh },
      { entity_id: entityId },
    ).catch(() => {});
  }

  function dialColorFor(m: string) {
    if (m === "cool") return "var(--color-accent)";
    if (m === "heat") return "var(--color-warn)";
    if (m === "heat_cool" || m === "auto") return "var(--color-ok)";
    return "var(--color-text-dim)";
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
          <div className="flex justify-center py-1">
            <RadialDial
              min={minTemp}
              max={maxTemp}
              step={step}
              centerLabel={hvacAction}
              handles={[
                {
                  value: targetLow!,
                  color: "var(--color-accent)",
                  onCommit: (v) => setRangeTarget("low", v),
                },
                {
                  value: targetHigh!,
                  color: "var(--color-warn)",
                  onCommit: (v) => setRangeTarget("high", v),
                },
              ]}
            />
          </div>
        ) : typeof target === "number" ? (
          <div className="flex justify-center py-1">
            <RadialDial
              min={minTemp}
              max={maxTemp}
              step={step}
              centerLabel={hvacAction}
              handles={[
                {
                  value: target,
                  color: dialColorFor(mode),
                  onCommit: setSingleTarget,
                },
              ]}
            />
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
