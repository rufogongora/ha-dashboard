import type { LucideIcon } from "lucide-react";

export function IconToggleButton({
  icon: Icon,
  label,
  on,
  accent,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  on: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform active:scale-95"
      style={
        on
          ? { backgroundColor: accent, color: "#fff" }
          : { backgroundColor: "rgba(255,255,255,0.75)", color: accent }
      }
    >
      <Icon size={22} strokeWidth={2} />
    </button>
  );
}
