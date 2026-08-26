import { useEffect, useState } from "react";
import { Music, Pause, Play, Volume2 } from "lucide-react";
import { CURATED_SPOTIFY_TARGET } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { SpotifySearchModal } from "./SpotifySearchModal";

const POLL_MS = 4000;

interface SpotcastTrack {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

interface SpotcastPlayerState {
  is_playing?: boolean;
  item?: SpotcastTrack;
  device?: { volume_percent?: number; supports_volume?: boolean };
}

/**
 * Spotcast's media_player entity is just an address for starting playback —
 * it doesn't report its own state (confirmed live: stays off/idle regardless
 * of what's actually playing). Real-time now-playing info only comes from
 * Spotcast's `spotcast/player` websocket endpoint, so this polls that
 * instead of reading the entity.
 */
function useSpotcastNowPlaying(): SpotcastPlayerState | null {
  const { sendMessage } = useHa();
  const [state, setState] = useState<SpotcastPlayerState | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await sendMessage<{ account: string; state: SpotcastPlayerState }>({
          type: "spotcast/player",
        });
        if (!cancelled) setState(res.state ?? null);
      } catch {
        if (!cancelled) setState(null);
      } finally {
        if (!cancelled) timer = setTimeout(poll, POLL_MS);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sendMessage]);

  return state;
}

export function SpotifyCard() {
  const { callService } = useHa();
  const [open, setOpen] = useState(false);
  const player = useSpotcastNowPlaying();

  const playing = player?.is_playing === true;
  const track = player?.item;
  const active = Boolean(track);
  const volume = player?.device?.volume_percent;
  const albumArt = track?.album.images.at(-1)?.url ?? null;

  // Best-effort: Spotcast itself has no pause/volume actions (it's scoped to
  // "start/transfer playback" only), so this falls back to the standard
  // media_player services on its entity in case they happen to be wired up.
  function call(service: string, data: Record<string, unknown> = {}) {
    callService("media_player", service, data, { entity_id: CURATED_SPOTIFY_TARGET }).catch(
      () => {},
    );
  }

  return (
    <>
      <div
        className="flex flex-col justify-center gap-3 rounded-3xl border border-white/40 p-5 shadow-sm backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, rgba(29,185,84,0.35), rgba(29,185,84,0.15))",
        }}
      >
        {active ? (
          <>
            <button onClick={() => setOpen(true)} className="flex items-center gap-3 text-left">
              {albumArt ? (
                <img
                  src={albumArt}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[#1DB954]">
                  <Music size={22} strokeWidth={1.75} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-text">{track!.name}</div>
                <div className="truncate text-xs text-text-dim">
                  {track!.artists.map((a) => a.name).join(", ")}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => call(playing ? "media_pause" : "media_play")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-text hover:bg-white/90 active:scale-95"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              {typeof volume === "number" && (
                <div className="flex flex-1 items-center gap-2">
                  <Volume2 size={14} className="shrink-0 text-text-dim" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) =>
                      call("volume_set", { volume_level: Number(e.target.value) / 100 })
                    }
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-2 text-center transition-transform active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-[#1DB954]">
              <Music size={24} strokeWidth={1.75} />
            </div>
            <div className="text-base font-semibold text-text">Spotify</div>
            <div className="text-xs text-text-dim">Play in the living room</div>
          </button>
        )}
      </div>

      {open && <SpotifySearchModal onClose={() => setOpen(false)} />}
    </>
  );
}
