import { CURATED_CAMERAS } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { CameraCard } from "../cards/CameraCard";
import type { EntityWithArea } from "../../ha/types";

export function CameraWall() {
  const { entitiesWithArea } = useHa();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {CURATED_CAMERAS.map((cam) => {
        const found = entitiesWithArea[cam.entityId];
        // Use the curated label instead of whatever raw name HA reports, and
        // fall back to a synthetic "unavailable" entity if it isn't found yet
        // (e.g. camera not yet set up) so the tile still renders cleanly.
        const ent: EntityWithArea = found
          ? { ...found, friendlyName: cam.label }
          : {
              entity: {
                entity_id: cam.entityId,
                state: "unavailable",
                attributes: {},
                context: { id: "", parent_id: null, user_id: null },
                last_changed: "",
                last_updated: "",
              },
              entityId: cam.entityId,
              domain: "camera",
              areaId: null,
              areaName: null,
              deviceId: null,
              friendlyName: cam.label,
            };
        return <CameraCard key={cam.entityId} ent={ent} bare />;
      })}
    </div>
  );
}
