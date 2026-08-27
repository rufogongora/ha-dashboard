import { CURATED_CAMERAS } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { resolveCuratedCamera } from "../../lib/entityHelpers";
import { CameraCard } from "../cards/CameraCard";

/** The vertical camera column next to the room grid — an equal-height flex
 * stack (not the wrapping grid CameraWall uses) so a narrow, tall column
 * still fills its available height. */
export function CameraSidebar() {
  const { entitiesWithArea } = useHa();
  const cameras = CURATED_CAMERAS.filter((cam) => cam.sidebar);

  return (
    <div className="flex flex-1 flex-col gap-3">
      {cameras.map((cam) => (
        <CameraCard
          key={cam.entityId}
          ent={resolveCuratedCamera(entitiesWithArea, cam)}
          bare
          fill
        />
      ))}
    </div>
  );
}
