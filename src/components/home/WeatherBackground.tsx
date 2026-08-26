import { weatherThemeGroup, type WeatherThemeGroup } from "../../lib/weatherTheme";

const BASE_GRADIENT: Record<WeatherThemeGroup, [day: string, night: string]> = {
  clear: [
    "linear-gradient(180deg, #bfe0ff 0%, #eaf4ff 55%, #fdf6e3 100%)",
    "linear-gradient(180deg, #0b1533 0%, #16234a 55%, #2a2f55 100%)",
  ],
  cloudy: [
    "linear-gradient(180deg, #c7d2dd 0%, #dfe6ec 60%, #eef1f0 100%)",
    "linear-gradient(180deg, #131a26 0%, #232c3d 60%, #2c3242 100%)",
  ],
  rain: [
    "linear-gradient(180deg, #94a3b3 0%, #7c8a9c 60%, #64707f 100%)",
    "linear-gradient(180deg, #0e131c 0%, #1b2431 60%, #232b38 100%)",
  ],
  storm: [
    "linear-gradient(180deg, #4b5566 0%, #333c4a 60%, #232833 100%)",
    "linear-gradient(180deg, #05070c 0%, #10141d 55%, #191d27 100%)",
  ],
  snow: [
    "linear-gradient(180deg, #dbe6ee 0%, #eef3f7 60%, #f8fafc 100%)",
    "linear-gradient(180deg, #131c2c 0%, #1f2c40 60%, #2a374c 100%)",
  ],
  fog: [
    "linear-gradient(180deg, #cfd3d4 0%, #dcdfdf 100%)",
    "linear-gradient(180deg, #1a1d21 0%, #2b2f33 100%)",
  ],
  wind: [
    "linear-gradient(180deg, #bcd4de 0%, #d8e6ea 60%, #eef3f2 100%)",
    "linear-gradient(180deg, #101923 0%, #1c2733 60%, #26323f 100%)",
  ],
};

/** Star/cloud visibility fades as the weather gets heavier — stars barely
 * peek through overcast or stormy skies, clouds get denser and darker. */
const STAR_OPACITY: Record<WeatherThemeGroup, number> = {
  clear: 0.9,
  cloudy: 0.4,
  rain: 0.15,
  storm: 0.05,
  snow: 0.25,
  fog: 0,
  wind: 0.5,
};

const CLOUD_LAYERS: Partial<Record<WeatherThemeGroup, { color: string; opacity: number }>> = {
  cloudy: { color: "#ffffff", opacity: 0.55 },
  rain: { color: "#2b3038", opacity: 0.55 },
  storm: { color: "#14161c", opacity: 0.7 },
  snow: { color: "#ffffff", opacity: 0.6 },
  wind: { color: "#ffffff", opacity: 0.45 },
};

export function WeatherBackground({
  condition,
  isNight,
}: {
  condition: string | undefined;
  isNight: boolean;
}) {
  const group = weatherThemeGroup(condition);
  const background = BASE_GRADIENT[group][isNight ? 1 : 0];
  const clouds = CLOUD_LAYERS[group];
  const showRain = group === "rain" || group === "storm";
  const showSnow = group === "snow";
  const showStorm = group === "storm";
  const showSunMoon = group === "clear";
  const showMist = group === "fog";

  return (
    <div className="wxbg" style={{ background }} aria-hidden>
      {isNight && STAR_OPACITY[group] > 0 && (
        <div className="wxbg__stars" style={{ opacity: STAR_OPACITY[group] }} />
      )}

      {showSunMoon && (
        <div
          className="wxbg__glow"
          style={
            isNight
              ? {
                  background: "radial-gradient(circle, rgba(226,233,255,0.9), transparent 70%)",
                  boxShadow: "0 0 60px 20px rgba(226,233,255,0.25)",
                }
              : {
                  background: "radial-gradient(circle, rgba(255,224,150,0.95), transparent 70%)",
                  boxShadow: "0 0 90px 30px rgba(255,210,120,0.35)",
                }
          }
        />
      )}

      {clouds && (
        <>
          <div
            className="wxbg__cloud"
            style={{
              top: "14%",
              left: "-10%",
              width: 260,
              height: 70,
              background: clouds.color,
              opacity: clouds.opacity,
              animationDuration: "26s",
            }}
          />
          <div
            className="wxbg__cloud"
            style={{
              top: "28%",
              left: "35%",
              width: 200,
              height: 56,
              background: clouds.color,
              opacity: clouds.opacity * 0.85,
              animationDuration: "34s",
              animationDirection: "reverse",
            }}
          />
          <div
            className="wxbg__cloud"
            style={{
              top: "8%",
              left: "60%",
              width: 180,
              height: 50,
              background: clouds.color,
              opacity: clouds.opacity * 0.7,
              animationDuration: "20s",
            }}
          />
        </>
      )}

      {showRain && <div className="wxbg__rain" />}
      {showSnow && <div className="wxbg__snow" />}
      {showMist && <div className="wxbg__mist" />}

      {showStorm && (
        <>
          <div className="wxbg__lightning" />
          <svg
            className="wxbg__bolt"
            width="40"
            height="90"
            viewBox="0 0 40 90"
            fill="none"
          >
            <path
              d="M22 0 L4 50 L18 50 L14 90 L36 36 L21 36 Z"
              fill="#fff"
              opacity="0.9"
            />
          </svg>
        </>
      )}
    </div>
  );
}
