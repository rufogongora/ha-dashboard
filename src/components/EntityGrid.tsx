import { useMemo } from "react";
import type { EntityWithArea } from "../ha/types";
import { useConfig } from "../config/ConfigProvider";
import { DOMAIN_LABELS, domainRank } from "../lib/domainOrder";
import { isDead, isRenderable, sortByName } from "../lib/entityHelpers";
import { EntityCard } from "./EntityCard";

export function EntityGrid({
  entities,
  emptyMessage = "Nothing here yet.",
}: {
  entities: EntityWithArea[];
  emptyMessage?: string;
}) {
  const { config, toggleFavorite } = useConfig();
  const hidden = useMemo(() => new Set(config.hiddenEntityIds), [config.hiddenEntityIds]);
  const favorites = useMemo(
    () => new Set(config.favoriteEntityIds),
    [config.favoriteEntityIds],
  );

  const visible = entities
    .filter(isRenderable)
    .filter((e) => !hidden.has(e.entityId))
    .filter((e) => config.showUnavailable || !isDead(e));

  const groups = useMemo(() => {
    const byDomain = new Map<string, EntityWithArea[]>();
    for (const ent of visible) {
      if (!byDomain.has(ent.domain)) byDomain.set(ent.domain, []);
      byDomain.get(ent.domain)!.push(ent);
    }
    return Array.from(byDomain.entries())
      .sort(([a], [b]) => domainRank(a) - domainRank(b))
      .map(([domain, ents]) => [domain, ents.sort(sortByName)] as const);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map((e) => e.entityId + e.entity.state).join(",")]);

  if (groups.length === 0) {
    return <div className="px-1 py-8 text-sm text-text-dim">{emptyMessage}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(([domain, ents]) => (
        <section key={domain}>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-dim">
            {DOMAIN_LABELS[domain] ?? domain}
          </h3>
          <div
            className={
              domain === "camera"
                ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {ents.map((ent) => (
              <EntityCard
                key={ent.entityId}
                ent={ent}
                isFavorite={favorites.has(ent.entityId)}
                onToggleFavorite={() => toggleFavorite(ent.entityId)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
