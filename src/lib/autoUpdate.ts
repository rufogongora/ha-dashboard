const CHECK_MS = 5 * 60 * 1000;

/** The hashed entry bundle a page references, e.g. "/assets/index-AbC123.js". */
function entryScript(html: string): string | null {
  return html.match(/\/assets\/index-[\w-]+\.js/)?.[0] ?? null;
}

/**
 * Reloads the page when a new build has been deployed. The wall tablet
 * never gets a manual refresh, so without this it would run whatever build
 * it first loaded indefinitely. Every few minutes (and when the app comes
 * back to the foreground) it fetches index.html, bypassing every cache, and
 * compares its bundle name with the one this page is running.
 */
export function startAutoUpdate() {
  const running = entryScript(document.documentElement.innerHTML);
  if (!running) return;

  async function check() {
    try {
      const res = await fetch("/", { cache: "no-store" });
      if (!res.ok) return;
      const latest = entryScript(await res.text());
      if (latest && latest !== running) window.location.reload();
    } catch {
      /* offline or server restarting — try again next time */
    }
  }

  setInterval(check, CHECK_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
}
