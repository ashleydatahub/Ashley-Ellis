const API_BASE = "http://localhost:8000";

const FALLBACK_INDUSTRIES = [
  { name: "Software · product", saturation: 8.7, note: "talent pool depth · high noise" },
  { name: "Law · corporate", saturation: 7.9, note: "up-or-out paths crowded" },
  { name: "Medicine · clinical", saturation: 7.2, note: "training pipeline saturated" },
  { name: "Music · recording", saturation: 6.8, note: "access easy · breakthrough hard" },
  { name: "Finance · markets", saturation: 8.1, note: "competition for seats" },
  { name: "Design · digital", saturation: 7.4, note: "portfolio density" },
  { name: "Academia · tenure track", saturation: 8.9, note: "fewer lines · more PhDs" },
  { name: "Media · journalism", saturation: 7.0, note: "outlets shrink · voices multiply" },
  { name: "Real estate · brokerage", saturation: 6.2, note: "cyclical · local variance" },
  { name: "Skilled trades", saturation: 4.1, note: "undersupply in many regions" },
];

async function fetchIndustries() {
  try {
    const res = await fetch(`${API_BASE}/api/industries`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return FALLBACK_INDUSTRIES;
  }
}

function saturationClass(s) {
  if (s >= 7.5) return "high";
  if (s >= 5.5) return "mid";
  return "low";
}

function buildMarquee(industries) {
  const container = document.getElementById("marquee");
  const items = [...industries, ...industries].map((row) => {
    const tier = saturationClass(row.saturation);
    return `<span class="marquee__item"><strong>${row.name}</strong><span class="marquee__sat">${row.saturation.toFixed(1)}</span><span class="badge badge--${tier}">saturation</span></span>`;
  });
  container.innerHTML = `<div class="marquee__inner">${items.join("")}</div>`;
}

function buildSignalLines() {
  const host = document.getElementById("signalLines");
  const w = 1200;
  const h = 72;
  const lineCount = 5;
  let paths = "";
  for (let i = 0; i < lineCount; i++) {
    const y = 12 + i * 12;
    const phase = i * 1.7;
    const d = `M0 ${y} Q 150 ${y - 8 + (i % 3) * 4} 300 ${y} T 600 ${y} T 900 ${y} T ${w} ${y + Math.sin(phase) * 3}`;
    const dur = 20 + i * 5;
    const delay = -i * 3;
    paths += `<path class="signal-path" d="${d}" fill="none" stroke="rgba(232,230,227,0.12)" stroke-width="1" stroke-dasharray="8 14" style="animation-duration:${dur}s;animation-delay:${delay}s"/>`;
  }
  host.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stop-color="rgba(196,165,116,0)" />
          <stop offset="50%" stop-color="rgba(196,165,116,0.25)" />
          <stop offset="100%" stop-color="rgba(196,165,116,0)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" opacity="0.5"/>
      ${paths}
    </svg>
  `;
}

function buildGrid(industries) {
  const grid = document.getElementById("industryGrid");
  grid.innerHTML = industries.map((row) => {
    const tier = saturationClass(row.saturation);
    const fill = row.saturation / 10;
    return `
      <article class="card">
        <div class="card__top">
          <h3 class="card__name">${row.name}</h3>
          <span class="badge badge--${tier}">${tier} saturation</span>
        </div>
        <div class="card__meter"><span style="--fill: ${fill}"></span></div>
        <p class="card__meta">${row.note}</p>
      </article>
    `;
  }).join("");
}

async function init() {
  buildSignalLines();
  const industries = await fetchIndustries();
  buildMarquee(industries);
  buildGrid(industries);
}

init();
