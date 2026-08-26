import type { EntityWithArea } from "../../ha/types";
import { iconFor } from "../../lib/icons";
import { deviceClassLabel, isDead, isOn } from "../../lib/entityHelpers";
import { CardShell } from "./CardShell";

const ON_LABELS: Record<string, string> = {
  door: "open",
  garage_door: "open",
  opening: "open",
  window: "open",
  motion: "motion detected",
  occupancy: "occupied",
  moisture: "wet",
  smoke: "smoke detected",
  problem: "problem",
};

const OFF_LABELS: Record<string, string> = {
  door: "closed",
  garage_door: "closed",
  opening: "closed",
  window: "closed",
  motion: "clear",
  occupancy: "clear",
  moisture: "dry",
  smoke: "clear",
  problem: "ok",
};

export function BinarySensorCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const dead = isDead(ent);
  const on = isOn(ent);
  const deviceClass = (ent.entity.attributes.device_class as string) || "";
  const label = dead
    ? "unavailable"
    : on
      ? ON_LABELS[deviceClass] ?? "on"
      : OFF_LABELS[deviceClass] ?? "off";

  return (
    <CardShell
      icon={iconFor(ent)}
      title={ent.friendlyName}
      subtitle={deviceClassLabel(ent)}
      active={on && !dead}
      dim={dead}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    >
      <div className="text-sm font-medium capitalize text-text">{label}</div>
    </CardShell>
  );
}
