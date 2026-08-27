import { DoorOpen } from "lucide-react";
import { CURATED_DOOR_SENSORS } from "../config/curatedHome";

export function DoorAlertModal({
  doorIds,
  onDismiss,
  onDismissAll,
}: {
  doorIds: string[];
  onDismiss: (entityId: string) => void;
  onDismissAll: () => void;
}) {
  const doors = CURATED_DOOR_SENSORS.filter((d) => doorIds.includes(d.entityId));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-danger/40 bg-surface p-8 text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/15 text-danger">
          <DoorOpen size={30} strokeWidth={1.75} />
        </div>
        <div className="text-xl font-semibold text-text">
          {doors.length === 1 ? "Door left open" : "Doors left open"}
        </div>

        <div className="flex w-full flex-col gap-2">
          {doors.map((door) => (
            <div
              key={door.entityId}
              className="flex items-center justify-between gap-3 rounded-2xl bg-chip px-4 py-3"
            >
              <span className="text-sm font-medium text-text">{door.label}</span>
              <button
                onClick={() => onDismiss(door.entityId)}
                className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-text-dim shadow-sm transition-colors hover:text-text"
              >
                Silence
              </button>
            </div>
          ))}
        </div>

        {doors.length > 1 && (
          <button
            onClick={onDismissAll}
            className="mt-1 w-full rounded-full bg-danger px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            Silence all
          </button>
        )}
      </div>
    </div>
  );
}
