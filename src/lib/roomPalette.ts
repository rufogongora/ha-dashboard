export interface RoomColor {
  /** Pastel tint mixed into the card's glass background (stronger by day,
   * fainter at night — see --tint-strength in index.css). */
  tint: string;
  /** Deeper tone used for the active-toggle fill, glow, and illustration. */
  accent: string;
}

/** One pastel color per curated room, cycled in order — same flowing,
 * color-coded-by-room feel as the reference dashboard. */
export const ROOM_PALETTE: RoomColor[] = [
  { tint: "#cfe3ff", accent: "#4f79c9" }, // kitchen — blue
  { tint: "#c3eef6", accent: "#3097a9" }, // living room — cyan
  { tint: "#c9f0da", accent: "#2f9e6f" }, // office — mint
  { tint: "#ddd3f9", accent: "#7c5fc4" }, // bedroom — lavender
  { tint: "#ffdcb3", accent: "#cf8330" }, // driveway — peach
  { tint: "#ffd3da", accent: "#cc5d70" }, // dining room — coral
  { tint: "#d7f0bd", accent: "#6d9c33" }, // backyard — grass
];

export function roomColorFor(index: number): RoomColor {
  return ROOM_PALETTE[index % ROOM_PALETTE.length];
}

/** The tinted-glass background for a card in the given color. */
export function tintedGlass(color: RoomColor): string {
  return `color-mix(in srgb, ${color.tint} var(--tint-strength), var(--glass))`;
}
