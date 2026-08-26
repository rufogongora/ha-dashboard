export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: string;
  albumArt: string | null;
  durationMs: number;
}

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string | undefined;

export function isSpotifyConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * Client Credentials flow — app-level auth for catalog search only (no user
 * login/consent, no personal data access). Token is cached in memory and
 * refetched a little before it actually expires.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Spotify isn't configured (missing VITE_SPOTIFY_CLIENT_ID/SECRET).");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Spotify auth failed (${res.status}).`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
  if (!query.trim()) return [];
  const token = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Spotify search failed (${res.status}).`);

  const data = (await res.json()) as {
    tracks: {
      items: {
        id: string;
        uri: string;
        name: string;
        duration_ms: number;
        artists: { name: string }[];
        album: { images: { url: string }[] };
      }[];
    };
  };

  return data.tracks.items.map((t) => ({
    id: t.id,
    uri: t.uri,
    name: t.name,
    artists: t.artists.map((a) => a.name).join(", "),
    albumArt: t.album.images.at(-1)?.url ?? null,
    durationMs: t.duration_ms,
  }));
}
