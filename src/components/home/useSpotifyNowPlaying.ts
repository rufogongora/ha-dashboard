import { useEffect, useState } from "react";
import { useHa } from "../../ha/HaProvider";

const POLL_MS = 4000;

export interface SpotcastTrack {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

export interface SpotcastPlayerState {
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
export function useSpotifyNowPlaying(): SpotcastPlayerState | null {
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
