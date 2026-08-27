import { Maximize2, RefreshCw, Star, VideoOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { EntityWithArea } from "../../ha/types";
import { useHa } from "../../ha/HaProvider";
import { isDead } from "../../lib/entityHelpers";
import { iconFor } from "../../lib/icons";

const RETRY_MS = 5000;

/**
 * True live view: signs Home Assistant's camera_proxy_stream path (the
 * generic MJPEG multipart stream every HA camera entity exposes, the same
 * "auth/sign_path" mechanism HA's own frontend uses) and drops it straight
 * into an <img src> — browsers render a multipart MJPEG response as a
 * continuously-updating image with zero extra code, no polling loop needed.
 * If the stream drops (HA restart, network blip), the <img>'s onError fires
 * and we re-sign a fresh URL after a short delay.
 */
export function CameraCard({
  ent,
  isFavorite,
  onToggleFavorite,
  bare,
  fill,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  /** Drop the border/padding and name label — just the snapshot itself. */
  bare?: boolean;
  /** Fill the parent's height instead of a fixed 16:9 box (for a vertical
   * stack where each tile gets an equal flex share of the column height). */
  fill?: boolean;
}) {
  const { signPath } = useHa();
  const dead = isDead(ent);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const mountedRef = useRef(true);
  const Icon = iconFor(ent);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      const url = await signPath(`/api/camera_proxy_stream/${ent.entityId}`, 30);
      if (mountedRef.current) {
        setImgSrc(url);
        setErrored(false);
      }
    } catch {
      if (mountedRef.current) setErrored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ent.entityId]);

  useEffect(() => {
    if (dead) return;
    connect();
  }, [connect, dead]);

  // Self-heals if the stream drops: onError below flips `errored`, which
  // schedules one reconnect attempt here.
  useEffect(() => {
    if (!errored || dead) return;
    const timer = setTimeout(connect, RETRY_MS);
    return () => clearTimeout(timer);
  }, [errored, dead, connect]);

  return (
    <div
      className={clsx(
        "group relative flex min-h-0 flex-col gap-2",
        fill && "flex-1",
        bare
          ? "overflow-hidden rounded-2xl shadow-sm"
          : "overflow-hidden rounded-2xl border border-border bg-surface p-3",
        dead && "opacity-40",
      )}
    >
      {!bare && (
        <div className="flex items-center gap-2 px-1">
          <Icon size={15} className="text-text-dim" />
          <span className="truncate text-sm font-medium text-text">{ent.friendlyName}</span>
        </div>
      )}

      <div
        className={clsx(
          "relative w-full overflow-hidden bg-black/40",
          fill ? "min-h-0 flex-1" : "aspect-video",
          bare ? "rounded-2xl" : "rounded-xl",
          imgSrc && !dead && "cursor-pointer",
        )}
        onClick={() => {
          if (imgSrc && !dead) setFullscreen(true);
        }}
      >
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
stream unavailable
          </div>
        )}
        {imgSrc && !dead && (
          <div className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white/90">
            <Maximize2 size={12} />
          </div>
        )}
      </div>

      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={clsx(
            "absolute right-4 top-4 text-text-dim transition-colors hover:text-warn",
            isFavorite && "text-warn",
          )}
          aria-label="Toggle favorite"
        >
          <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      )}

      {fullscreen && imgSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={imgSrc}
            alt={ent.friendlyName}
            className="h-[80vh] w-[80vw] rounded-xl object-contain"
          />
          <button
            onClick={() => setFullscreen(false)}
            aria-label="Exit fullscreen"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
