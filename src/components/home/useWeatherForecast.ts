import { useEffect, useState } from "react";
import { useHa } from "../../ha/HaProvider";

export interface ForecastEntry {
  datetime: string;
  condition?: string;
  temperature?: number;
  templow?: number;
}

/**
 * Live forecast for a weather entity via HA's `weather/subscribe_forecast`
 * websocket subscription (forecasts stopped being entity attributes in
 * 2024.3; this is what HA's own weather card uses now). Pushes a fresh list
 * whenever the integration updates.
 */
export function useWeatherForecast(
  entityId: string,
  type: "hourly" | "daily",
): ForecastEntry[] | null {
  const { status, subscribeMessage } = useHa();
  const [forecast, setForecast] = useState<ForecastEntry[] | null>(null);

  useEffect(() => {
    if (status !== "connected") return;
    let cancelled = false;
    let unsub: (() => Promise<void>) | undefined;

    subscribeMessage<{ forecast: ForecastEntry[] | null }>(
      (msg) => setForecast(msg.forecast ?? null),
      { type: "weather/subscribe_forecast", entity_id: entityId, forecast_type: type },
    )
      .then((u) => {
        if (cancelled) u().catch(() => {});
        else unsub = u;
      })
      .catch(() => {
        /* integration may not support this forecast type — hero just omits it */
      });

    return () => {
      cancelled = true;
      unsub?.().catch(() => {});
    };
  }, [entityId, type, status, subscribeMessage]);

  return forecast;
}
