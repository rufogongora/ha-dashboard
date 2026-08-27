import { CURATED_CAMERAS } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { resolveCuratedCamera } from "../../lib/entityHelpers";
import { CameraCard } from "../cards/CameraCard";

export function CameraWall() {
  const { entitiesWithArea } = useHa();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {CURATED_CAMERAS.filter((cam) => !cam.sidebar).map((cam) => (
        <CameraCard key={cam.entityId} ent={resolveCuratedCamera(entitiesWithArea, cam)} bare />
      ))}
    </div>
  );
}
