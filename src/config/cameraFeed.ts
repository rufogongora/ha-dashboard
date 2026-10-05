/**
 * Sources for the camera activity feed: UniFi Protect "event" entities.
 * Each new detection is a new state (the event's timestamp) with an
 * event_type attribute (person, vehicle, animal, package, ring, motion...).
 *
 * Thumbnails and clips come from Protect through HA's own proxy views,
 * addressed by camera entity + time (Protect's event IDs aren't kept in
 * HA's history):
 *   /api/unifiprotect/snapshot/<entry>/<camera entity>/<iso time>
 *   /api/unifiprotect/video/<entry>/<camera entity>/<start>/<end>
 */

/** The UniFi Protect integration's config entry ("Orion"); the proxy views
 * accept it in place of the NVR id. */
export const PROTECT_ENTRY_ID = "cd4d3f67c508e1e953aa4bb838d21980";

export interface FeedSource {
  entityId: string;
  /** Camera entity to pull the snapshot / clip from. */
  camera: string;
  label: string;
  /** Fixed type for single-purpose events (doorbell ring, package);
   * otherwise the event's event_type attribute is used. */
  type?: string;
}

export const FEED_SOURCES: FeedSource[] = [
  { entityId: "event.g4_doorbell_pro_doorbell", camera: "camera.g4_doorbell_pro_medium", label: "Front door", type: "ring" },
  { entityId: "event.g4_doorbell_pro_package", camera: "camera.g4_doorbell_pro_package_camera", label: "Front door", type: "package" },
  { entityId: "event.g4_doorbell_pro_smart_detection", camera: "camera.g4_doorbell_pro_medium", label: "Front door" },
  { entityId: "event.driveway_smart_detection", camera: "camera.driveway_medium", label: "Driveway" },
  // The backyard G3 Flexes don't do smart detection — plain motion only
  // (and they're quiet, unlike the driveway's motion).
  { entityId: "event.backyard_motion_detection", camera: "camera.backyard_medium_resolution_channel", label: "Backyard" },
  { entityId: "event.backyard_east_motion_detection", camera: "camera.backyard_east_medium_resolution_channel", label: "Backyard East" },
  { entityId: "event.backyard_west_motion_detection", camera: "camera.backyard_west_medium_resolution_channel", label: "Backyard West" },
  { entityId: "event.backyard_garden_motion_detection", camera: "camera.g3_flex_high_4", label: "Backyard Garden" },
];

/** How far back the feed looks. */
export const FEED_HOURS = 24;
