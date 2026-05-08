"use client";

import type { CSSProperties } from "react";

type Role = "seeker" | "guide";

interface Props {
  children: React.ReactNode;
  role?: Role;
  variant?: "primary" | "ghost";
  style?: CSSProperties;
}

export default function CtaButton({ children, role = "seeker", variant = "primary", style }: Props) {
  const base: CSSProperties =
    variant === "primary"
      ? {
          background: "var(--fg)",
          color: "var(--bg)",
          border: "1px solid var(--fg)",
        }
      : {
          background: "transparent",
          color: "var(--fg)",
          border: "1px solid var(--line)",
        };

  return (
    <button
      type="button"
      onClick={() => {
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.dispatchEvent(new CustomEvent("waitlist:open", { detail: { role } }));
      }}
      style={{
        cursor: "pointer",
        padding: "0.85rem 1.35rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        ...base,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
