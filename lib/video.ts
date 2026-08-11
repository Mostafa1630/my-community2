
import type { CourseDetails } from "./api-types";

if (typeof window !== "undefined") {
  throw new Error("lib/video.ts is server-only and must not be imported into client components.");
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", keyMaterial, { name: "AES-CBC" }, false, ["decrypt"]);
}

export async function decryptVideoUrl(encryptedUrl: string): Promise<string> {
  const secret = process.env.VIDEO_DECRYPTION_KEY;
  if (!secret) {
    throw new Error("VIDEO_DECRYPTION_KEY is not set.");
  }

  const [ivB64, cipherB64] = encryptedUrl.split(".");
  if (!ivB64 || !cipherB64) {
    throw new Error("Malformed encrypted video url.");
  }

  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));

  const key = await deriveKey(secret);
  const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, cipherBytes);

  return new TextDecoder().decode(decryptedBuffer);
}

export async function withDecryptedIntroVideo(course: CourseDetails): Promise<CourseDetails> {
  if (!course.introVideo) return course;
  try {
    return { ...course, introVideo: await decryptVideoUrl(course.introVideo) };
  } catch {
    return { ...course, introVideo: undefined };
  }
}
