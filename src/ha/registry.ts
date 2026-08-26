import type { Connection } from "home-assistant-js-websocket";
import type { AreaRegistryEntry, DeviceRegistryEntry, EntityRegistryEntry } from "./types";

/**
 * The registries (which area a device/entity lives in, area display names, etc.)
 * aren't part of home-assistant-js-websocket's typed helpers — they're plain
 * websocket commands the real HA frontend uses too. We fetch them once on
 * connect and refetch when Home Assistant tells us one changed.
 */
export async function fetchRegistries(connection: Connection) {
  const [areas, devices, entities] = await Promise.all([
    connection.sendMessagePromise<AreaRegistryEntry[]>({
      type: "config/area_registry/list",
    }),
    connection.sendMessagePromise<DeviceRegistryEntry[]>({
      type: "config/device_registry/list",
    }),
    connection.sendMessagePromise<EntityRegistryEntry[]>({
      type: "config/entity_registry/list",
    }),
  ]);
  return { areas, devices, entities };
}

export const REGISTRY_UPDATE_EVENTS = [
  "area_registry_updated",
  "device_registry_updated",
  "entity_registry_updated",
] as const;
