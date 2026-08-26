import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ha-dashboard:config";

export interface DashboardConfig {
  /** entity_ids to hide everywhere. */
  hiddenEntityIds: string[];
  /** entity_ids pinned to the top of the Overview page. */
  favoriteEntityIds: string[];
  /** Custom display names for areas, keyed by the HA area name. */
  areaRenames: Record<string, string>;
  /** Explicit area display order; areas not listed are sorted alphabetically after. */
  areaOrder: string[];
  /** When false, entities in "unavailable"/"unknown" state are hidden instead of grayed out. */
  showUnavailable: boolean;
}

const DEFAULT_CONFIG: DashboardConfig = {
  hiddenEntityIds: [],
  favoriteEntityIds: [],
  areaRenames: {},
  areaOrder: [],
  showUnavailable: false,
};

function load(): DashboardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function persist(config: DashboardConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Simple localStorage-backed config store. This is the "easy to customize" layer:
 * hide noisy entities, rename areas, reorder them, and pin favorites to the
 * Overview page — all editable from the Settings panel in the UI, no rebuild needed.
 */
export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(load);

  useEffect(() => {
    persist(config);
  }, [config]);

  const update = useCallback((patch: Partial<DashboardConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleHidden = useCallback((entityId: string) => {
    setConfig((prev) => {
      const hidden = new Set(prev.hiddenEntityIds);
      if (hidden.has(entityId)) hidden.delete(entityId);
      else hidden.add(entityId);
      return { ...prev, hiddenEntityIds: Array.from(hidden) };
    });
  }, []);

  const toggleFavorite = useCallback((entityId: string) => {
    setConfig((prev) => {
      const favs = new Set(prev.favoriteEntityIds);
      if (favs.has(entityId)) favs.delete(entityId);
      else favs.add(entityId);
      return { ...prev, favoriteEntityIds: Array.from(favs) };
    });
  }, []);

  const renameArea = useCallback((areaName: string, displayName: string) => {
    setConfig((prev) => ({
      ...prev,
      areaRenames: { ...prev.areaRenames, [areaName]: displayName },
    }));
  }, []);

  const resetConfig = useCallback(() => setConfig(DEFAULT_CONFIG), []);

  return { config, update, toggleHidden, toggleFavorite, renameArea, resetConfig };
}
