import { Monitor, Server, type LucideIcon } from "lucide-react";

export interface ComputerMeter {
  label: string;
  entityId: string;
}

export interface ComputerFact {
  label: string;
  entityId: string;
  /** How to show the state: "since" turns a timestamp into a duration
   * ("3 d 4 h"), "ago" into "5 min ago", "value" shows it as-is. */
  format: "since" | "ago" | "value";
}

export interface ComputerAction {
  label: string;
  domain: string;
  service: string;
  entityId: string;
  /** Only offer it in this state (Wake when off, Sleep when on). */
  when: "online" | "offline";
  /** Ask for a second tap first — for things you don't want to fat-finger. */
  confirm?: boolean;
}

export interface CuratedComputer {
  key: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  /** Considered online while this entity is reporting (not unavailable). */
  onlineEntity: string;
  meters: ComputerMeter[];
  facts: ComputerFact[];
  disks?: ComputerMeter[];
  actions?: ComputerAction[];
  /** Shown when none of the entities exist yet. */
  setupHint: string;
}

/**
 * The computers on the Devices tab.
 *
 * APOLLO reports through HASS.Agent → Mosquitto (MQTT) on skylab, plus a
 * wake_on_lan switch for waking it. skylab reports through the Glances
 * container in ~/docker-compose/glances and HA's Glances integration.
 */
export const CURATED_COMPUTERS: CuratedComputer[] = [
  {
    key: "apollo",
    name: "APOLLO",
    subtitle: "Windows PC",
    icon: Monitor,
    onlineEntity: "sensor.apollo_sessionstate",
    meters: [
      { label: "CPU", entityId: "sensor.apollo_cpuload" },
      { label: "Memory", entityId: "sensor.apollo_memoryusage" },
      { label: "GPU", entityId: "sensor.apollo_gpuload" },
      { label: "GPU temp", entityId: "sensor.apollo_gputemperature" },
    ],
    facts: [
      { label: "Up", entityId: "sensor.apollo_lastboot", format: "since" },
      { label: "Last active", entityId: "sensor.apollo_lastactive", format: "ago" },
      { label: "Session", entityId: "sensor.apollo_sessionstate", format: "value" },
    ],
    actions: [
      { label: "Wake", domain: "switch", service: "turn_on", entityId: "switch.apollo_pc", when: "offline" },
      { label: "Sleep", domain: "button", service: "press", entityId: "button.apollo_sleep", when: "online", confirm: true },
    ],
    setupHint: "Start HASS.Agent on APOLLO.",
  },
  {
    key: "skylab",
    name: "skylab",
    subtitle: "Home server",
    icon: Server,
    onlineEntity: "sensor.skylab_cpu_usage",
    meters: [
      { label: "CPU", entityId: "sensor.skylab_cpu_usage" },
      { label: "Memory", entityId: "sensor.skylab_memory_usage" },
      { label: "CPU temp", entityId: "sensor.skylab_package_id_0_temperature" },
    ],
    facts: [
      { label: "Containers", entityId: "sensor.skylab_containers_active", format: "value" },
      { label: "Load", entityId: "sensor.skylab_cpu_load", format: "value" },
    ],
    disks: [
      { label: "System", entityId: "sensor.skylab_etc_hostname_disk_usage" },
      { label: "Drive 1", entityId: "sensor.skylab_mnt_drive1_disk_usage" },
      { label: "Drive 2", entityId: "sensor.skylab_mnt_drive2_disk_usage" },
      { label: "Drive 3", entityId: "sensor.skylab_mnt_drive3_disk_usage" },
      { label: "Media pool", entityId: "sensor.skylab_mnt_pool_disk_usage" },
    ],
    setupHint: "Add the Glances integration in Home Assistant (host: skylab, port 61208).",
  },
];
