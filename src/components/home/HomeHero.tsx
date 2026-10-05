import { createElement, useEffect, useState } from "react";
import { CURATED_WEATHER_ENTITY, HOUSEHOLD_NAME } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { weatherIcon, weatherLabel } from "./statusIcons";
import { useWeatherForecast } from "./useWeatherForecast";

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function greetingFor(hour: number) {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Its own component so the once-a-second tick only re-renders the clock,
 * not the whole hero. */
function Clock() {
  const now = useNow(1000);
  const h = now.getHours();
  const h12 = ((h + 11) % 12) + 1;
  const mm = String(now.getMinutes()).padStart(2, "0");

  return (
    <div>
      <div className="text-[104px] font-light leading-[0.9] tracking-[-4px] tabular-nums">
        {h12}:{mm}
        <span className="ml-1.5 text-[32px] font-normal tracking-normal opacity-85">
          {h < 12 ? "AM" : "PM"}
        </span>
      </div>
      <div className="mt-3 text-[22px] font-medium">
        {greetingFor(h)}, {HOUSEHOLD_NAME}
      </div>
      <div className="mt-0.5 text-[15px] opacity-85">
        {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

function WeatherGlyph({ condition, size, strokeWidth }: { condition: string | undefined; size: number; strokeWidth?: number }) {
  // createElement rather than <Icon />: the icon is looked up per render.
  return createElement(weatherIcon(condition), { size, strokeWidth });
}

function Temp({ value }: { value: number | undefined }) {
  return <>{value === undefined ? "—" : `${Math.round(value)}°`}</>;
}

/** Big clock + greeting on the left, current weather and the next few
 * hours on the right — the "glance from across the room" part of the
 * wall tablet. Sits directly on the weather photo, so white text. */
export function HomeHero() {
  const { entities } = useHa();
  const weather = entities[CURATED_WEATHER_ENTITY];
  const hourly = useWeatherForecast(CURATED_WEATHER_ENTITY, "hourly");
  const daily = useWeatherForecast(CURATED_WEATHER_ENTITY, "daily");

  // Re-filters the hourly list as hours pass, even between forecast pushes.
  const now = useNow(60_000);
  const temp = weather?.attributes.temperature as number | undefined;
  const unit = (weather?.attributes.temperature_unit as string | undefined) ?? "°";
  const humidity = weather?.attributes.humidity as number | undefined;
  const today = daily?.[0];
  const nextHours = (hourly ?? [])
    .filter((f) => new Date(f.datetime).getTime() > now.getTime())
    .slice(0, 4);

  return (
    <section className="rise hero-shadow mx-1 mb-7 flex flex-wrap items-end justify-between gap-6 text-white">
      <Clock />

      {weather && (
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3.5">
            <WeatherGlyph condition={weather.state} size={64} strokeWidth={1.4} />
            <div className="text-[80px] font-light leading-none tracking-[-3px]">
              {temp === undefined ? "—" : Math.round(temp)}
              <sup className="relative top-2 align-top text-[30px] tracking-normal">{unit}</sup>
            </div>
            <div className="text-sm leading-normal opacity-90">
              <div className="text-[17px] font-semibold">{weatherLabel(weather.state)}</div>
              {today && (
                <div>
                  H <Temp value={today.temperature} /> · L <Temp value={today.templow} />
                </div>
              )}
              {humidity !== undefined && <div>Humidity {humidity}%</div>}
            </div>
          </div>

          {nextHours.length > 0 && (
            <div className="flex gap-1.5 rounded-[22px] border border-white/25 bg-white/15 p-2.5 [text-shadow:none] backdrop-blur-md">
              {nextHours.map((f) => {
                return (
                  <div
                    key={f.datetime}
                    className="flex w-[58px] flex-col items-center gap-1.5 py-1 text-xs"
                  >
                    {new Date(f.datetime).toLocaleTimeString(undefined, { hour: "numeric" })}
                    <WeatherGlyph condition={f.condition} size={22} />
                    <b className="text-[15px] font-semibold">
                      <Temp value={f.temperature} />
                    </b>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
