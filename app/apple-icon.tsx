import { ImageResponse } from "next/og";

import { markDataUri } from "./components/brand/afno-mark";

// Route: /apple-icon — 180x180 iOS touch icon (opaque background, mark centered).
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0c",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri(180)} width={132} height={132} alt="AfnoUI" />
      </div>
    ),
    { ...size },
  );
}
