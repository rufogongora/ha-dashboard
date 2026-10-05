import clsx from "clsx";
import { CURATED_ROOMS, CURATED_WEATHER_ENTITY } from "../config/curatedHome";
import { useHa } from "../ha/HaProvider";
import { isNightFor } from "../lib/weatherTheme";
import { CameraSidebar } from "./home/CameraSidebar";
import { CameraWall } from "./home/CameraWall";
import { HomeHero } from "./home/HomeHero";
import { RoomCard } from "./home/RoomCard";
import { StatusBar } from "./home/StatusBar";
import { WeatherBackground } from "./home/WeatherBackground";

/**
 * The curated landing screen — built around the rooms and entities the
 * household actually reaches for, sized for a Galaxy Tab A9+ mounted
 * landscape on a wall. The full auto-generated, everything-in-HA view is
 * still one click away via "All Areas" in the sidebar for anything that
 * doesn't need a spot here.
 *
 * After sunset (per sun.sun) the whole screen switches to dark glass via
 * the .home-night token overrides in index.css.
 */
export function HomeScreen() {
  const { entities, status } = useHa();
  const weather = entities[CURATED_WEATHER_ENTITY];
  const isNight = isNightFor(entities["sun.sun"]?.state);

  return (
    <div className={clsx("relative flex h-full flex-col", isNight && "home-night")}>
      <WeatherBackground condition={weather?.state} isNight={isNight} />

      <div className="relative z-10 h-full overflow-y-auto px-7 pb-10 pt-20">
        <div className="hero-shadow absolute right-7 top-7 flex items-center gap-1.5 text-xs text-white/90">
          <span
            className={clsx(
              "h-[7px] w-[7px] rounded-full",
              status === "connected"
                ? "bg-[#3ee08f] shadow-[0_0_0_4px_rgba(62,224,143,0.25)]"
                : "bg-warn",
            )}
          />
          {status === "connected" ? "Live" : status}
        </div>

        <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
          <HomeHero />
          <StatusBar />

          {/* Rooms fill a 2-column grid on the left; the camera sidebar is
              a flex sibling on the right, which stretches to match the
              room grid's full (auto) height for free — a spanning grid
              item can't do this reliably, since `grid-row: 1 / -1` only
              resolves against the *explicit* grid, not rows the room
              cards create implicitly via auto-flow. */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="grid grid-cols-1 gap-4 sm:flex-[2] md:grid-cols-2 md:[&>*:last-child:nth-child(odd)]:col-span-2">
              {CURATED_ROOMS.map((room, i) => (
                <RoomCard key={room.key} room={room} index={i} />
              ))}
            </div>
            <div className="rise flex sm:flex-1" style={{ animationDelay: "500ms" }}>
              <CameraSidebar />
            </div>
          </div>

          <section className="rise" style={{ animationDelay: "600ms" }}>
            <h3 className="hero-shadow mx-1 mb-3 mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/85">
              Cameras
            </h3>
            <CameraWall />
          </section>
        </div>
      </div>
    </div>
  );
}
