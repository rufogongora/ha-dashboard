export type WeatherThemeGroup = "clear" | "cloudy" | "rain" | "storm" | "snow" | "fog" | "wind";

/** Collapses Home Assistant's ~14 weather condition strings down to the
 * handful of visual moods the background actually renders. */
export function weatherThemeGroup(condition: string | undefined): WeatherThemeGroup {
  switch (condition) {
    case "sunny":
    case "clear-night":
      return "clear";
    case "partlycloudy":
    case "cloudy":
      return "cloudy";
    case "rainy":
    case "pouring":
      return "rain";
    case "lightning":
    case "lightning-rainy":
    case "hail":
      return "storm";
    case "snowy":
    case "snowy-rainy":
      return "snow";
    case "fog":
      return "fog";
    case "windy":
    case "windy-variant":
      return "wind";
    default:
      return "cloudy";
  }
}

/** Is it currently dark out? Prefers HA's sun.sun entity (accurate for the
 * user's real location/season); falls back to a rough local-clock guess
 * when that entity isn't available. */
export function isNightFor(sunState: string | undefined): boolean {
  if (sunState) return sunState !== "above_horizon";
  const hour = new Date().getHours();
  return hour < 6 || hour >= 20;
}
