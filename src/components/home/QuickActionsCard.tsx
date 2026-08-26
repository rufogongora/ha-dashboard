import type { QuickAction } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";

export function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
  const { callService } = useHa();

  function run(action: QuickAction) {
    if (action.entityIds.length === 0) return;
    callService("homeassistant", action.action, {}, { entity_id: action.entityIds }).catch(
      () => {},
    );
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-3xl border border-white/40 p-5 shadow-sm backdrop-blur-md"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.3))",
      }}
    >
      <div className="text-base font-semibold text-text">Quick Actions</div>
      <div className="flex flex-1 flex-col justify-center gap-2">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => run(action)}
            disabled={action.entityIds.length === 0}
            title={
              action.entityIds.length === 0
                ? "No entities configured for this action yet"
                : undefined
            }
            className="flex items-center gap-3 rounded-2xl bg-white/55 px-4 py-2.5 text-left text-sm font-medium text-text shadow-sm transition-transform hover:bg-white/75 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-text">
              <action.icon size={17} strokeWidth={1.75} />
            </div>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
