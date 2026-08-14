import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "./api-client";

export async function  readServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!raw) return null;

  try {
    const token = decodeURIComponent(raw);
    return token || null;
  } catch {
    return null;
  }
}