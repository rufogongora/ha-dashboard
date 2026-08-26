import { useState } from "react";
import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { iconFor } from "../../lib/icons";
import { isDead, isOn } from "../../lib/entityHelpers";
import { CardShell } from "./CardShell";

export function LightCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const { callService } = useHa();
  const on = isOn(ent);
  const dead = isDead(ent);
  const brightness = ent.entity.attributes.brightness as number | undefined;
  const supportsBrightness = typeof brightness === "number";
  const [localPct, setLocalPct] = useState<number | null>(null);

  const pct = localPct ?? (supportsBrightness ? Math.round((brightness! / 255) * 100) : null);

  function toggle() {
    if (dead) return;
    callService("light", "toggle", {}, { entity_id: ent.entityId }).catch(() => {});
  }

  function setBrightness(value: number) {
    setLocalPct(value);
    callService(
      "light",
      "turn_on",
      { brightness_pct: value },
      { entity_id: ent.entityId },
    ).catch(() => {});
  }

  return (
    <CardShell
      icon={iconFor(ent)}
      title={ent.friendlyName}
      subtitle={dead ? "unavailable" : on ? (pct !== null ? `${pct}%` : "on") : "off"}
      active={on && !dead}
      dim={dead}
      onClick={toggle}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    >
      {supportsBrightness && on && !dead && (
        <input
          type="range"
          min={1}
          max={100}
          value={pct ?? 100}
          onChange={(e) => setBrightness(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </CardShell>
  );
}
