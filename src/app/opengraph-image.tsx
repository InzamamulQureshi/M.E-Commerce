import { ImageResponse } from "next/og";

export const alt = "The Fourfold | Handcrafted Gifting Studio • Mumbai";
export const dynamic = "force-dynamic";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#181513",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle decorative background gradient accent */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(166,71,50,0.25) 0%, rgba(24,21,19,0) 70%)",
          }}
        />

        {/* Top studio badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#E07A5F",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "#E07A5F",
              fontWeight: 700,
            }}
          >
            Bandra West • Mumbai • India
          </span>
        </div>

        {/* Center Main Typography */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 900,
              color: "#FAF8F5",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            The Fourfold
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#D1C9BE",
              fontWeight: 400,
              margin: 0,
              maxWidth: "850px",
              lineHeight: 1.3,
            }}
          >
            Cherished memories folded by hand. Personalized explosion boxes, keepsake albums & everlasting crochet flowers.
          </p>
        </div>

        {/* Bottom studio details */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1.5px solid #2E2925",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <span style={{ fontSize: "16px", color: "#A89F91", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Explosion Boxes
            </span>
            <span style={{ fontSize: "16px", color: "#665E54" }}>•</span>
            <span style={{ fontSize: "16px", color: "#A89F91", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Handmade Cards
            </span>
            <span style={{ fontSize: "16px", color: "#665E54" }}>•</span>
            <span style={{ fontSize: "16px", color: "#A89F91", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Keepsake Albums
            </span>
            <span style={{ fontSize: "16px", color: "#665E54" }}>•</span>
            <span style={{ fontSize: "16px", color: "#A89F91", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Crochet Florals
            </span>
          </div>
          <span
            style={{
              fontSize: "17px",
              color: "#E07A5F",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              paddingLeft: "24px",
            }}
          >
            thefourfold.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
