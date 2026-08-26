export interface RoomColor {
  /** Card background gradient (opaque). */
  gradient: string;
  /** Same gradient at reduced opacity, for use over the Home screen's
   * weather background — lets it show through the "glass" cards. */
  glass: string;
  /** Deeper tone used for the active-toggle fill and the illustration tint. */
  accent: string;
}

/** One pastel gradient per curated room, cycled in order — same flowing,
 * color-coded-by-room feel as the reference dashboard. */
export const ROOM_PALETTE: RoomColor[] = [
  {
    gradient: "linear-gradient(135deg, #eaf2ff, #cfe3ff)",
    glass: "linear-gradient(135deg, rgba(234,242,255,0.72), rgba(207,227,255,0.72))",
    accent: "#4f79c9",
  }, // kitchen — blue
  {
    gradient: "linear-gradient(135deg, #e6fbff, #c3eef6)",
    glass: "linear-gradient(135deg, rgba(230,251,255,0.72), rgba(195,238,246,0.72))",
    accent: "#3097a9",
  }, // living room — cyan
  {
    gradient: "linear-gradient(135deg, #eafaf1, #c9f0da)",
    glass: "linear-gradient(135deg, rgba(234,250,241,0.72), rgba(201,240,218,0.72))",
    accent: "#2f9e6f",
  }, // office — mint
  {
    gradient: "linear-gradient(135deg, #f1edfd, #ddd3f9)",
    glass: "linear-gradient(135deg, rgba(241,237,253,0.72), rgba(221,211,249,0.72))",
    accent: "#7c5fc4",
  }, // bedroom — lavender
  {
    gradient: "linear-gradient(135deg, #fff2e2, #ffdcb3)",
    glass: "linear-gradient(135deg, rgba(255,242,226,0.72), rgba(255,220,179,0.72))",
    accent: "#cf8330",
  }, // driveway — peach
  {
    gradient: "linear-gradient(135deg, #ffeef0, #ffd3da)",
    glass: "linear-gradient(135deg, rgba(255,238,240,0.72), rgba(255,211,218,0.72))",
    accent: "#cc5d70",
  }, // dining room — coral
  {
    gradient: "linear-gradient(135deg, #f0f9e8, #d7f0bd)",
    glass: "linear-gradient(135deg, rgba(240,249,232,0.72), rgba(215,240,189,0.72))",
    accent: "#6d9c33",
  }, // backyard — grass
];

export function roomColorFor(index: number): RoomColor {
  return ROOM_PALETTE[index % ROOM_PALETTE.length];
}
