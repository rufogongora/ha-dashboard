import { CURATED_ROOMS, CURATED_WEATHER_ENTITY } from "../config/curatedHome";
import { useHa } from "../ha/HaProvider";
import { isNightFor } from "../lib/weatherTheme";
import { CameraSidebar } from "./home/CameraSidebar";
import { CameraWall } from "./home/CameraWall";
import { RoomCard } from "./home/RoomCard";
import { StatusBar } from "./home/StatusBar";
import { WeatherBackground } from "./home/WeatherBackground";
import { Header } from "./Header";

/**
 * The curated landing screen — built around the rooms and entities Rodolfo
 * actually reaches for, styled after his reference dashboard, sized for a
 * Galaxy Tab A9+ mounted landscape on a wall. The full auto-generated,
 * everything-in-HA view is still one click away via "All Areas" in the
 * sidebar for anything that doesn't need a spot here.
 */
export function HomeScreen() {
  const { entities } = useHa();
  const weather = entities[CURATED_WEATHER_ENTITY];
  const isNight = isNightFor(entities["sun.sun"]?.state);

  return (
    <div className="relative flex h-full flex-col">
      <WeatherBackground condition={weather?.state} isNight={isNight} />

      <div className="relative z-10 flex h-full flex-col">
        <Header title="Home" subtitle={`${CURATED_ROOMS.length} rooms`} glass />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">
            <StatusBar />

            {/* Rooms fill a 2-column grid on the left; the camera sidebar is
                a flex sibling on the right, which stretches to match the
                room grid's full (auto) height for free — a spanning grid
                item can't do this reliably, since `grid-row: 1 / -1` only
                resolves against the *explicit* grid, not rows the room
                cards create implicitly via auto-flow. */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="grid grid-cols-2 gap-4 sm:flex-[2]">
                {CURATED_ROOMS.map((room, i) => (
                  <RoomCard key={room.key} room={room} index={i} />
                ))}
              </div>
              <div className="flex sm:flex-1">
                <CameraSidebar />
              </div>
            </div>

            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-dim">
                Cameras
              </h3>
              <CameraWall />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
