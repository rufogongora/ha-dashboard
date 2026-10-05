import {
  BatteryCharging,
  BatteryMedium,
  Bot,
  Check,
  Home,
  Pause,
  Play,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { CURATED_VACUUM } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { roomColorFor, tintedGlass } from "../../lib/roomPalette";
import { useNow } from "../../lib/useNow";

const COLOR = roomColorFor(3);
const WARN = "#d9822b";
const P = CURATED_VACUUM.prefix;
const VACUUM = `vacuum.${P}`;
/** Below this many hours left, a brush/filter shows up as a reminder. */
const CONSUMABLE_WARN_HOURS = 10;

const CONSUMABLES: [string, string][] = [
  ["main_brush_time_left", "main brush"],
  ["side_brush_time_left", "side brush"],
  ["filter_time_left", "filter"],
  ["sensor_time_left", "sensors"],
];

/** HA state values like "segment_cleaning" -> "Segment cleaning". */
function pretty(value: string) {
  const s = value.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const MODE_LABELS: Record<string, string> = {
  vacuum: "Vacuum",
  vac_and_mop: "Vac + mop",
  mop: "Mop",
  smart_mode: "Smart",
  custom: "Custom",
};

interface Room {
  id: number;
  name: string;
}

/** Rooms on the vacuum's current map, via Roborock's get_maps action —
 * unlike HA's vacuum/get_segments, it isn't admin-only, so it works for
 * the phone's non-admin login too. */
function useVacuumRooms(currentMap: string | undefined): Room[] | null {
  const { sendMessage } = useHa();
  const [maps, setMaps] = useState<
    { name: string; rooms: Record<string, string> }[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    sendMessage<{
      response: Record<
        string,
        { maps: { name: string; rooms: Record<string, string> }[] }
      >;
    }>({
      type: "call_service",
      domain: "roborock",
      service: "get_maps",
      target: { entity_id: VACUUM },
      return_response: true,
    })
      .then((res) => {
        if (!cancelled) setMaps(res.response?.[VACUUM]?.maps ?? []);
      })
      .catch(() => {
        if (!cancelled) setMaps([]);
      });
    return () => {
      cancelled = true;
    };
  }, [sendMessage]);

  if (!maps) return null;
  const map = maps.find((m) => m.name === currentMap) ?? maps[0];
  if (!map) return [];
  return Object.entries(map.rooms)
    .map(([id, name]) => ({ id: Number(id), name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function ago(iso: string | undefined, now: Date) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  const mins = Math.round((now.getTime() - t) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const h = Math.floor(mins / 60);
  return h < 24 ? `${h} h ago` : `${Math.floor(h / 24)} d ago`;
}

/** `wide`: the tablet's full-width layout, with the map in its own column
 * beside the controls instead of stacked above them. */
export function VacuumCard({
  index = 0,
  wide = false,
}: {
  index?: number;
  wide?: boolean;
}) {
  const { entities, callService, hassUrl } = useHa();
  const now = useNow(60_000);
  const [selected, setSelected] = useState<number[]>([]);
  const vacuum = entities[VACUUM];
  const s = (key: string) => entities[`sensor.${P}_${key}`]?.state;
  const on = (id: string) => entities[id]?.state === "on";

  const rooms = useVacuumRooms(entities[`select.${P}_selected_map`]?.state);
  const modeSelect = entities[`select.${P}_cleaning_mode`];
  const modeOptions =
    (modeSelect?.attributes.options as string[] | undefined) ?? [];
  const map = entities[`image.${P}_map_0`]?.attributes.entity_picture as
    string | undefined;

  if (!vacuum) return null;

  const state = vacuum.state; // docked | cleaning | returning | paused | idle | error
  const cleaning = state === "cleaning";
  const status = s("status");
  const battery = Number(s("battery"));
  const charging = on(`binary_sensor.${P}_charging`);
  const progress = Number(s("cleaning_progress"));
  const room = s("current_room");
  const lastEnd = s("last_clean_end");

  const alerts: string[] = [];
  const error = s("vacuum_error");
  if (error && error !== "none" && error !== "unavailable")
    alerts.push(pretty(error));
  const dockError = s("dock_dock_error");
  if (dockError && dockError !== "ok" && dockError !== "unavailable")
    alerts.push(pretty(dockError));
  if (on(`binary_sensor.${P}_dock_dirty_water_box`))
    alerts.push("Dirty water tank full");
  if (on(`binary_sensor.${P}_dock_clean_water_box`))
    alerts.push("Clean water tank empty");
  if (on(`binary_sensor.${P}_water_shortage`)) alerts.push("Water low");
  for (const [key, label] of CONSUMABLES) {
    const secs = Number(s(key));
    if (Number.isFinite(secs) && secs < CONSUMABLE_WARN_HOURS * 3600) {
      alerts.push(secs <= 0 ? `Replace ${label}` : `Replace ${label} soon`);
    }
  }

  function call(
    domain: string,
    service: string,
    data: Record<string, unknown> = {},
    entityId = VACUUM,
  ) {
    navigator.vibrate?.(12);
    callService(domain, service, data, { entity_id: entityId }).catch(() => {});
  }

  function start() {
    if (selected.length > 0) {
      call("vacuum", "send_command", {
        command: "app_segment_clean",
        params: [{ segments: selected }],
      });
      setSelected([]);
    } else {
      call("vacuum", "start");
    }
  }

  const statusText =
    status && status !== "unavailable" ? pretty(status) : pretty(state);

  return (
    <div
      className={clsx(
        "glass rise rounded-[26px] p-5",
        wide
          ? "grid gap-5 md:grid-cols-[minmax(0,1fr)_340px]"
          : "flex flex-col gap-4",
      )}
      style={{
        background: tintedGlass(COLOR),
        animationDelay: `${300 + index * 50}ms`,
      }}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "var(--chip-off)", color: COLOR.accent }}
          >
            <Bot size={22} className={clsx(cleaning && "animate-pulse")} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[19px] font-semibold tracking-[-0.3px] text-text">
              {CURATED_VACUUM.name}
            </div>
            <div className="truncate text-[13px] text-text-dim">
              {statusText}
              {cleaning && room && room !== "unavailable" ? ` · ${room}` : ""}
            </div>
          </div>
          {Number.isFinite(battery) && (
            <span className="flex items-center gap-1 text-sm font-semibold tabular-nums text-text">
              {charging ? (
                <BatteryCharging size={18} style={{ color: COLOR.accent }} />
              ) : (
                <BatteryMedium
                  size={18}
                  style={{ color: battery <= 20 ? WARN : COLOR.accent }}
                />
              )}
              {battery}%
            </span>
          )}
        </div>

        {cleaning && Number.isFinite(progress) && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px] text-text-dim">
              <span>Progress</span>
              <span className="font-semibold text-text">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-text-dim/20">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${progress}%`, background: COLOR.accent }}
              />
            </div>
          </div>
        )}

        {map && !wide && (
          <img
            src={`${hassUrl ?? ""}${map}`}
            alt="Vacuum map"
            className="h-44 w-full rounded-2xl object-contain"
            style={{ background: "var(--chip-off)" }}
          />
        )}

        {alerts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {alerts.map((a) => (
              <span
                key={a}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: "#ffe6d2", color: "#a85a14" }}
              >
                <TriangleAlert size={12} />
                {a}
              </span>
            ))}
          </div>
        )}

        {modeOptions.length > 0 && (
          <div
            className="flex gap-1 rounded-full p-1"
            style={{ background: "var(--chip-off)" }}
          >
            {modeOptions
              .filter((o) => MODE_LABELS[o])
              .map((o) => (
                <button
                  key={o}
                  onClick={() =>
                    call(
                      "select",
                      "select_option",
                      { option: o },
                      `select.${P}_cleaning_mode`,
                    )
                  }
                  className={clsx(
                    "flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors",
                    modeSelect?.state === o ? "text-white" : "text-text-dim",
                  )}
                  style={
                    modeSelect?.state === o
                      ? { background: COLOR.accent }
                      : undefined
                  }
                >
                  {MODE_LABELS[o]}
                </button>
              ))}
          </div>
        )}

        {rooms && rooms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {rooms.map((r) => {
              const picked = selected.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    navigator.vibrate?.(8);
                    setSelected((cur) =>
                      picked ? cur.filter((x) => x !== r.id) : [...cur, r.id],
                    );
                  }}
                  aria-pressed={picked}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={
                    picked
                      ? { background: COLOR.accent, color: "#fff" }
                      : {
                          background: "var(--chip-off)",
                          color: "var(--color-text)",
                        }
                  }
                >
                  {picked && <Check size={12} />}
                  {r.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          {cleaning ? (
            <button
              onClick={() => call("vacuum", "pause")}
              className="flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white active:scale-95"
              style={{ background: COLOR.accent }}
            >
              <Pause size={16} /> Pause
            </button>
          ) : (
            <button
              onClick={start}
              className="flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white active:scale-95"
              style={{ background: COLOR.accent }}
            >
              <Play size={16} />
              {selected.length > 0
                ? `Clean ${selected.length} room${selected.length > 1 ? "s" : ""}`
                : state === "paused"
                  ? "Resume"
                  : "Clean everywhere"}
            </button>
          )}
          {state !== "docked" && (
            <button
              onClick={() => call("vacuum", "return_to_base")}
              className="flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-text active:scale-95"
              style={{ background: "var(--chip-off)" }}
            >
              <Home size={16} /> Dock
            </button>
          )}
        </div>

        {!cleaning && ago(lastEnd, now) && (
          <div className="text-[13px] text-text-dim">
            Last cleaned {ago(lastEnd, now)}
          </div>
        )}
      </div>

      {map && wide && (
        <img
          src={`${hassUrl ?? ""}${map}`}
          alt="Vacuum map"
          className="h-full min-h-[220px] w-full rounded-2xl object-contain"
          style={{ background: "var(--chip-off)" }}
        />
      )}
    </div>
  );
}
