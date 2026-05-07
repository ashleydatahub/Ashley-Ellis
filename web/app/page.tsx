import { getIndustries } from "@/lib/api";
import SignalBand from "@/components/SignalBand";
import IndustryGrid from "@/components/IndustryGrid";

const FALLBACK_INDUSTRIES = [
  { id: 1, name: "Software · product",      saturation: 8.7, note: "talent pool depth · high noise" },
  { id: 2, name: "Law · corporate",         saturation: 7.9, note: "up-or-out paths crowded" },
  { id: 3, name: "Medicine · clinical",     saturation: 7.2, note: "training pipeline saturated" },
  { id: 4, name: "Music · recording",       saturation: 6.8, note: "access easy · breakthrough hard" },
  { id: 5, name: "Finance · markets",       saturation: 8.1, note: "competition for seats" },
  { id: 6, name: "Design · digital",        saturation: 7.4, note: "portfolio density" },
  { id: 7, name: "Academia · tenure track", saturation: 8.9, note: "fewer lines · more PhDs" },
  { id: 8, name: "Media · journalism",      saturation: 7.0, note: "outlets shrink · voices multiply" },
  { id: 9, name: "Real estate · brokerage", saturation: 6.2, note: "cyclical · local variance" },
  { id: 10, name: "Skilled trades",         saturation: 4.1, note: "undersupply in many regions" },
];

export default async function HomePage() {
  let industries = FALLBACK_INDUSTRIES;
  try {
    industries = await getIndustries();
  } catch {
    // API not running — use fallback data
  }

  return (
    <>
      {/* Film grain */}
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          opacity: 0.04,
          zIndex: 9999,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <SignalBand industries={industries} />

      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "1.25rem 1.5rem 2rem",
        maxWidth: 1120,
        margin: "0 auto",
      }}>
        <a href="/" style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.02em", color: "var(--fg)", textDecoration: "none" }}>
          Micro Mentorship
        </a>
        <div style={{ display: "flex", gap: "1.75rem", fontFamily: "var(--font-mono)", fontSize: "0.72rem", textTransform: "lowercase", letterSpacing: "0.12em" }}>
          <a href="#discover" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>discover</a>
          <a href="#how" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>how it works</a>
          <a href="#mentors" style={{ color: "var(--fg-muted)", textDecoration: "none" }}>become a guide</a>
        </div>
        <button style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "0.85rem 1.35rem",
          border: "1px solid var(--line)",
          background: "transparent",
          color: "var(--fg)",
          cursor: "pointer",
        }}>
          request access
        </button>
      </nav>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "0 1.5rem 4rem" }}>

        {/* Hero */}
        <section style={{ paddingBottom: "4rem", borderBottom: "1px solid var(--line)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--fg-muted)", margin: "0 0 1.5rem" }}>
            marketplace · 15 minutes · no noise
          </p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 1.5rem" }}>
            Borrow an insider&apos;s<br />
            <em style={{ fontStyle: "italic", color: "var(--accent)" }}>point of view</em>
          </h1>
          <p style={{ maxWidth: "36rem", color: "var(--fg-muted)", fontSize: "1.05rem", margin: "0 0 2rem" }}>
            Retired partners, working producers, surgeons who left the OR, lawyers who burned the midnight oil—book a single quarter-hour with someone who has already walked the path you&apos;re weighing.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "3rem" }}>
            <button style={{ cursor: "pointer", background: "var(--fg)", color: "var(--bg)", border: "1px solid var(--fg)", padding: "0.85rem 1.35rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
              enter the waitlist
            </button>
            <a href="#discover" style={{ display: "inline-flex", alignItems: "center", padding: "0.85rem 1.35rem", border: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg)", textDecoration: "none" }}>
              browse industries
            </a>
          </div>
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1.5rem", margin: 0, paddingTop: "1.5rem", borderTop: "1px solid var(--line)" }}>
            {[
              ["session length", "15 min"],
              ["format", "voice · video · async note"],
              ["intent", "career change · reality check · map the maze"],
            ].map(([label, val]) => (
              <div key={label}>
                <dt style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: "0.35rem" }}>{label}</dt>
                <dd style={{ margin: 0, fontSize: "0.95rem" }}>{val}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Industry grid (client component for filter interactivity) */}
        <div id="discover" style={{ paddingTop: "4rem" }}>
          <IndustryGrid industries={industries} />
        </div>

        {/* How it works */}
        <section id="how" style={{ padding: "4rem 0", borderBottom: "1px solid var(--line)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem,3vw,2.25rem)", fontWeight: 400, margin: "0 0 0.5rem" }}>How a micro session works</h2>
          <p style={{ color: "var(--fg-muted)", maxWidth: "32rem", margin: "0 0 2rem" }}>Enough time for one sharp question and one honest answer.</p>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "2rem" }}>
            {[
              ["01", "Choose a lane", "Filter by industry, former role, or the kind of truth you need."],
              ["02", "Book fifteen", "Pick a slot; pay only for the slice you need."],
              ["03", "Leave with a bearing", "Notes you can act on—not a course, not a funnel."],
            ].map(([n, title, body]) => (
              <li key={n} style={{ borderLeft: "1px solid var(--line)", paddingLeft: "1.25rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--accent)", display: "block", marginBottom: "0.5rem" }}>{n}</span>
                <h3 style={{ fontSize: "1.05rem", margin: "0 0 0.35rem" }}>{title}</h3>
                <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "0.92rem" }}>{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Guides */}
        <section id="mentors" style={{ padding: "4rem 0" }}>
          <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.75rem,3vw,2.25rem)", fontWeight: 400, margin: "0 0 1rem" }}>Guides, not gurus</h2>
              <p style={{ color: "var(--fg-muted)", margin: "0 0 1.5rem" }}>
                If you&apos;ve done the work and you&apos;re willing to be blunt in small doses, this is the quiet side of the market. We verify identity and experience; we don&apos;t script your story.
              </p>
              <button style={{ cursor: "pointer", background: "var(--fg)", color: "var(--bg)", border: "1px solid var(--fg)", padding: "0.85rem 1.35rem", fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                apply as a guide
              </button>
            </div>
            <div style={{ background: "rgba(196,165,116,0.06)", border: "1px solid var(--accent-dim)", padding: "1.5rem" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--accent)", margin: "0 0 0.75rem" }}>confidential</p>
              <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "0.95rem" }}>
                Some industries still operate on whispers. Micro Mentorship is built for discretion—minimal profiles, optional pseudonyms for guides where allowed, and clear boundaries before you connect.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ maxWidth: 1120, margin: "0 auto", padding: "3rem 1.5rem", borderTop: "1px solid var(--line)" }}>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--fg-muted)" }}>
          © Micro Mentorship. A thin bridge between curiosity and someone who knows.
        </p>
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em", opacity: 0.7, color: "var(--fg-muted)" }}>
          Saturation metrics are illustrative for the prototype.
        </p>
      </footer>
    </>
  );
}
