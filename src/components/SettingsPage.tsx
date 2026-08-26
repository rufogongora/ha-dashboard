import { ArrowDown, ArrowUp, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useHa } from "../ha/HaProvider";
import { useConfig } from "../config/ConfigProvider";
import { isRenderable, sortByName } from "../lib/entityHelpers";
import { Header } from "./Header";

export function SettingsPage() {
  const { areaGroups } = useHa();
  const { config, update, renameArea, toggleHidden, resetConfig } = useConfig();
  const [search, setSearch] = useState("");

  const rooms = areaGroups.filter((g) => g.areaId);
  const orderedRoomNames = useMemo(() => {
    const names = rooms.map((r) => r.name);
    const ordered = [...config.areaOrder.filter((n) => names.includes(n))];
    for (const n of names) if (!ordered.includes(n)) ordered.push(n);
    return ordered;
  }, [rooms, config.areaOrder]);

  function moveRoom(name: string, dir: -1 | 1) {
    const idx = orderedRoomNames.indexOf(name);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= orderedRoomNames.length) return;
    const next = [...orderedRoomNames];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    update({ areaOrder: next });
  }

  const allEntities = useMemo(
    () =>
      areaGroups
        .flatMap((g) => g.entities)
        .filter(isRenderable)
        .sort(sortByName),
    [areaGroups],
  );

  const filtered = allEntities.filter(
    (e) =>
      !search ||
      e.friendlyName.toLowerCase().includes(search.toLowerCase()) ||
      e.entityId.toLowerCase().includes(search.toLowerCase()),
  );

  const hidden = new Set(config.hiddenEntityIds);

  return (
    <div className="flex h-full flex-col">
      <Header title="Settings" subtitle="Customize your dashboard" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex max-w-2xl flex-col gap-8">
          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-dim">
              General
            </h3>
            <label className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <div>
                <div className="text-sm text-text">Show unavailable entities</div>
                <div className="text-xs text-text-dim">
                  Grayed out instead of hidden entirely
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.showUnavailable}
                onChange={(e) => update({ showUnavailable: e.target.checked })}
              />
            </label>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-dim">
              Rooms — rename &amp; reorder
            </h3>
            <div className="flex flex-col gap-2">
              {orderedRoomNames.map((name, i) => (
                <div
                  key={name}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2"
                >
                  <div className="flex flex-col">
                    <button
                      className="text-text-dim hover:text-text disabled:opacity-30"
                      disabled={i === 0}
                      onClick={() => moveRoom(name, -1)}
                      aria-label="Move up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      className="text-text-dim hover:text-text disabled:opacity-30"
                      disabled={i === orderedRoomNames.length - 1}
                      onClick={() => moveRoom(name, 1)}
                      aria-label="Move down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                  <div className="w-32 shrink-0 text-xs text-text-dim">{name}</div>
                  <input
                    className="flex-1 rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-accent"
                    value={config.areaRenames[name] ?? name}
                    onChange={(e) => renameArea(name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-dim">
              Hidden entities ({hidden.size})
            </h3>
            <input
              className="mb-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
              placeholder="Search entities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-surface">
              {filtered.slice(0, 200).map((ent) => (
                <label
                  key={ent.entityId}
                  className="flex items-center justify-between border-b border-border px-3 py-2 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-text">{ent.friendlyName}</div>
                    <div className="truncate text-xs text-text-dim">{ent.entityId}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hidden.has(ent.entityId)}
                    onChange={() => toggleHidden(ent.entityId)}
                  />
                </label>
              ))}
              {filtered.length === 0 && (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-text-dim">
                  <EyeOff size={14} /> No entities match.
                </div>
              )}
            </div>
          </section>

          <section>
            <button
              onClick={resetConfig}
              className="w-fit rounded-lg border border-danger/30 px-3 py-2 text-xs text-danger hover:bg-danger/10"
            >
              Reset all customizations
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
