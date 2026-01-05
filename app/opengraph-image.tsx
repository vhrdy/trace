import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Trace - Solana Tax Tracker";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          backgroundImage: "linear-gradient(to bottom right, #fafafa 0%, #f4f4f5 100%)",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(249, 115, 22, 0.05) 2%, transparent 0%),
                             radial-gradient(circle at 75px 75px, rgba(249, 115, 22, 0.05) 2%, transparent 0%)`,
            backgroundSize: "100px 100px",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo/Title */}
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "#18181b",
              marginBottom: 20,
            }}
          >
            trace.
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 600,
              color: "#f97316",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Every trade, tracked automatically
          </div>

          {/* Description */}
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#71717a",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            Generate Solana tax reports in seconds. FIFO/LIFO support, multi-wallet tracking, and accountant-ready exports.
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              marginTop: 60,
              gap: 30,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#fef3f2",
                padding: "16px 32px",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#f97316",
                }}
              >
                ⚡ Lightning Fast
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#fef3f2",
                padding: "16px 32px",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#f97316",
                }}
              >
                ✓ Auto-Detection
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#fef3f2",
                padding: "16px 32px",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#f97316",
                }}
              >
                📄 Accountant-Ready
              </div>
            </div>
          </div>
        </div>

        {/* Footer badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            display: "flex",
            alignItems: "center",
            backgroundColor: "#18181b",
            padding: "16px 32px",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Start Free
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
