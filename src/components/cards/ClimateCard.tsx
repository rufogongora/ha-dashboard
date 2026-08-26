import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { iconFor } from "../../lib/icons";
import { isDead } from "../../lib/entityHelpers";
import { ClimateControlModal } from "../climate/ClimateControlModal";
import { CardShell } from "./CardShell";

export function ClimateCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const { callService } = useHa();
  const [controlsOpen, setControlsOpen] = useState(false);
  const dead = isDead(ent);
  const attrs = ent.entity.attributes;
  const current = attrs.current_temperature as number | undefined;
  const target = attrs.temperature as number | undefined;
  const mode = ent.entity.state; // off | heat | cool | heat_cool | auto
  const active = mode !== "off" && !dead;
  const step = (attrs.target_temp_step as number | undefined) ?? 1;

  function adjust(delta: number) {
    if (dead || typeof target !== "number") return;
    callService(
      "climate",
      "set_temperature",
      { temperature: target + delta },
      { entity_id: ent.entityId },
    ).catch(() => {});
  }

  return (
    <>
      <CardShell
        icon={iconFor(ent)}
        title={ent.friendlyName}
        subtitle={
          dead
            ? "unavailable"
            : `${mode}${current !== undefined ? ` · currently ${current}°` : ""} · tap for controls`
        }
        active={active}
        dim={dead}
        onClick={dead ? undefined : () => setControlsOpen(true)}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      >
        {!dead && typeof target === "number" && (
          <div className="flex items-center justify-between gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
              onClick={() => adjust(-step)}
              aria-label="Decrease target temperature"
            >
              <Minus size={16} />
            </button>
            <div className="text-lg font-semibold tabular-nums">{target}°</div>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
              onClick={() => adjust(step)}
              aria-label="Increase target temperature"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </CardShell>

      {controlsOpen && (
        <ClimateControlModal entityId={ent.entityId} onClose={() => setControlsOpen(false)} />
      )}
    </>
  );
}
