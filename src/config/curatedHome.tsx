import {
  Fan,
  Lightbulb,
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
