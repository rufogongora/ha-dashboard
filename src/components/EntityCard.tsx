import type { EntityWithArea } from "../ha/types";
import { BinarySensorCard } from "./cards/BinarySensorCard";
import { CameraCard } from "./cards/CameraCard";
import { ClimateCard } from "./cards/ClimateCard";
import { CoverCard } from "./cards/CoverCard";
import { LightCard } from "./cards/LightCard";
import { MediaPlayerCard } from "./cards/MediaPlayerCard";
import { SceneCard } from "./cards/SceneCard";
import { SensorCard } from "./cards/SensorCard";
import { SwitchCard } from "./cards/SwitchCard";
import { VacuumCard } from "./cards/VacuumCard";

export function EntityCard({
  ent,
  isFavorite,
  onToggleFavorite,
}: {
  ent: EntityWithArea;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const props = { ent, isFavorite, onToggleFavorite };

  switch (ent.domain) {
    case "camera":
      return <CameraCard {...props} />;
    case "light":
      return <LightCard {...props} />;
    case "switch":
    case "fan":
    case "lock":
      return <SwitchCard {...props} />;
    case "climate":
      return <ClimateCard {...props} />;
    case "media_player":
      return <MediaPlayerCard {...props} />;
    case "sensor":
      return <SensorCard {...props} />;
    case "binary_sensor":
      return <BinarySensorCard {...props} />;
    case "vacuum":
      return <VacuumCard {...props} />;
    case "scene":
      return <SceneCard {...props} />;
    case "cover":
      return <CoverCard {...props} />;
    default:
      return null;
  }
}
