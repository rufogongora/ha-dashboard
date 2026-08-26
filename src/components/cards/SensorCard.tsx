import type { EntityWithArea } from "../../ha/types";
import { iconFor } from "../../lib/icons";
import { deviceClassLabel, formatState, isDead } from "../../lib/entityHelpers";
import { CardShell } from "./CardShell";

export function SensorCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const dead = isDead(ent);
  return (
    <CardShell
      icon={iconFor(ent)}
      title={ent.friendlyName}
      subtitle={deviceClassLabel(ent)}
      dim={dead}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    >
      <div className="text-2xl font-semibold tabular-nums text-text">
        {dead ? "—" : formatState(ent)}
      </div>
    </CardShell>
  );
}
