import type { LucideIcon } from "lucide-react";
import { Star } from "lucide-react";
import React from "react";
import clsx from "clsx";

interface CardShellProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string | null;
  active?: boolean;
  dim?: boolean;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  children?: React.ReactNode;
}

export function CardShell({
  icon: Icon,
  title,
  subtitle,
  active,
  dim,
  onClick,
  isFavorite,
  onToggleFavorite,
  children,
}: CardShellProps) {
  return (
    <div
      className={clsx(
        "group relative flex flex-col gap-3 rounded-2xl border p-4 transition-colors",
        active
          ? "border-accent/40 bg-accent-soft"
          : "border-border bg-surface hover:bg-surface-hover",
        dim && "opacity-40",
      )}
    >
      <div
        className={clsx("flex items-start gap-3", onClick && "cursor-pointer")}
        onClick={onClick}
        role={onClick ? "button" : undefined}
      >
        <div
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            active ? "bg-accent/20 text-accent" : "bg-chip text-text-dim",
          )}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-text">{title}</div>
          {subtitle && (
            <div className="truncate text-xs text-text-dim">{subtitle}</div>
          )}
        </div>
      </div>
      {children}
      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className={clsx(
            "absolute right-3 top-3 text-text-dim/60 transition-colors hover:text-warn",
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
