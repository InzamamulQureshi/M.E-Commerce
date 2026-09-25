import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: "#181513",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAF8F5",
          borderRadius: "8px",
          fontWeight: 800,
          letterSpacing: "-0.05em",
          border: "1.5px solid #A64732",
        }}
      >
        <span style={{ color: "#E07A5F" }}>F</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
