import { RefreshCw, Star, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { isDead } from "../../lib/entityHelpers";
import { iconFor } from "../../lib/icons";

const REFRESH_MS = 6000;

/**
 * Refreshes a camera snapshot by asking Home Assistant to sign the
 * camera_proxy path (the same "auth/sign_path" mechanism HA's own frontend
 * uses) and dropping the result straight into an <img src>. Browsers don't
 * apply CORS to plain image loads, so this works out of the box with no
 * Home Assistant config changes — unlike a fetch()-based approach, which
 * needs cors_allowed_origins set. Not a live stream, just a still image
 * refreshed every few seconds — good enough for a glance on a wall tablet.
 */
export function CameraCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const { signPath } = useHa();
  const dead = isDead(ent);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);
  const mountedRef = useRef(true);
  const Icon = iconFor(ent);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (dead) return;
    let timer: ReturnType<typeof setTimeout>;

    async function refresh() {
      try {
        const url = await signPath(
          `/api/camera_proxy/${ent.entityId}`,
          Math.ceil(REFRESH_MS / 1000) + 15,
        );
        if (mountedRef.current) {
          setImgSrc(url);
          setErrored(false);
        }
      } catch {
        if (mountedRef.current) setErrored(true);
      } finally {
        if (mountedRef.current) timer = setTimeout(refresh, REFRESH_MS);
      }
    }

    refresh();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ent.entityId, dead]);

  return (
    <div
      className={clsx(
        "group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-3",
        dead && "opacity-40",
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <Icon size={15} className="text-text-dim" />
        <span className="truncate text-sm font-medium text-text">{ent.friendlyName}</span>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40">
        {imgSrc && !dead ? (
          <img
            src={imgSrc}
            alt={ent.friendlyName}
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-dim">
            {dead || errored ? <VideoOff size={20} /> : <RefreshCw size={20} className="animate-spin" />}
          </div>
        )}
        {errored && !dead && (
          <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-warn">
            snapshot unavailable
          </div>
        )}
      </div>

      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className={clsx(
            "absolute right-4 top-4 text-text-dim transition-colors hover:text-warn",
            isFavorite && "text-warn",
          )}
          aria-label="Toggle favorite"
        >
          <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}
    </div>
  );
}
