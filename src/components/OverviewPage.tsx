import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useHa } from "../ha/HaProvider";
import { useConfig } from "../config/ConfigProvider";
import { areaIcon } from "../lib/areaIcons";
import { isDead, isOn, isRenderable } from "../lib/entityHelpers";
import { slugifyAreaName } from "../lib/slug";
import { EntityGrid } from "./EntityGrid";
import { Header } from "./Header";

export function OverviewPage() {
  const { areaGroups, entitiesWithArea } = useHa();
  const { config } = useConfig();

  const favorites = useMemo(
    () =>
      config.favoriteEntityIds
        .map((id) => entitiesWithArea[id])
        .filter((e): e is NonNullable<typeof e> => Boolean(e)),
    [config.favoriteEntityIds, entitiesWithArea],
  );

  const attention = useMemo(
    () =>
      Object.values(entitiesWithArea).filter(
        (e) => e.domain === "binary_sensor" && !isDead(e) && isOn(e),
      ),
    [entitiesWithArea],
  );

  const rooms = areaGroups
    .filter((g) => g.areaId)
    .filter((g) => g.entities.some(isRenderable))
    .sort((a, b) => {
      const order = config.areaOrder;
      const ai = order.indexOf(a.name);
      const bi = order.indexOf(b.name);
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex h-full flex-col">
      <Header title="Overview" subtitle={`${rooms.length} rooms`} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-8">
          {attention.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-warn">
                Needs attention
              </h3>
              <EntityGrid entities={attention} />
            </section>
          )}

          {favorites.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-dim">
                Favorites
              </h3>
              <EntityGrid entities={favorites} />
            </section>
          )}

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-dim">
              Rooms
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {rooms.map((room) => {
                const Icon = areaIcon(room.name);
                const onCount = room.entities.filter((e) => !isDead(e) && isOn(e)).length;
                return (
                  <Link
                    key={room.areaId}
                    to={`/area/${slugifyAreaName(room.name)}`}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chip text-text-dim">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text">
                        {config.areaRenames[room.name] ?? room.name}
                      </div>
                      <div className="text-xs text-text-dim">
                        {onCount > 0 ? `${onCount} active` : "all off"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
