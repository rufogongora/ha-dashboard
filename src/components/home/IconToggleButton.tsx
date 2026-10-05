import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export function IconToggleButton({
  icon: Icon,
  label,
  on,
  accent,
  spinWhenOn,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  on: boolean;
  accent: string;
  /** Spin the icon while on — for fans. */
  spinWhenOn?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={() => {
        // A short buzz on Android so a tap registers without looking;
        // no-op where vibration isn't supported (iOS, desktop).
        navigator.vibrate?.(12);
        onClick();
      }}
      aria-pressed={on}
      title={label}
      className="flex h-[76px] w-[88px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[18px] px-1 transition-[background-color,color,box-shadow,transform] duration-300 active:scale-95"
      style={
        on
          ? {
              backgroundColor: accent,
              color: "#fff",
              // Glow + soft ring so "on" reads from across the room.
              boxShadow: `0 8px 22px -6px ${accent}, 0 0 0 3px ${accent}38`,
            }
          : { backgroundColor: "var(--chip-off)", color: accent }
      }
    >
      <Icon
        size={28}
        strokeWidth={2}
        className={clsx(
          "transition-transform duration-300",
          on && "scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]",
          on && spinWhenOn && "spin-slow",
        )}
      />
      <span className="w-full truncate text-center text-xs font-semibold leading-tight">
        {label}
      </span>
    </button>
  );
}
