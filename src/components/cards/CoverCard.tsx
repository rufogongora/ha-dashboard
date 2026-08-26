import { ArrowDown, ArrowUp, Square } from "lucide-react";
import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { iconFor } from "../../lib/icons";
import { isDead } from "../../lib/entityHelpers";
import { CardShell } from "./CardShell";

export function CoverCard({
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
  const state = ent.entity.state; // open | closed | opening | closing

  function call(service: string) {
    if (dead) return;
    callService("cover", service, {}, { entity_id: ent.entityId }).catch(() => {});
  }

  return (
    <CardShell
      icon={iconFor(ent)}
      title={ent.friendlyName}
      subtitle={dead ? "unavailable" : state.replace(/_/g, " ")}
      active={state === "open"}
      dim={dead}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    >
      {!dead && (
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
            onClick={() => call("open_cover")}
            aria-label="Open"
          >
            <ArrowUp size={14} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
            onClick={() => call("stop_cover")}
            aria-label="Stop"
          >
            <Square size={14} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
            onClick={() => call("close_cover")}
            aria-label="Close"
          >
            <ArrowDown size={14} />
          </button>
        </div>
      )}
    </CardShell>
  );
}
