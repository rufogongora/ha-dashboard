import clsx from "clsx";
import { HOUSEHOLD_PEOPLE } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { useNow } from "../../lib/useNow";

const HOME_GREEN = "#3ee08f";

function statusText(state: string | undefined) {
  if (!state || state === "unknown" || state === "unavailable") return null;
  if (state === "home") return "Home";
  if (state === "not_home") return "Away";
  // Any other state is the name of the HA zone they're in ("Work", ...).
  return state;
}

function since(iso: string, now: Date, home: boolean) {
  const t = new Date(iso);
  const mins = Math.round((now.getTime() - t.getTime()) / 60000);
  if (mins < 1) return "just now";
  // Arrivals read best as a clock time, absences as a duration.
  if (home) {
    const sameDay = t.toDateString() === now.toDateString();
    return `since ${t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}${sameDay ? "" : ` ${t.toLocaleDateString(undefined, { weekday: "short" })}`}`;
  }
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return h < 24 ? `${h} h` : `${Math.floor(h / 24)} d`;
}

/** Avatar pills for each household member — sits on the weather photo in
 * both the tablet hero and the phone header, so white text. */
export function WhoIsHome({ size = 44 }: { size?: number }) {
  const { entities, hassUrl } = useHa();
  const now = useNow(60_000);

  return (
    <div className="flex flex-wrap gap-2.5 [text-shadow:none]">
      {HOUSEHOLD_PEOPLE.map((id) => {
        const person = entities[id];
        if (!person) return null;
        const name = (person.attributes.friendly_name as string | undefined) ?? id.split(".")[1];
        const picture = person.attributes.entity_picture as string | undefined;
        const status = statusText(person.state);
        const home = person.state === "home";

        return (
          <div
            key={id}
            className="flex items-center gap-2.5 rounded-full border border-white/25 bg-white/15 py-1 pl-1 pr-4 text-white backdrop-blur-md"
          >
            <div className="relative shrink-0" style={{ width: size, height: size }}>
              {picture ? (
                <img
                  src={`${hassUrl ?? ""}${picture}`}
                  alt=""
                  className={clsx(
                    "h-full w-full rounded-full object-cover transition-[filter,opacity] duration-500",
                    !home && "opacity-70 grayscale",
                  )}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white/25 text-base font-semibold">
                  {name.charAt(0)}
                </div>
              )}
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white/90"
                style={{ background: home ? HOME_GREEN : "#9aa1b5" }}
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs opacity-85">
                {status ? `${status} · ${since(person.last_changed, now, home)}` : "Not tracked yet"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
