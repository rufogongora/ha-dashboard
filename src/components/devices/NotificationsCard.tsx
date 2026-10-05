import { Bell, BellOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { HOUSEHOLD_PEOPLE } from "../../config/curatedHome";
import { useHa } from "../../ha/HaProvider";
import { currentSubscription, disablePush, enablePush, pushSupport, sendTestPush } from "../../lib/push";

const ACCENT = "#4f79c9";
const PERSON_KEY = "ha-dashboard:push-person";

/**
 * Turn the dashboard's own notifications on or off for this phone. Who
 * the phone belongs to decides which alerts it gets (HA's
 * rest_command.dashboard_push can target people; everyone gets the rest).
 */
export function NotificationsCard({ index = 0 }: { index?: number }) {
  const { entities } = useHa();
  const support = pushSupport();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const people = HOUSEHOLD_PEOPLE.map((id) => ({
    key: id.split(".")[1],
    name: (entities[id]?.attributes.friendly_name as string | undefined) ?? id.split(".")[1],
  }));
  const [person, setPerson] = useState(() => {
    try {
      return localStorage.getItem(PERSON_KEY) ?? people[0]?.key ?? "";
    } catch {
      return people[0]?.key ?? "";
    }
  });

  useEffect(() => {
    if (support !== "supported") return;
    currentSubscription()
      .then((s) => setSubscribed(!!s && Notification.permission === "granted"))
      .catch(() => setSubscribed(false));
  }, [support]);

  async function run(fn: () => Promise<unknown>, done?: string) {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      if (done) setMessage(done);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function turnOn() {
    try {
      localStorage.setItem(PERSON_KEY, person);
    } catch {
      /* fine — just won't be remembered */
    }
    const name = people.find((p) => p.key === person)?.name ?? person;
    const device = /iPhone|iPad/.test(navigator.userAgent) ? "iPhone" : /Android/.test(navigator.userAgent) ? "Android" : "browser";
    return run(async () => {
      await enablePush(person, `${name}'s ${device}`);
      setSubscribed(true);
      await sendTestPush();
    }, "You're set — a test notification is on its way.");
  }

  return (
    <div className="glass rise flex flex-col gap-4 rounded-[26px] p-5" style={{ animationDelay: `${100 + index * 70}ms` }}>
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: "var(--chip-off)", color: ACCENT }}
        >
          {subscribed ? <Bell size={22} /> : <BellOff size={22} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[19px] font-semibold tracking-[-0.3px] text-text">Notifications</div>
          <div className="text-[13px] text-text-dim">
            {support === "needs-install"
              ? "Add this app to your Home Screen first"
              : support !== "supported"
                ? "Not available in this browser"
                : subscribed === null
                  ? "Checking…"
                  : subscribed
                    ? "On for this phone"
                    : "Off for this phone"}
          </div>
        </div>
      </div>

      {support === "needs-install" && (
        <p className="text-[13px] text-text-dim">
          On iPhone, notifications only work in the app added from Safari's Share menu → Add to Home Screen. Open
          it from there and turn them on.
        </p>
      )}

      {support === "supported" && subscribed === false && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] text-text-dim">Whose phone is this?</span>
            <div className="flex gap-1 rounded-full p-1" style={{ background: "var(--chip-off)" }}>
              {people.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPerson(p.key)}
                  className="flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors"
                  style={person === p.key ? { background: ACCENT, color: "#fff" } : { color: "var(--color-text-dim)" }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={turnOn}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white active:scale-95 disabled:opacity-60"
            style={{ background: ACCENT }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
            Turn on notifications
          </button>
        </>
      )}

      {support === "supported" && subscribed && (
        <div className="flex gap-2">
          <button
            onClick={() => run(sendTestPush, "Test sent.")}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold text-text active:scale-95 disabled:opacity-60"
            style={{ background: "var(--chip-off)" }}
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Send a test
          </button>
          <button
            onClick={() =>
              run(async () => {
                await disablePush();
                setSubscribed(false);
              }, "Notifications turned off for this phone.")
            }
            disabled={busy}
            className="flex-1 rounded-full py-2 text-xs font-semibold text-text active:scale-95 disabled:opacity-60"
            style={{ background: "var(--chip-off)" }}
          >
            Turn off
          </button>
        </div>
      )}

      {message && <p className="text-[13px] text-text-dim">{message}</p>}
    </div>
  );
}
