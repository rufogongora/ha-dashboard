import { Laptop, Monitor, RotateCcw, Server, type LucideIcon } from "lucide-react";

export interface ComputerMeter {
  label: string;
  entityId: string;
  /** For "% available"-style sensors: show 100 minus the value. */
  invert?: boolean;
  /** Battery-style: warn when the value is low instead of high. */
  lowIsBad?: boolean;
  /** Read the percentage from this attribute instead of the state (HASS.Agent
   * storage sensors keep "UsedSpacePercentage" etc. as attributes). */
  attribute?: string;
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
  /** Defaults to a power icon for "offline" actions, a moon for "online". */
  icon?: LucideIcon;
}

export interface CuratedComputer {
  key: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  /** Considered online while this entity is reporting (not unavailable). */
  onlineEntity: string;
  /** A ping-backed entity (the wake_on_lan switch, which pings its host)
   * that also counts: offline as soon as either says so. HASS.Agent can take
   * ~25 s to go unavailable after a sleep — and briefly reports again while
   * shutting down — so without this the Wake button showed up late. */
  pingEntity?: string;
  /** For machines that never report "unavailable" (the Mac's Companion
   * app keeps its last values while asleep): a binary sensor whose on/off
   * replaces the Online/Offline pill. */
  activity?: { entityId: string; on: string; off: string };
  /** Binary sensors shown as small chips while on (camera in use, ...). */
  badges?: { entityId: string; label: string }[];
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
 * ARTEMIS (attic) is set up like APOLLO, with HASS.Agent's Satellite
 * Service so it reports without anyone logged in.
 * Rufos Mac reports through the Home Assistant Companion app for macOS,
 * which has no CPU/memory sensors.
 */
export const CURATED_COMPUTERS: CuratedComputer[] = [
  {
    key: "apollo",
    name: "APOLLO",
    subtitle: "Windows PC",
    icon: Monitor,
    onlineEntity: "sensor.apollo_sessionstate",
    pingEntity: "switch.apollo_pc",
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
    key: "artemis",
    name: "ARTEMIS",
    subtitle: "Attic PC",
    icon: Monitor,
    onlineEntity: "sensor.artemis_sessionstate",
    pingEntity: "switch.artemis_pc",
    meters: [
      { label: "CPU", entityId: "sensor.artemis_cpuload" },
      { label: "Memory", entityId: "sensor.artemis_memoryusage" },
    ],
    facts: [
      { label: "Up", entityId: "sensor.artemis_lastboot", format: "since" },
      { label: "Last active", entityId: "sensor.artemis_lastactive", format: "ago" },
      { label: "Session", entityId: "sensor.artemis_sessionstate", format: "value" },
    ],
    disks: [
      { label: "C:", entityId: "sensor.artemis_storage_c", attribute: "UsedSpacePercentage" },
    ],
    actions: [
      { label: "Wake", domain: "switch", service: "turn_on", entityId: "switch.artemis_pc", when: "offline" },
      { label: "Sleep", domain: "button", service: "press", entityId: "button.artemis_sleep", when: "online", confirm: true },
      { label: "Restart", domain: "button", service: "press", entityId: "button.artemis_restart", when: "online", confirm: true, icon: RotateCcw },
    ],
    setupHint: "Start HASS.Agent on ARTEMIS.",
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
      // _3: two disabled UniFi "skylab uptime" sensors already hold the
      // plain name.
      { label: "Up", entityId: "sensor.skylab_uptime_3", format: "since" },
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
  {
    key: "rufos_mac",
    name: "Rufos Mac",
    subtitle: "MacBook Air",
    icon: Laptop,
    onlineEntity: "binary_sensor.rufos_mac_active",
    activity: { entityId: "binary_sensor.rufos_mac_active", on: "In use", off: "Idle" },
    meters: [
      { label: "Battery", entityId: "sensor.rufos_mac_internal_battery_level", lowIsBad: true },
      { label: "Storage used", entityId: "sensor.rufos_mac_storage", invert: true },
    ],
    facts: [
      { label: "Power", entityId: "sensor.rufos_mac_internal_battery_state", format: "value" },
      { label: "App", entityId: "sensor.rufos_mac_frontmost_app", format: "value" },
      { label: "Wi-Fi", entityId: "sensor.rufos_mac_ssid", format: "value" },
    ],
    badges: [
      { entityId: "binary_sensor.rufos_mac_camera_in_use", label: "Camera in use" },
      { entityId: "binary_sensor.rufos_mac_audio_input_in_use", label: "Mic in use" },
    ],
    setupHint: "Open the Home Assistant app on the Mac.",
  },
];
