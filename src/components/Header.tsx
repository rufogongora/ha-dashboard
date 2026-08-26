import { useHa } from "../ha/HaProvider";
import clsx from "clsx";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { status } = useHa();
  return (
    <div className="flex items-center justify-between border-b border-border py-4 pl-20 pr-6">
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
