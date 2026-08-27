import { ListChecks, Music, Thermometer, Zap } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import {
  CURATED_CLIMATE_ENTITY,
  CURATED_ENERGY,
  CURATED_QUICK_ACTIONS,
  CURATED_WEATHER_ENTITY,
  type QuickAction,
} from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import type { RoomColor } from "../../lib/roomPalette";
import { roomColorFor } from "../../lib/roomPalette";
import { ClimateControlModal } from "../climate/ClimateControlModal";
import { QuickActionToast } from "./QuickActionToast";
import { QuickActionsModal } from "./QuickActionsModal";
import { SpotifySearchModal } from "./SpotifySearchModal";
import { weatherIcon } from "./statusIcons";
import { useSpotifyNowPlaying } from "./useSpotifyNowPlaying";

const SPOTIFY_COLOR: RoomColor = {
  gradient: "linear-gradient(135deg, #1DB954, #169c46)",
  glass: "linear-gradient(135deg, rgba(29,185,84,0.35), rgba(29,185,84,0.15))",
  accent: "#1DB954",
};

function StatusTile({
  icon: Icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  value: string;
  color: RoomColor;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={clsx(
        "flex flex-1 items-center gap-3 rounded-2xl border border-white/40 px-4 py-3 text-left shadow-sm backdrop-blur-md",
        onClick && "cursor-pointer transition-[filter,transform] hover:brightness-95 active:scale-[0.98]",
      )}
      style={{ background: color.glass }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70"
        style={{ color: color.accent }}
      >
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-text-dim">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-text">{value}</div>
      </div>
    </Tag>
  );
}

export function StatusBar() {
  const { entities, callService } = useHa();
  const [climateOpen, setClimateOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [spotifyOpen, setSpotifyOpen] = useState(false);
  const [toastAction, setToastAction] = useState<QuickAction | null>(null);
  // Bumped on every tap so re-tapping the same action while its toast is
  // already showing remounts QuickActionToast (fresh animation + timer)
  // instead of silently reusing the still-running one.
  const [toastNonce, setToastNonce] = useState(0);

  const weather = entities[CURATED_WEATHER_ENTITY];
  const climate = entities[CURATED_CLIMATE_ENTITY];
  const consumption = entities[CURATED_ENERGY.consumption];
  const spotifyTrack = useSpotifyNowPlaying()?.item;

  const WeatherIcon = weatherIcon(weather?.state);
  const weatherTemp = weather?.attributes.temperature;
  const weatherUnit = weather?.attributes.temperature_unit ?? "°";

  function runAction(action: QuickAction) {
    if (action.entityIds.length === 0) return;
    callService("homeassistant", action.action, {}, { entity_id: action.entityIds }).catch(
      () => {},
    );
    setActionsOpen(false);
    setToastAction(action);
    setToastNonce((n) => n + 1);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatusTile
        icon={WeatherIcon}
        label="Weather"
        color={roomColorFor(0)}
        value={
          weather
            ? `${weatherTemp}${weatherUnit} · ${weather.state.replace(/-/g, " ")}`
            : "—"
        }
      />
      <StatusTile
        icon={Zap}
        label="Power"
        color={roomColorFor(4)}
        value={
          consumption
            ? `${consumption.state}${consumption.attributes.unit_of_measurement ?? ""}`
            : "—"
        }
      />
      <StatusTile
        icon={ListChecks}
        label="Quick Actions"
        color={roomColorFor(2)}
        value="Leaving · Party · Night"
        onClick={() => setActionsOpen(true)}
      />
      <StatusTile
        icon={Thermometer}
        label="Climate"
        color={roomColorFor(5)}
        value={
          climate
            ? `${climate.attributes.current_temperature ?? "—"}° · ${climate.state}`
            : "—"
        }
        onClick={climate ? () => setClimateOpen(true) : undefined}
      />
      <StatusTile
        icon={Music}
        label="Spotify"
        color={SPOTIFY_COLOR}
        value={
          spotifyTrack
            ? `${spotifyTrack.name} · ${spotifyTrack.artists.map((a) => a.name).join(", ")}`
            : "Tap to play"
        }
        onClick={() => setSpotifyOpen(true)}
      />

      {climateOpen && climate && (
        <ClimateControlModal
          entityId={CURATED_CLIMATE_ENTITY}
          onClose={() => setClimateOpen(false)}
        />
      )}

      {actionsOpen && (
        <QuickActionsModal
          actions={CURATED_QUICK_ACTIONS}
          onSelect={runAction}
          onClose={() => setActionsOpen(false)}
        />
      )}

      {spotifyOpen && <SpotifySearchModal onClose={() => setSpotifyOpen(false)} />}

      {toastAction && (
        <QuickActionToast
          key={`${toastAction.key}-${toastNonce}`}
          action={toastAction}
          onDismiss={() => setToastAction(null)}
        />
      )}
    </div>
  );
}
