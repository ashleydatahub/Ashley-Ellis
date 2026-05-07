"use client";

import { useState } from "react";
import type { Industry } from "@/lib/api";

function satClass(s: number) {
  if (s >= 7.5) return "high";
  if (s >= 5.5) return "mid";
  return "low";
}

const BADGE_COLORS: Record<string, string> = {
  high: "rgba(139,58,58,0.45)",
  mid:  "rgba(196,165,116,0.45)",
  low:  "rgba(74,124,110,0.45)",
};
const BADGE_TEXT: Record<string, string> = {
  high: "#c08080",
  mid:  "#c4a574",
  low:  "#8fbcab",
};

export default function IndustryGrid({ industries }: { industries: Industry[] }) {
  const [filter, setFilter] = useState<"all" | "high" | "mid" | "low">("all");

  const visible = industries.filter((ind) => {
    if (filter === "all") return true;
    return satClass(ind.saturation) === filter;
  });

  return (
    <section style={{ paddingBottom: "4rem", borderBottom: "1px solid var(--line)" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem,3vw,2.25rem)", fontWeight: 400, margin: "0 0 0.5rem" }}>
          Where attention clusters
        </h2>
        <p style={{ color: "var(--fg-muted)", maxWidth: "32rem", margin: "0 0 1.25rem" }}>
          Saturation is not judgment — it&apos;s where the crowd is loudest.
        </p>

        {/* Filter pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {(["all", "high", "mid", "low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "0.4rem 0.8rem",
                border: `1px solid ${filter === f ? "var(--accent)" : "var(--line)"}`,
                background: "transparent",
                color: filter === f ? "var(--accent)" : "var(--fg-muted)",
                cursor: "pointer",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {f === "all" ? "All" : `${f} saturation`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1rem" }}>
        {visible.map((ind) => {
          const tier = satClass(ind.saturation);
          return (
            <article
              key={ind.id}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--line)",
                padding: "1.25rem",
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dim)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{ind.name}</h3>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "0.25rem 0.45rem",
                  border: `1px solid ${BADGE_COLORS[tier]}`,
                  color: BADGE_TEXT[tier],
                }}>
                  {tier}
                </span>
              </div>
              <div style={{ height: 3, background: "var(--line)", marginBottom: "0.65rem", overflow: "hidden" }}>
                <span style={{
                  display: "block",
                  height: "100%",
                  width: `${ind.saturation * 10}%`,
                  background: "linear-gradient(90deg, #4a7c6e, #c4a574, #8b3a3a)",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
                {ind.note}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
