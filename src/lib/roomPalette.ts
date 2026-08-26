export interface RoomColor {
  /** Card background gradient. */
  gradient: string;
  /** Deeper tone used for the active-toggle fill and the illustration tint. */
  accent: string;
}

/** One pastel gradient per curated room, cycled in order — same flowing,
 * color-coded-by-room feel as the reference dashboard. */
export const ROOM_PALETTE: RoomColor[] = [
  { gradient: "linear-gradient(135deg, #eaf2ff, #cfe3ff)", accent: "#4f79c9" }, // kitchen — blue
  { gradient: "linear-gradient(135deg, #e6fbff, #c3eef6)", accent: "#3097a9" }, // living room — cyan
  { gradient: "linear-gradient(135deg, #eafaf1, #c9f0da)", accent: "#2f9e6f" }, // office — mint
  { gradient: "linear-gradient(135deg, #f1edfd, #ddd3f9)", accent: "#7c5fc4" }, // bedroom — lavender
  { gradient: "linear-gradient(135deg, #fff2e2, #ffdcb3)", accent: "#cf8330" }, // driveway — peach
  { gradient: "linear-gradient(135deg, #ffeef0, #ffd3da)", accent: "#cc5d70" }, // dining room — coral
  { gradient: "linear-gradient(135deg, #f0f9e8, #d7f0bd)", accent: "#6d9c33" }, // backyard — grass
];

export function roomColorFor(index: number): RoomColor {
  return ROOM_PALETTE[index % ROOM_PALETTE.length];
}
