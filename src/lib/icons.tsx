import {
  Activity,
  Bot,
  Camera,
  DoorClosed,
  DoorOpen,
  Droplet,
  Gauge,
  Lightbulb,
  LightbulbOff,
  Lock,
  Music4,
  Package,
  Power,
  PowerOff,
  Radar,
  Sparkles,
  Thermometer,
  Tv,
  Unlock,
  Wind,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EntityWithArea } from "../ha/types";
import { isOn } from "./entityHelpers";

export function iconFor(ent: EntityWithArea): LucideIcon {
  const { domain, entity } = ent;
  const deviceClass = entity.attributes.device_class as string | undefined;
  const on = isOn(ent);

  switch (domain) {
    case "camera":
      return Camera;
    case "light":
      return on ? Lightbulb : LightbulbOff;
    case "switch":
      return on ? Power : PowerOff;
    case "climate":
      return Thermometer;
    case "media_player":
      return on ? Music4 : Tv;
    case "vacuum":
      return Bot;
    case "scene":
      return Sparkles;
    case "fan":
      return Wind;
    case "lock":
      return on ? Unlock : Lock;
    case "cover":
      return Package;
    case "binary_sensor":
      if (deviceClass === "door" || deviceClass === "garage_door")
        return on ? DoorOpen : DoorClosed;
      if (deviceClass === "opening") return on ? DoorOpen : DoorClosed;
      if (deviceClass === "motion" || deviceClass === "occupancy") return Radar;
      return Activity;
    case "sensor":
      if (deviceClass === "temperature") return Thermometer;
      if (deviceClass === "humidity") return Droplet;
      if (deviceClass === "power" || deviceClass === "energy") return Zap;
      return Gauge;
    default:
      return Activity;
  }
}
