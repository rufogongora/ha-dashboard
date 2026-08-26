import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { iconFor } from "../../lib/icons";
import { isDead } from "../../lib/entityHelpers";
import { CardShell } from "./CardShell";

export function MediaPlayerCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const { callService } = useHa();
  const dead = isDead(ent);
  const state = ent.entity.state; // playing | paused | idle | off | on
  const attrs = ent.entity.attributes;
  const title = (attrs.media_title as string) || undefined;
  const artist = (attrs.media_artist as string) || undefined;
  const volume = attrs.volume_level as number | undefined;
  const playing = state === "playing";
  const off = state === "off" || dead;

  function call(service: string, data: Record<string, unknown> = {}) {
    if (off) return;
    callService("media_player", service, data, { entity_id: ent.entityId }).catch(() => {});
  }

  const subtitle = dead
    ? "unavailable"
    : title
      ? [title, artist].filter(Boolean).join(" · ")
      : state.replace(/_/g, " ");

  return (
    <CardShell
      icon={iconFor(ent)}
      title={ent.friendlyName}
      subtitle={subtitle}
      active={playing}
      dim={dead}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    >
      {!off && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-3">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
              onClick={() => call("media_previous_track")}
              aria-label="Previous"
            >
              <SkipBack size={15} />
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white hover:opacity-90"
              onClick={() => call(playing ? "media_pause" : "media_play")}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-text hover:bg-chip-hover"
              onClick={() => call("media_next_track")}
              aria-label="Next"
            >
              <SkipForward size={15} />
            </button>
          </div>
          {typeof volume === "number" && (
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-text-dim" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) =>
                  call("volume_set", { volume_level: Number(e.target.value) / 100 })
                }
                className="flex-1"
              />
            </div>
          )}
        </div>
      )}
    </CardShell>
  );
}
