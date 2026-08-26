import { useState } from "react";
import { Music } from "lucide-react";
import { SpotifySearchModal } from "./SpotifySearchModal";

export function SpotifyCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-white/40 p-5 text-center shadow-sm backdrop-blur-md transition-transform active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, rgba(29,185,84,0.35), rgba(29,185,84,0.15))",
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-[#1DB954]">
          <Music size={24} strokeWidth={1.75} />
        </div>
        <div className="text-base font-semibold text-text">Spotify</div>
        <div className="text-xs text-text-dim">Play in the living room</div>
      </button>

      {open && <SpotifySearchModal onClose={() => setOpen(false)} />}
    </>
  );
}
