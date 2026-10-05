/**
 * Andy's consoles, for the gaming card on the Devices tab.
 *
 * PS5: the PlayStation Network integration, on the PSN account he plays on
 * (it's under Rodolfo's name, "rufongora"). Its media player is off / on
 * (online on the console) / playing (in a game); on + playing both count as
 * screen time. The today/week totals are HA history_stats sensors in
 * configuration.yaml on skylab; the 7-day chart is worked out from history.
 *
 * Switch: the Nintendo Switch parental controls integration, once added.
 */
export const GAMING = {
  kid: "Andy",
  ps5: {
    player: "media_player.playstation_5",
    today: "sensor.andy_ps5_today",
    week: "sensor.andy_ps5_this_week",
    lastOnline: "sensor.living_room_rufongora_psn_account_last_online",
    /** Media-player states that count as playing time. */
    activeStates: ["on", "playing"],
  },
};
