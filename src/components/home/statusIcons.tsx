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
