import { Home, Play, Square } from "lucide-react";
import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { iconFor } from "../../lib/icons";
import { isDead } from "../../lib/entityHelpers";
import { CardShell } from "./CardShell";

export function VacuumCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const { callService } = useHa();
  const dead = isDead(ent);
  const state = ent.entity.state; // docked | cleaning | returning | paused | idle | error
  const cleaning = state === "cleaning";

  function call(service: string) {
    if (dead) return;
    callService("vacuum", service, {}, { entity_id: ent.entityId }).catch(() => {});
  }

  return (
    <CardShell
      icon={iconFor(ent)}
      title={ent.friendlyName}
      subtitle={dead ? "unavailable" : state.replace(/_/g, " ")}
      active={cleaning}
      dim={dead}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    >
      {!dead && (
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
            onClick={() => call(cleaning ? "pause" : "start")}
            aria-label={cleaning ? "Pause" : "Start cleaning"}
          >
            <Play size={14} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
            onClick={() => call("stop")}
            aria-label="Stop"
          >
            <Square size={14} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
            onClick={() => call("return_to_base")}
            aria-label="Return to base"
          >
            <Home size={14} />
          </button>
        </div>
      )}
    </CardShell>
  );
}
