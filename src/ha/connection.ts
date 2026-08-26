import {
  Auth,
  Connection,
  createConnection,
  createLongLivedTokenAuth,
  ERR_INVALID_AUTH,
  ERR_CANNOT_CONNECT,
} from "home-assistant-js-websocket";

const STORAGE_KEY = "ha-dashboard:credentials";

export interface HaCredentials {
  hassUrl: string;
  token: string;
}

export function loadCredentials(): HaCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.hassUrl && parsed?.token) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveCredentials(creds: HaCredentials) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
}

export function clearCredentials() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Normalizes a user-entered HA URL (strips trailing slash, adds http:// if missing scheme). */
export function normalizeHassUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }
  return url.replace(/\/+$/, "");
}

export class AuthError extends Error {}
export class ConnectError extends Error {}

/** Establishes an authenticated websocket connection using a long-lived access token. */
export async function connectWithToken(
  hassUrl: string,
  token: string,
): Promise<Connection> {
  const auth: Auth = createLongLivedTokenAuth(hassUrl, token);
  try {
    return await createConnection({ auth });
  } catch (err) {
    if (err === ERR_INVALID_AUTH) {
      throw new AuthError("That access token was rejected by Home Assistant.");
    }
    if (err === ERR_CANNOT_CONNECT) {
      throw new ConnectError(
        "Could not reach Home Assistant at that address. Check the URL and that it's reachable from this browser.",
      );
    }
    throw err;
  }
}
