import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { iconFor } from "../../lib/icons";
import { isDead, isOn } from "../../lib/entityHelpers";
import { CardShell } from "./CardShell";

export function SwitchCard({
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
  const domain = ent.domain; // "switch" | "fan" | "lock" | "input_boolean"

  function toggle() {
    if (dead) return;
    const service = domain === "lock" ? (on ? "unlock" : "lock") : "toggle";
    callService(domain, service, {}, { entity_id: ent.entityId }).catch(() => {});
  }

  return (
    <CardShell
      icon={iconFor(ent)}
      title={ent.friendlyName}
      subtitle={dead ? "unavailable" : domain === "lock" ? (on ? "unlocked" : "locked") : on ? "on" : "off"}
      active={on && !dead}
      dim={dead}
      onClick={toggle}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    />
  );
}
