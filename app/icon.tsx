import { ImageResponse } from "next/og";

import { markDataUri } from "./components/brand/afno-mark";

// Route: /icon — generated favicon (the Block-Layers mark on a dark tile).
export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

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
          background: "#0a0a0c",
          borderRadius: 108,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri(512)} width={368} height={368} alt="AfnoUI" />
      </div>
    ),
    { ...size },
  );
}
