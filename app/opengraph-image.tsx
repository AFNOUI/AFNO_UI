import { ImageResponse } from "next/og";

import { siteConfig, siteHost } from "./lib/seo";
import { markDataUri } from "./components/brand/afno-mark";

// Route: /opengraph-image — a 1200x630 social preview card rendered at the edge.
export const runtime = "edge";
export const alt = `${siteConfig.name} — Visual Form & UI Builder for React`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #171717 55%, #1e1b4b 100%)",
          padding: "80px",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "22px",
              background: "#111117",
              border: "1px solid #26262f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markDataUri(96)} width={68} height={68} alt="AfnoUI" />
          </div>
          <div style={{ display: "flex", fontSize: "46px", fontWeight: 800, letterSpacing: -1 }}>
            <span>Afno</span>
            <span style={{ color: "#818cf8" }}>UI</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: "900px",
            }}
          >
            Build Forms &amp; UIs Visually
          </div>
          <div
            style={{
              fontSize: "34px",
              color: "#a1a1aa",
              maxWidth: "960px",
              lineHeight: 1.3,
            }}
          >
            Open-source React + TypeScript components, form/UI/table/kanban
            builders, and a theme lab. Install with npx afnoui add.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "28px",
            color: "#818cf8",
            fontWeight: 600,
          }}
        >
          <span style={{ color: "#6366f1" }}>$</span>
          <span style={{ fontFamily: "monospace" }}>npx afnoui init</span>
          <span style={{ color: "#52525b", marginLeft: "auto" }}>
            {siteHost}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
