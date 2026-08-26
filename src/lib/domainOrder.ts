export const DOMAIN_ORDER = [
  "camera",
  "light",
  "climate",
  "media_player",
  "switch",
  "fan",
  "lock",
  "cover",
  "vacuum",
  "scene",
  "binary_sensor",
  "sensor",
];

export const DOMAIN_LABELS: Record<string, string> = {
  camera: "Cameras",
  light: "Lights",
  climate: "Climate",
  media_player: "Media",
  switch: "Switches",
  fan: "Fans",
  lock: "Locks",
  cover: "Covers",
  vacuum: "Vacuums",
  scene: "Scenes",
  binary_sensor: "Sensors",
  sensor: "Readings",
};

export function domainRank(domain: string): number {
  const i = DOMAIN_ORDER.indexOf(domain);
  return i === -1 ? DOMAIN_ORDER.length : i;
}
