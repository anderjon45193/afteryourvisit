import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "AfterYourVisit — Smart Follow-Up Texts for Local Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #F0FDFA 0%, #FAFAF9 50%, #FFFBEB 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 900,
            padding: "0 40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "#0D9488",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              AV
            </div>
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#0F766E",
                letterSpacing: "-0.02em",
              }}
            >
              AfterYourVisit
            </span>
          </div>

          <h1
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#1C1917",
              textAlign: "center",
              lineHeight: 1.2,
              margin: 0,
              marginBottom: 20,
            }}
          >
            Every visit deserves a follow-up.
          </h1>

          <p
            style={{
              fontSize: 24,
              color: "#78716C",
              textAlign: "center",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Send beautiful follow-up texts that delight clients and generate
            5-star Google reviews on autopilot.
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
