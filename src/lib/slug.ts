export function slugifyAreaName(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}
