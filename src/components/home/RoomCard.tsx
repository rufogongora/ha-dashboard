import { Link } from "react-router-dom";
import type { CuratedRoom } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { roomColorFor } from "../../lib/roomPalette";
import { slugifyAreaName } from "../../lib/slug";
import { ROOM_ILLUSTRATIONS } from "../illustrations/RoomIllustrations";
import { IconToggleButton } from "./IconToggleButton";

export function RoomCard({ room, index }: { room: CuratedRoom; index: number }) {
  const { entities, callService } = useHa();
  const color = roomColorFor(index);
  const Illustration = ROOM_ILLUSTRATIONS[room.illustration];

  function toggle(entityId: string) {
    callService("switch", "toggle", {}, { entity_id: entityId }).catch(() => {});
  }

  return (
    <div
      className="relative flex items-stretch justify-between gap-3 overflow-hidden rounded-3xl border border-white/40 p-5 shadow-sm backdrop-blur-md"
      style={{ background: color.glass }}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <Link
          to={`/area/${slugifyAreaName(room.name)}`}
          className="w-fit text-base font-semibold text-[#2c2a26] hover:underline"
        >
          {room.name}
        </Link>
        <Illustration
          size={76}
          strokeWidth={1.5}
          style={{ color: color.accent, opacity: 0.35 }}
          className="-ml-1"
        />
      </div>

      <div className="flex w-[192px] flex-wrap content-start justify-end gap-2">
        {room.toggles.map((toggle_) => {
          const state = entities[toggle_.entityId]?.state;
          const unavailable = state === undefined || state === "unavailable";
          return (
            <IconToggleButton
              key={toggle_.entityId}
              icon={toggle_.icon}
              label={toggle_.label}
              on={state === "on"}
              accent={unavailable ? "#b5b0a3" : color.accent}
              onClick={() => !unavailable && toggle(toggle_.entityId)}
            />
          );
        })}
      </div>
    </div>
  );
}
