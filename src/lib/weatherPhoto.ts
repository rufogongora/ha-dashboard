import type { WeatherThemeGroup } from "./weatherTheme";

/**
 * LoremFlickr (loremflickr.com) — a free, no-API-key image-by-tag service
 * pulling from Flickr's publicly tagged photos. Unsplash Source used to
 * offer the same kind of thing but was discontinued in 2023, so this is the
 * closest still-working equivalent. Quality/relevance varies since it's
 * crowd-tagged, not curated — that's the tradeoff for "free and no signup".
 */
const KEYWORDS: Record<WeatherThemeGroup, [day: string, night: string]> = {
  clear: ["sunny,sky,summer", "night,sky,stars"],
  cloudy: ["cloudy,sky", "cloudy,night,sky"],
  rain: ["rain,rainy,street", "rain,night,city"],
  storm: ["thunderstorm,lightning,storm", "thunderstorm,lightning,night"],
  snow: ["snow,winter,forest", "snow,winter,night"],
  fog: ["fog,foggy,misty", "fog,night,misty"],
  wind: ["windy,clouds,sky", "windy,night,clouds"],
};

export function weatherPhotoUrl(group: WeatherThemeGroup, isNight: boolean): string {
  const tags = KEYWORDS[group][isNight ? 1 : 0];
  return `https://loremflickr.com/1600/900/${tags}`;
}
