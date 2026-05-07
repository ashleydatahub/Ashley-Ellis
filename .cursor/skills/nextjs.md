---
name: nextjs
description: Conventions for the Next.js TypeScript frontend in web/. Use when adding pages, components, API calls, or styling.
---

# Next.js conventions

- All source files are `.ts` / `.tsx` — never `.js` / `.jsx`.
- App Router only (`web/app/`). No Pages Router.
- Server Components by default; add `"use client"` only when you need browser APIs, state, or event handlers.
- Fetch data in Server Components using `fetch()` with `next: { revalidate }` or `cache: "no-store"`.
- All API calls go through `web/lib/api.ts` — no inline `fetch` in components.
- Use `next/font/google` for fonts — never a `<link>` tag in layout.
- Environment variables exposed to the browser must be prefixed `NEXT_PUBLIC_`.
- Keep `globals.css` minimal; use Tailwind utility classes for component styles.
- Run: `npm run dev` (port 3000). Build: `npm run build`. Lint: `npm run lint`.
