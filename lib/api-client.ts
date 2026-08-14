import type { Locale } from "./i18n/config";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const TOKEN_STORAGE_KEY = "mujtamaaty.apiToken.v1";

export const AUTH_TOKEN_COOKIE = "mujtamaaty_auth_token";
const AUTH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readAuthTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_TOKEN_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    const value = decodeURIComponent(match[1]);
    return value || null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromStorage = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (fromStorage) {
    if (!readAuthTokenCookie()) {
      document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(fromStorage)}; path=/; max-age=${AUTH_TOKEN_COOKIE_MAX_AGE}; SameSite=Lax`;
    }
    return fromStorage;
  }
  const fromCookie = readAuthTokenCookie();
  if (fromCookie) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, fromCookie);
    return fromCookie;
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_TOKEN_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
}


const USER_CACHE_KEY = "mujtamaaty.cachedUser.v1";


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


export interface CachedMyAccess {
  userId: string;
  subscribedCommunityIds: string[];
  enrolledCourseIds: string[];
  communitySubscriptionDates: [string, { startAt: string; endAt: string }][];
}

const MY_ACCESS_CACHE_KEY = "mujtamaaty.myAccessCache.v1";


export const MY_ACCESS_CACHE_COOKIE = "mujtamaaty_cached_my_access";
const MY_ACCESS_CACHE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function getCachedMyAccess(userId: string): CachedMyAccess | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(MY_ACCESS_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedMyAccess;
    if (parsed.userId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedMyAccess(data: CachedMyAccess) {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(data);
  window.localStorage.setItem(MY_ACCESS_CACHE_KEY, json);
  document.cookie = `${MY_ACCESS_CACHE_COOKIE}=${encodeURIComponent(json)}; path=/; max-age=${MY_ACCESS_CACHE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearCachedMyAccess() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MY_ACCESS_CACHE_KEY);
  document.cookie = `${MY_ACCESS_CACHE_COOKIE}=; path=/; max-age=0`;
}


export function parseCachedMyAccessCookie(raw: string | undefined): CachedMyAccess | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as CachedMyAccess;
  } catch {
    return null;
  }
}

export function parseCachedUserCookie<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as T;
  } catch {
    return null;
  }
}

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


  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

export function readApiMessage(res: unknown): string {
  if (res && typeof res === "object" && "message" in res) {
    const message = (res as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "";
}

export type InteractionGateMessages = {
  loginRequired?: string;
  subscriptionRequired?: string;
};

export function resolveInteractionGateMessage(
  status: number,
  message: string,
  gates?: InteractionGateMessages,
): string | null {
  if (!gates) return null;
  if (status === 401 && gates.loginRequired) return gates.loginRequired;
  if (status === 403 && gates.subscriptionRequired) return gates.subscriptionRequired;

  const normalized = message.toLowerCase();
  if (
    gates.loginRequired &&
    (normalized.includes("unauthenticated") ||
      normalized.includes("unauthorized") ||
      message.includes("يجب تسجيل الدخول"))
  ) {
    return gates.loginRequired;
  }
  if (
    gates.subscriptionRequired &&
    (normalized.includes("forbidden") ||
      normalized.includes("not allowed") ||
      message.includes("غير مسموح") ||
      message.includes("غير مصرح"))
  ) {
    return gates.subscriptionRequired;
  }
  return null;
}

export function userFacingApiError(
  err: unknown,
  fallback: string,
  gates?: InteractionGateMessages,
): string {
  if (err instanceof ApiError) {
    const gateMessage = resolveInteractionGateMessage(err.status, err.message, gates);
    if (gateMessage) return gateMessage;
    if (err.status >= 500 || err.message === "An error occurred") return fallback;
    return err.message;
  }
  return fallback;
}

export type ReactionResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export function reactionFailureMessage(
  result: Extract<ReactionResult, { ok: false }>,
  fallback: string,
  gates?: InteractionGateMessages,
): string {
  const gateMessage = resolveInteractionGateMessage(result.status, result.message, gates);
  if (gateMessage) return gateMessage;
  if (result.status >= 500 || result.message === "An error occurred") return fallback;
  return result.message;
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
    auth = true,
    token,
  }: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: FormData | Record<string, unknown>;
    locale: Locale;
    auth?: boolean;
    token?: string | null;
  }
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(0, "NEXT_PUBLIC_API_BASE_URL is not set — nothing to call yet.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    lang: locale,

    "ngrok-skip-browser-warning": "true"
  };

  if (auth) {
    const bearer = token ?? getAuthToken();
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
 
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
