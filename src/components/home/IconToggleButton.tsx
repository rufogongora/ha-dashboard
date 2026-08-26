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
      aria-pressed={on}
      title={label}
      className="flex w-[68px] shrink-0 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 shadow-sm transition-transform active:scale-95"
      style={
        on
          ? { backgroundColor: accent, color: "#fff" }
          : { backgroundColor: "rgba(255,255,255,0.75)", color: accent }
      }
    >
      <Icon size={24} strokeWidth={2} />
      <span className="w-full truncate text-center text-[10px] font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}
