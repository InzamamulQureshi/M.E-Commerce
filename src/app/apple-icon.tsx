import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 90,
          background: "#181513",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAF8F5",
          borderRadius: "40px",
          fontWeight: 800,
          border: "4px solid #A64732",
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
