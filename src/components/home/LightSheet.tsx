import { Lightbulb, Power } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import type { HassEntity } from "home-assistant-js-websocket";
import { useHa } from "../../ha/HaProvider";
import { Sheet, SheetSection } from "./Sheet";

const WHITES: { label: string; kelvin: number; swatch: string }[] = [
  { label: "Warm", kelvin: 2700, swatch: "#ffcf8a" },
  { label: "Soft", kelvin: 3500, swatch: "#ffe2b8" },
  { label: "Neutral", kelvin: 4500, swatch: "#fff4e5" },
  { label: "Daylight", kelvin: 6000, swatch: "#e6efff" },
];

const COLORS: { label: string; hs: [number, number]; swatch: string }[] = [
  { label: "Red", hs: [0, 90], swatch: "#ff3b30" },
  { label: "Orange", hs: [28, 95], swatch: "#ff9500" },
  { label: "Yellow", hs: [50, 85], swatch: "#ffd60a" },
  { label: "Green", hs: [120, 75], swatch: "#34c759" },
  { label: "Teal", hs: [175, 80], swatch: "#30d5c8" },
  { label: "Blue", hs: [225, 85], swatch: "#0a84ff" },
  { label: "Purple", hs: [275, 80], swatch: "#bf5af2" },
  { label: "Pink", hs: [320, 70], swatch: "#ff6ac1" },
];

function pct(e: HassEntity | undefined) {
  const b = e?.attributes.brightness as number | undefined;
  return e?.state === "on" && b !== undefined ? Math.round((b / 255) * 100) : 0;
}

function modes(e: HassEntity | undefined) {
  return (e?.attributes.supported_color_modes as string[] | undefined) ?? [];
}

/** Brightness slider that only sends to HA when you let go, instead of a
 * service call per pixel of drag. */
function BrightnessSlider({
  value,
  disabled,
  onCommit,
}: {
  value: number;
  disabled?: boolean;
  onCommit: (pct: number) => void;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? value;
  const commit = () => {
    if (drag !== null) onCommit(drag);
    setDrag(null);
  };
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={1}
        max={100}
        value={Math.max(1, shown)}
        disabled={disabled}
        aria-label="Brightness"
        onChange={(e) => setDrag(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onTouchEnd={commit}
        className="min-w-0 flex-1 disabled:opacity-40"
      />
      <span className="w-10 text-right text-[13px] font-semibold tabular-nums text-text">{shown}%</span>
    </div>
  );
}

/**
 * Everything Hue for one room: the group's on/off and brightness, white
 * temperature and colour presets (when the bulbs support them), the room's
 * Hue scenes, and each bulb on its own.
 */
export function LightSheet({
  groupId,
  roomName,
  accent,
  onClose,
}: {
  groupId: string;
  roomName: string;
  accent: string;
  onClose: () => void;
}) {
  const { entities, entitiesWithArea, callService } = useHa();
  const group = entities[groupId];
  const area = entitiesWithArea[groupId]?.areaName;

  // Bulbs: Hue lights in the same HA area, minus the group itself.
  const members = Object.values(entitiesWithArea)
    .filter(
      (e) =>
        e.domain === "light" &&
        e.entityId !== groupId &&
        area &&
        e.areaName === area &&
        !e.entity.attributes.is_hue_group &&
        e.entity.attributes.hue_type !== "zone",
    )
    .sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));

  // Hue scenes for this room are named scene.<group object id>_<scene>, and
  // their friendly names start with the Hue room's name ("Living room Bright").
  const prefix = `scene.${groupId.split(".")[1]}_`;
  const hueRoom = ((group?.attributes.friendly_name as string | undefined) ?? roomName).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const scenes = Object.keys(entities)
    .filter((id) => id.startsWith(prefix))
    .map((id) => ({
      id,
      name: ((entities[id].attributes.friendly_name as string | undefined) ?? id)
        .replace(new RegExp(`^${hueRoom}\\s*`, "i"), "")
        .replace(/^\w/, (c) => c.toUpperCase()),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const on = group?.state === "on";
  const onCount = members.filter((m) => m.entity.state === "on").length;
  const allModes = new Set([...modes(group), ...members.flatMap((m) => modes(m.entity))]);
  const canWhite = allModes.has("color_temp");
  const canColor = allModes.has("hs") || allModes.has("xy");

  function light(service: string, entityId: string, data: Record<string, unknown> = {}) {
    navigator.vibrate?.(10);
    callService("light", service, data, { entity_id: entityId }).catch(() => {});
  }

  if (!group) return null;

  return (
    <Sheet
      title={`${roomName} lights`}
      subtitle={
        members.length > 0 ? `${onCount} of ${members.length} on${on ? ` · ${pct(group)}%` : ""}` : on ? "On" : "Off"
      }
      onClose={onClose}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => light(on ? "turn_off" : "turn_on", groupId)}
          aria-pressed={on}
          className="flex h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors"
          style={on ? { background: accent, color: "#fff", boxShadow: `0 6px 18px -6px ${accent}` } : { background: "var(--color-chip)", color: "var(--color-text)" }}
        >
          <Power size={16} />
          {on ? "On" : "Off"}
        </button>
        <div className="min-w-0 flex-1">
          <BrightnessSlider
            value={pct(group)}
            onCommit={(v) => light("turn_on", groupId, { brightness_pct: v })}
          />
        </div>
      </div>

      {canWhite && (
        <SheetSection title="White">
          <div className="grid grid-cols-4 gap-2">
            {WHITES.map((w) => (
              <button
                key={w.kelvin}
                onClick={() => light("turn_on", groupId, { color_temp_kelvin: w.kelvin })}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-chip py-2.5 text-xs font-medium text-text active:scale-95"
              >
                <span className="h-7 w-7 rounded-full border border-black/10" style={{ background: w.swatch }} />
                {w.label}
              </button>
            ))}
          </div>
        </SheetSection>
      )}

      {canColor && (
        <SheetSection title="Color">
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c.label}
                onClick={() => light("turn_on", groupId, { hs_color: c.hs })}
                aria-label={c.label}
                title={c.label}
                className="h-10 w-10 rounded-full border-2 border-white/60 shadow-sm active:scale-90"
                style={{ background: c.swatch }}
              />
            ))}
          </div>
        </SheetSection>
      )}

      {scenes.length > 0 && (
        <SheetSection title="Scenes">
          <div className="flex flex-wrap gap-2">
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  navigator.vibrate?.(10);
                  callService("scene", "turn_on", {}, { entity_id: s.id }).catch(() => {});
                }}
                className="rounded-full bg-chip px-3.5 py-2 text-[13px] font-medium text-text active:scale-95"
              >
                {s.name}
              </button>
            ))}
          </div>
        </SheetSection>
      )}

      {members.length > 0 && (
        <SheetSection title="Lights">
          <div className="flex flex-col gap-1">
            {members.map((m) => {
              const unavailable = m.entity.state === "unavailable";
              const lit = m.entity.state === "on";
              return (
                <div key={m.entityId} className={clsx("flex items-center gap-3 py-1.5", unavailable && "opacity-45")}>
                  <button
                    onClick={() => !unavailable && light("toggle", m.entityId)}
                    aria-pressed={lit}
                    aria-label={`Toggle ${m.friendlyName}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors"
                    style={lit ? { background: accent, color: "#fff" } : { background: "var(--color-chip)", color: "var(--color-text-dim)" }}
                  >
                    <Lightbulb size={18} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-text">
                      {m.friendlyName}
                      {unavailable && <span className="font-normal text-text-dim"> · unreachable</span>}
                    </div>
                    {lit && (
                      <BrightnessSlider
                        value={pct(m.entity)}
                        onCommit={(v) => light("turn_on", m.entityId, { brightness_pct: v })}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SheetSection>
      )}
    </Sheet>
  );
}
