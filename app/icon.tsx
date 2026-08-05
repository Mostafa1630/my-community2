import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Generated (not a cropped asset — the only logo file the client supplied is a
// wide combined icon+wordmark lockup, and no image-editing tooling is available
// in this environment to crop a clean square mark out of it). Recreates the same
// rounded-square "N" + accent dot shape from that logo at favicon size instead of
// leaving the site with no favicon at all.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E5B52",
          borderRadius: 14,
          position: "relative"
        }}
      >
        <span style={{ fontSize: 38, fontWeight: 700, color: "#FFFFFF", fontFamily: "sans-serif" }}>N</span>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#D79A3B"
          }}
        />
      </div>
    ),
    { ...size }
  );
}
