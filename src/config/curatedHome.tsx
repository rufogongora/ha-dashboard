import {
  DoorOpen,
  Fan,
  Lightbulb,
  Moon,
  PartyPopper,
  Refrigerator,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type RoomIllustrationKey =
  | "kitchen"
  | "livingRoom"
  | "office"
  | "bedroom"
  | "driveway"
  | "diningRoom"
  | "backyard";

export interface CuratedToggle {
  entityId: string;
  label: string;
  icon: LucideIcon;
}

export interface CuratedRoom {
  key: string;
  name: string;
  illustration: RoomIllustrationKey;
  toggles: CuratedToggle[];
  /** Outdoor/exterior room — excluded from "indoor" quick actions like
   * "We're leaving". */
  external?: boolean;
}

export interface CuratedCamera {
  entityId: string;
  label: string;
}

/**
 * The real rooms + entities Rodolfo listed from his current Lovelace config.
 * This ships as the default "Home" screen content instead of an
 * auto-generated everything-by-domain view — curated on purpose, since the
 * whole point of this screen is "the entities I actually reach for," not
 * a complete inventory (that's what the room pages via the sidebar are for).
 */
export const CURATED_ROOMS: CuratedRoom[] = [
  {
    key: "kitchen",
    name: "Kitchen",
    illustration: "kitchen",
    toggles: [
      { entityId: "switch.kitchen_hang_lights_switch_2", label: "Lights", icon: Lightbulb },
      { entityId: "switch.kitchen_hang_switch", label: "Accent", icon: Lightbulb },
    ],
  },
  {
    key: "living_room",
    name: "Living Room",
    illustration: "livingRoom",
    toggles: [
      { entityId: "switch.living_room_candelabra", label: "Candelabra", icon: Sparkles },
      { entityId: "switch.living_room_entrance_light", label: "Entrance", icon: Lightbulb },
      { entityId: "switch.living_room_flood", label: "Flood", icon: Lightbulb },
      { entityId: "switch.hallway_lights_switch", label: "Hallway", icon: Lightbulb },
    ],
  },
  {
    key: "office",
    name: "Office",
    illustration: "office",
    toggles: [
      { entityId: "switch.office_fan", label: "Fan", icon: Fan },
      { entityId: "switch.office_lights", label: "Lights", icon: Lightbulb },
    ],
  },
  {
    key: "bedroom",
    name: "Bedroom",
    illustration: "bedroom",
    toggles: [
      { entityId: "switch.bedroom_fan_lights_switch", label: "Fan Light", icon: Lightbulb },
      { entityId: "switch.bedroom_fan_switch", label: "Fan", icon: Fan },
      { entityId: "switch.bedroom_flood_light_switch", label: "Flood", icon: Lightbulb },
    ],
  },
  {
    key: "driveway",
    name: "Driveway",
    illustration: "driveway",
    external: true,
    toggles: [
      { entityId: "switch.main_entrance_lights_switch", label: "Entrance", icon: Lightbulb },
    ],
  },
  {
    key: "dining_room",
    name: "Dining Room",
    illustration: "diningRoom",
    toggles: [{ entityId: "switch.dinning_room_light", label: "Lights", icon: Sparkles }],
  },
  {
    key: "backyard",
    name: "Backyard",
    illustration: "backyard",
    external: true,
    toggles: [
      { entityId: "switch.backyard_door_light", label: "Door Light", icon: Lightbulb },
      {
        entityId: "switch.tp_link_power_strip_8772_bar_lights",
        label: "Bar Lights",
        icon: Sparkles,
      },
      {
        entityId: "switch.tp_link_power_strip_8772_mini_fridge",
        label: "Bar Fridge",
        icon: Refrigerator,
      },
    ],
  },
];

export const CURATED_CAMERAS: CuratedCamera[] = [
  { entityId: "camera.driveway_medium", label: "Driveway" },
  { entityId: "camera.g4_doorbell_pro_medium", label: "Front Doorbell" },
  { entityId: "camera.backyard_medium_resolution_channel", label: "Backyard" },
  { entityId: "camera.backyard_east_medium_resolution_channel", label: "Backyard East" },
  { entityId: "camera.backyard_west_medium_resolution_channel", label: "Backyard West" },
  { entityId: "camera.g3_flex_high_4", label: "Flex Cam" },
];

export const CURATED_CLIMATE_ENTITY = "climate.entryway";

/** Home's Sense energy monitor entities, shown in the status bar. */
export const CURATED_ENERGY = {
  consumption: "sensor.sense_1000001241_energy",
  production: "sensor.sense_1000001241_production",
};

export const CURATED_WEATHER_ENTITY = "weather.forecast_home";

export interface QuickAction {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Whether pressing it turns its entities on or off. */
  action: "turn_on" | "turn_off";
  entityIds: string[];
}

function toggleIdsOf(key: string): string[] {
  return CURATED_ROOMS.find((r) => r.key === key)?.toggles.map((t) => t.entityId) ?? [];
}

/**
 * One-tap scenes shown on the Home screen's Quick Actions card. Each just
 * bulk turn_on/turn_off's a list of entities via the generic `homeassistant`
 * domain service (works across light/switch/fan regardless of which one a
 * given entity actually is).
 */
export const CURATED_QUICK_ACTIONS: QuickAction[] = [
  {
    key: "leaving",
    label: "We're leaving",
    icon: DoorOpen,
    action: "turn_off",
    // Every indoor room's lights/fans — driveway and backyard (external:
    // true) are left alone, since you'd still want those on while out.
    entityIds: CURATED_ROOMS.filter((r) => !r.external).flatMap((r) =>
      r.toggles.map((t) => t.entityId),
    ),
  },
  {
    key: "party",
    label: "Party",
    icon: PartyPopper,
    action: "turn_on",
    entityIds: toggleIdsOf("backyard"),
  },
  {
    key: "good_night",
    label: "Good night",
    icon: Moon,
    action: "turn_off",
    entityIds: [
      ...toggleIdsOf("kitchen"),
      ...toggleIdsOf("living_room"),
      ...toggleIdsOf("dining_room"),
      // TODO: add your TV media_player entity IDs here, e.g.
      // "media_player.living_room_tv" — not in curatedHome.tsx yet since
      // no TVs are configured as curated entities.
    ],
  },
];
