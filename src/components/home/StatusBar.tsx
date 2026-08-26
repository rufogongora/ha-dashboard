import { Lightbulb, Thermometer, Zap } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import {
  CURATED_CLIMATE_ENTITY,
  CURATED_ENERGY,
  CURATED_ROOMS,
  CURATED_WEATHER_ENTITY,
} from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { roomColorFor, type RoomColor } from "../../lib/roomPalette";
import { ClimateControlModal } from "../climate/ClimateControlModal";
import { weatherIcon } from "./statusIcons";

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
  const { entities } = useHa();
  const [climateOpen, setClimateOpen] = useState(false);

  const weather = entities[CURATED_WEATHER_ENTITY];
  const climate = entities[CURATED_CLIMATE_ENTITY];
  const consumption = entities[CURATED_ENERGY.consumption];

  const allToggleIds = CURATED_ROOMS.flatMap((r) => r.toggles.map((t) => t.entityId));
  const onCount = allToggleIds.filter((id) => entities[id]?.state === "on").length;

  const WeatherIcon = weatherIcon(weather?.state);
  const weatherTemp = weather?.attributes.temperature;
  const weatherUnit = weather?.attributes.temperature_unit ?? "°";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        icon={Lightbulb}
        label="Devices on"
        color={roomColorFor(2)}
        value={`${onCount} / ${allToggleIds.length}`}
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

      {climateOpen && climate && (
        <ClimateControlModal
          entityId={CURATED_CLIMATE_ENTITY}
          onClose={() => setClimateOpen(false)}
        />
      )}
    </div>
  );
}
