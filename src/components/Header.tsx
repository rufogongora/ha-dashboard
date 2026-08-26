import { useHa } from "../ha/HaProvider";
import clsx from "clsx";

export function Header({
  title,
  subtitle,
  glass,
}: {
  title: string;
  subtitle?: string;
  /** Frosted translucent bar instead of a plain border — keeps the title
   * legible over a variable-brightness background (e.g. the Home screen's
   * weather photo) without having to inspect that image's brightness. */
  glass?: boolean;
}) {
  const { status } = useHa();
  return (
    <div
      className={clsx(
        "flex items-center justify-between py-4 pl-20 pr-6",
        glass
          ? "border-b border-white/40 bg-white/55 backdrop-blur-md"
          : "border-b border-border",
      )}
    >
      <div>
        <h1 className="text-lg font-semibold text-text">{title}</h1>
        {subtitle && <p className="text-xs text-text-dim">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-text-dim">
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            status === "connected" ? "bg-ok" : "bg-warn",
          )}
        />
        {status === "connected" ? "Live" : status}
      </div>
    </div>
  );
}
