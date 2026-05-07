"use client";

import type { Industry } from "@/lib/api";

function satClass(s: number) {
  if (s >= 7.5) return "#c0505a";
  if (s >= 5.5) return "#b89150";
  return "#4d9070";
}

function satLabel(s: number) {
  if (s >= 7.5) return "high";
  if (s >= 5.5) return "mid";
  return "low";
}

export default function SignalBand({ industries }: { industries: Industry[] }) {
  const doubled = [...industries, ...industries];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "linear-gradient(180deg,#080809 0%,#060607 100%)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.35rem 1.25rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--fg-muted)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 12px var(--accent)",
            animation: "pulse-dot 2.4s ease-in-out infinite",
            display: "inline-block",
          }}
        />
        <span>live saturation index</span>
      </div>

      {/* SVG lines + marquee */}
      <div style={{ position: "relative", overflow: "hidden", minHeight: 72 }}>
        {/* Background signal lines */}
        <svg
          viewBox="0 0 1200 72"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          aria-hidden
        >
          <defs>
            <linearGradient id="sg" x1="0" x2="1">
              <stop offset="0%" stopColor="rgba(196,165,116,0)" />
              <stop offset="50%" stopColor="rgba(196,165,116,0.25)" />
              <stop offset="100%" stopColor="rgba(196,165,116,0)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#sg)" opacity="0.5" />
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 12 + i * 12;
            const d = `M0 ${y} Q 150 ${y - 8 + (i % 3) * 4} 300 ${y} T 600 ${y} T 900 ${y} T 1200 ${y + Math.sin(i * 1.7) * 3}`;
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(232,230,227,0.12)"
                strokeWidth="1"
                strokeDasharray="8 14"
                style={{
                  animation: `signal-dash ${20 + i * 5}s linear infinite`,
                  animationDelay: `${-i * 3}s`,
                }}
              />
            );
          })}
        </svg>

        {/* Scrolling marquee */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            minHeight: 72,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "3rem",
              animation: "marquee 48s linear infinite",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.04em",
              color: "var(--fg-muted)",
              paddingLeft: "1.25rem",
            }}
          >
            {doubled.map((ind, idx) => (
              <span
                key={idx}
                style={{ display: "inline-flex", alignItems: "baseline", gap: "0.65rem" }}
              >
                <strong style={{ color: "var(--fg)", fontWeight: 500 }}>{ind.name}</strong>
                <span style={{ color: satClass(ind.saturation), fontVariantNumeric: "tabular-nums" }}>
                  {ind.saturation.toFixed(1)}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "0.25rem 0.45rem",
                    border: "1px solid var(--line)",
                    color: satClass(ind.saturation),
                  }}
                >
                  {satLabel(ind.saturation)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
