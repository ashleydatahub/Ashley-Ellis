"use client";

import { useEffect, useRef, useState } from "react";
import type { Industry } from "@/lib/api";
import { joinWaitlist } from "@/lib/api";

type Role = "seeker" | "guide";
type Status = "idle" | "submitting" | "success" | "error";

const INTENTS = [
  "career change",
  "reality check",
  "first 30 days advice",
  "industry insider perspective",
  "negotiation help",
  "other",
];

export default function WaitlistForm({ industries }: { industries: Industry[] }) {
  const [role, setRole] = useState<Role>("seeker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [intent, setIntent] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  // Listen for global "open the form" events fired by the page CTAs
  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<{ role?: Role }>).detail;
      if (detail?.role) setRole(detail.role);
      // Focus the first field after smooth scroll completes
      setTimeout(() => nameRef.current?.focus(), 600);
    }
    window.addEventListener("waitlist:open", onOpen as EventListener);
    return () => window.removeEventListener("waitlist:open", onOpen as EventListener);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      await joinWaitlist({
        name: name.trim(),
        email: email.trim(),
        role,
        industry,
        intent,
        message: message.trim(),
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div
        style={{
          border: "1px solid var(--accent-dim)",
          background: "rgba(196,165,116,0.04)",
          padding: "2.5rem 1.75rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--accent)",
            margin: "0 0 1rem",
          }}
        >
          received
        </p>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            margin: "0 0 0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          Thanks, {name.split(" ")[0] || "friend"}.
        </h3>
        <p style={{ color: "var(--fg-muted)", margin: "0 auto", maxWidth: "32rem" }}>
          We&apos;ll be in touch at <strong style={{ color: "var(--fg)" }}>{email}</strong>{" "}
          when your slot is ready. No newsletters. No spam.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setName("");
            setEmail("");
            setIndustry("");
            setIntent("");
            setMessage("");
          }}
          style={{
            marginTop: "1.5rem",
            cursor: "pointer",
            background: "transparent",
            color: "var(--fg-muted)",
            border: "1px solid var(--line)",
            padding: "0.65rem 1.1rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          submit another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid var(--line)",
        background: "var(--bg-elevated)",
        padding: "2rem 1.75rem",
      }}
    >
      {/* Role tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        {(["seeker", "guide"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            style={{
              cursor: "pointer",
              padding: "0.55rem 0.95rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: role === r ? "var(--fg)" : "transparent",
              color: role === r ? "var(--bg)" : "var(--fg-muted)",
              border: `1px solid ${role === r ? "var(--fg)" : "var(--line)"}`,
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
          >
            {r === "seeker" ? "i need guidance" : "i'm a guide"}
          </button>
        ))}
      </div>

      <FormField label="Full name">
        <input
          ref={nameRef}
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={inputStyle}
        />
      </FormField>

      <FormField label="Email">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
        <FormField label={role === "guide" ? "Your industry" : "Industry of interest"}>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle}>
            <option value="">Choose one…</option>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.name}>
                {ind.name}
              </option>
            ))}
            <option value="other">Other / not listed</option>
          </select>
        </FormField>

        {role === "seeker" && (
          <FormField label="What you're after">
            <select value={intent} onChange={(e) => setIntent(e.target.value)} style={inputStyle}>
              <option value="">Pick a focus…</option>
              {INTENTS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </FormField>
        )}
      </div>

      <FormField label={role === "guide" ? "Brief bio (optional)" : "Anything you want us to know (optional)"}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={
            role === "guide"
              ? "Years of experience, current/past roles, specialties…"
              : "What are you trying to figure out?"
          }
          style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
        />
      </FormField>

      {status === "error" && (
        <p
          style={{
            color: "#c08080",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            margin: "0 0 1rem",
          }}
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          cursor: status === "submitting" ? "wait" : "pointer",
          background: "var(--fg)",
          color: "var(--bg)",
          border: "1px solid var(--fg)",
          padding: "0.95rem 1.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity: status === "submitting" ? 0.6 : 1,
          width: "100%",
          marginTop: "0.5rem",
        }}
      >
        {status === "submitting"
          ? "sending…"
          : role === "guide"
          ? "apply as a guide"
          : "request access"}
      </button>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          margin: "1rem 0 0",
          textAlign: "center",
        }}
      >
        no spam · no newsletters · we read every reply
      </p>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: "1rem" }}>
      <span
        style={{
          display: "block",
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.85rem",
  background: "var(--bg)",
  color: "var(--fg)",
  border: "1px solid var(--line)",
  fontFamily: "var(--font-syne), system-ui, sans-serif",
  fontSize: "0.95rem",
  outline: "none",
};
