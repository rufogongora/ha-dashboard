import { X } from "lucide-react";
import type { QuickAction } from "../../config/curatedHome";

export function QuickActionsModal({
  actions,
  onSelect,
  onClose,
}: {
  actions: QuickAction[];
  onSelect: (action: QuickAction) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />

      <div
        className="relative flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Quick Actions</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-dim hover:bg-chip hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => onSelect(action)}
              disabled={action.entityIds.length === 0}
              title={
                action.entityIds.length === 0
                  ? "No entities configured for this action yet"
                  : undefined
              }
              className="flex items-center gap-3 rounded-2xl bg-chip px-4 py-3 text-left text-sm font-medium text-text transition-colors hover:bg-chip-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-text shadow-sm">
                <action.icon size={17} strokeWidth={1.75} />
              </div>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
