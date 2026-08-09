import type { Locale } from "./i18n/config";

// Shared HTTP client for the real backend, introduced as we connect each feature
// away from the local JSON/localStorage mock data one at a time — see auth-context.tsx
// for the first consumer (change-password). Every subsequent endpoint should go
// through `apiFetch` rather than hand-rolling `fetch` calls, so token attachment,
// the `lang` header, and Laravel-style error parsing stay in one place.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const TOKEN_STORAGE_KEY = "mujtamaaty.apiToken.v1";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// A cached copy of the last known /auth/profile response, kept alongside the
// token so a page refresh can render the logged-in UI immediately instead of
// waiting on a fresh network round-trip — the profile is still re-verified
// in the background afterwards (see AuthProvider's hydrate effect), this is
// only for what shows up on the very first paint.
const USER_CACHE_KEY = "mujtamaaty.cachedUser.v1";

// Mirrors the same cached profile into a cookie, under this name, so the
// root layout (a Server Component — no access to localStorage) can read it
// during SSR and render the already-correct signed-in UI in the very first
// HTML sent to the browser. That's what actually eliminates the
// guest-then-flip flash on refresh, rather than just shortening it —
// localStorage alone can only ever resolve after the client's own JS runs.
export const USER_CACHE_COOKIE = "mujtamaaty_cached_user";
const USER_CACHE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function getCachedUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCachedUser(user: unknown) {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(user);
  window.localStorage.setItem(USER_CACHE_KEY, json);
  document.cookie = `${USER_CACHE_COOKIE}=${encodeURIComponent(json)}; path=/; max-age=${USER_CACHE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearCachedUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_CACHE_KEY);
  document.cookie = `${USER_CACHE_COOKIE}=; path=/; max-age=0`;
}

// GET /settings rarely changes and is public — no reason to hit it on every
// single page load. Cached alongside the timestamp of our own fetch (not the
// response's own `last_updated`, which only ever moves further into the past
// relative to "now" and so can never itself signal "go refetch"); once that
// fetch is older than SETTINGS_CACHE_TTL_MS, the next read is treated as a
// miss and a fresh request replaces it.
const SETTINGS_CACHE_KEY = "mujtamaaty.settingsCache.v1";
const SETTINGS_CACHE_TTL_MS = 10 * 60 * 1000;

export function getCachedSettings<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SETTINGS_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { data: T; fetchedAt: number };
    if (Date.now() - parsed.fetchedAt > SETTINGS_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function setCachedSettings(data: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
}

// Server-side counterpart of getCachedUser — parses the same cookie's raw
// value (as read via next/headers' cookies() in a Server Component) instead
// of localStorage, which doesn't exist there. Only ever holds display data
// (name/avatar/role/...), never the bearer token itself — the token stays
// localStorage-only, so this cookie alone can't be used to make authenticated
// requests, only to pre-render what a cached session looked like.
export function parseCachedUserCookie<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as T;
  } catch {
    return null;
  }
}

// Laravel's default validation-error shape: { message, errors: { field: ["msg", ...] } }
export interface ApiFieldErrors {
  [field: string]: string[];
}

export class ApiError extends Error {
  status: number;
  fieldErrors: ApiFieldErrors;

  constructor(status: number, message: string, fieldErrors: ApiFieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  // First error message for a given field, if any — the common case for showing
  // inline validation feedback under an input.
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

function buildUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = `/${path.replace(/^\/+/, "")}`;
  return `${base}${cleanPath}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  {
    method = "GET",
    body,
    locale,
    auth = true
  }: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: FormData | Record<string, unknown>;
    locale: Locale;
    auth?: boolean;
  }
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(0, "NEXT_PUBLIC_API_BASE_URL is not set — nothing to call yet.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    lang: locale,
    // The dev backend is currently tunneled through ngrok's free tier, which
    // serves an HTML "you're about to visit an ngrok site" interstitial to
    // any request that looks like it's coming from a browser — silently
    // breaking every client-side fetch (JSON.parse on that HTML throws,
    // caught by each getX() helper's try/catch, surfacing as an empty
    // result with no visible error). Requests from Node (SSR/build) don't
    // trigger it, which is why server-rendered pages worked immediately but
    // client-side calls — pagination, search-driven refetches, form
    // submissions — silently returned nothing until this was added. Harmless
    // to send once ngrok is out of the picture; a real backend just ignores
    // an unrecognized header.
    "ngrok-skip-browser-warning": "true"
  };

  if (auth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
    // Don't set Content-Type manually for FormData — the browser sets the
    // multipart boundary itself; setting it here breaks the upload.
  } else if (body) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  // Every piece of data this app reads (community/course details, prices,
  // privacy type, ...) is editable elsewhere in the same app, so a stale
  // read is never actually desirable here — cache: "no-store" only matters
  // for the Server Component call sites (getCommunityDetails and friends in
  // lib/api-content.ts); client-side fetches are never subject to Next's
  // server Data Cache in the first place, so this is a no-op for those.
  // Confirmed live: without this, editing a community's type from private
  // back to public didn't show up on the next visit to its feed page — the
  // Server Component was still serving Next's cached fetch from before the
  // edit.
  const response = await fetch(buildUrl(path), { method, headers, body: requestBody, cache: "no-store" });

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Backend (or something in front of it — a proxy, a tunnel's own
      // interstitial, a misconfigured route) returned non-JSON. Surface a
      // real ApiError instead of letting JSON.parse's SyntaxError propagate
      // uncaught, so callers' try/catch around apiFetch actually catches it.
      throw new ApiError(response.status, `Expected JSON, got: ${text.slice(0, 200)}`);
    }
  }

  if (!response.ok) {
    const message = data?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, data?.errors ?? {});
  }

  return data as T;
}
