import { useParams } from "react-router-dom";
import { useHa } from "../ha/HaProvider";
import { useConfig } from "../config/ConfigProvider";
import { slugifyAreaName } from "../lib/slug";
import { EntityGrid } from "./EntityGrid";
import { Header } from "./Header";

export function AreaPage() {
  const { areaSlug } = useParams();
  const { areaGroups } = useHa();
  const { config } = useConfig();

  const group = areaGroups.find((g) => g.areaId && slugifyAreaName(g.name) === areaSlug);

  if (!group) {
    return (
      <div className="p-6 text-sm text-text-dim">
        Room not found. It may have been renamed or removed in Home Assistant.
      </div>
    );
  }

  const displayName = config.areaRenames[group.name] ?? group.name;

  return (
    <div className="flex h-full flex-col">
      <Header title={displayName} subtitle={`${group.entities.length} entities`} />
      <div className="flex-1 overflow-y-auto p-6">
        <EntityGrid entities={group.entities} emptyMessage="No supported entities in this room." />
      </div>
    </div>
  );
}
