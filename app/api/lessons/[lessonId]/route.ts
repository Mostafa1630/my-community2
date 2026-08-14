import { NextRequest, NextResponse } from "next/server";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import { decryptVideoUrl } from "@/lib/video";
import { mapApiLessonVideo, type ApiLessonVideo } from "@/lib/api-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "API base URL is not configured." },
      { status: 500 }
    );
  }

  const localeParam = request.nextUrl.searchParams.get("locale") ?? "";
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  const backendRes = await fetch(
    `${API_BASE_URL.replace(/\/+$/, "")}/lessons/${lessonId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        lang: locale,
        Authorization: authHeader,
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    }
  );

  const text = await backendRes.text();

  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { message: "Upstream returned a non-JSON response." },
        { status: 502 }
      );
    }
  }

  if (!backendRes.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Request failed." },
      { status: backendRes.status }
    );
  }

  const apiLesson = data?.data as ApiLessonVideo | undefined;

  if (!apiLesson) {
    return NextResponse.json(
      { message: "Malformed upstream response." },
      { status: 502 }
    );
  }

  const lesson = mapApiLessonVideo(apiLesson);

  try {
    lesson.videoUrl = await decryptVideoUrl(apiLesson.video_url);
  } catch {
    return NextResponse.json(
      { message: "Failed to decrypt video url." },
      { status: 502 }
    );
  }

  return NextResponse.json({ data: lesson });
}