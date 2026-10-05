import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";

const CONDITION_LABELS: Record<string, string> = {
  "clear-night": "Clear night",
  cloudy: "Cloudy",
  exceptional: "Exceptional",
  fog: "Foggy",
  hail: "Hail",
  lightning: "Thunderstorms",
  "lightning-rainy": "Thunderstorms",
  partlycloudy: "Partly cloudy",
  pouring: "Pouring",
  rainy: "Rainy",
  snowy: "Snowy",
  "snowy-rainy": "Sleet",
  sunny: "Sunny",
  windy: "Windy",
  "windy-variant": "Windy",
};

/** Human-readable label for a Home Assistant weather condition string. */
export function weatherLabel(condition: string | undefined): string {
  if (!condition) return "—";
  return CONDITION_LABELS[condition] ?? condition.replace(/-/g, " ");
}

/** Maps a Home Assistant weather condition string to an icon. */
export function weatherIcon(condition: string | undefined): LucideIcon {
  switch (condition) {
    case "sunny":
      return Sun;
    case "clear-night":
      return Moon;
    case "partlycloudy":
      return CloudSun;
    case "cloudy":
      return Cloud;
    case "rainy":
    case "pouring":
      return CloudRain;
    case "snowy":
    case "snowy-rainy":
      return CloudSnow;
    case "lightning":
    case "lightning-rainy":
      return CloudLightning;
    case "fog":
      return CloudFog;
    case "windy":
    case "windy-variant":
      return Wind;
    default:
      return Cloud;
  }
}
