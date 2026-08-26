import { Home, Loader2 } from "lucide-react";
import { useState } from "react";
import { useHa } from "../ha/HaProvider";
import { normalizeHassUrl } from "../ha/connection";

export function Login() {
  const { login, status, error } = useHa();
  const [hassUrl, setHassUrl] = useState("");
  const [token, setToken] = useState("");
  const connecting = status === "connecting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hassUrl.trim() || !token.trim()) return;
    try {
      await login(normalizeHassUrl(hassUrl), token.trim());
    } catch {
      /* error is surfaced via context */
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Home size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-text">Home Dashboard</div>
            <div className="text-xs text-text-dim">Connect to Home Assistant</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-dim">
              Home Assistant URL
            </span>
            <input
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
              placeholder="http://192.168.1.50:8123"
              value={hassUrl}
              onChange={(e) => setHassUrl(e.target.value)}
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-dim">
              Long-lived access token
            </span>
            <input
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
              type="password"
              placeholder="Paste your token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <span className="text-[11px] text-text-dim">
              Create one from your HA profile → Security → Long-lived access
              tokens.
            </span>
          </label>

          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={connecting}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {connecting && <Loader2 size={14} className="animate-spin" />}
            {connecting ? "Connecting…" : "Connect"}
          </button>
        </form>
      </div>
    </div>
  );
}
