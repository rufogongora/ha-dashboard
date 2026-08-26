import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { iconFor } from "../../lib/icons";
import { CardShell } from "./CardShell";

export function SceneCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const { callService } = useHa();

  function activate() {
    callService("scene", "turn_on", {}, { entity_id: ent.entityId }).catch(() => {});
  }

  return (
    <CardShell
      icon={iconFor(ent)}
      title={ent.friendlyName}
      subtitle="tap to activate"
      onClick={activate}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    />
  );
}
