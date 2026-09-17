# AGENTS.md

Mulya Bakery landing page: React 18 + Vite + TypeScript + TailwindCSS, Supabase backend (RLS), all orders via WhatsApp. UI text, comments, and DB error messages are in **Bahasa Indonesia** — write new content that way.

## Commands

- `npm run dev` — Vite dev server
- `npm run lint` — typecheck only (`tsc --noEmit`). There is no ESLint/Prettier and **no test runner**.
- `npm run build` — auto-runs `scripts/check-env.mjs` first, then `tsc --noEmit && vite build`
- Verifying changes = `npm run lint` then `npm run build` (repo convention, see `todo.md`)
- Terminal is PowerShell 5.1: avoid `&&` when chaining commands; use `;` or separate commands.

## Env / static mode

All config comes from `.env` (gitignored; template `.env.example`). Without it the site runs in **static mode**: dummy products from `src/data/products.ts`, nothing persists, and all feature flags are ON (fail-open).

- `VITE_WHATSAPP_NUMBER` format `628…` (no `+`, no spaces); `VITE_WHATSAPP_NUMBER2` optional, `VITE_SUPER_ADMIN_EMAILS` comma-separated.
- Never put a `service_role`/`sb_secret_` key in frontend code — `src/lib/supabase.ts`, `src/lib/supabaseAdmin.ts`, and `scripts/check-env.mjs` hard-fail on it. Only publishable/anon keys are allowed.
- `STRICT_ENV=1` makes build fail when env vars are missing.

## Architecture

- No router library. Path routing lives in `src/main.tsx`: `/admin` → lazy-loaded `src/admin/AdminApp.tsx`, anything else → `src/App.tsx`. SPA rewrite in `vercel.json` handles direct `/admin` access.
- Two Supabase clients: public `src/lib/supabase.ts` (`persistSession: false`) and admin `src/lib/supabaseAdmin.ts` (`persistSession: true`, storageKey `mb-admin-auth`).
- Business config is centralized: `src/config/contact.ts` (WhatsApp numbers, brand, store `lat/lng`), `src/config/superadmin.ts`, `src/config/featureFlags.ts`.
- Menu comes from RPC `get_menu` via `src/hooks/Usemenudata.ts`. `src/data/products.ts` is a dummy demo fallback (product `video` fields currently point at public sample clips — replace with local `public/videos/` files for production).
- `FEATURE_KEYS` in `src/config/featureFlags.ts` must stay in sync with the seed in `supabase/migrations/009_feature_flags.sql`.
- DB schema lives in `supabase/migrations/` (001–012). New DB features need a new numbered migration (013+) that must be **run manually in the Supabase SQL Editor** — the build does not apply migrations. Note: the whole `supabase/` folder is gitignored, so migrations aren't committed.

## Conventions

- `src/lib/whatsapp.ts` builds every wa.me order/confirmation message: **never add emoji in that file** (4-byte UTF-8 renders broken in WhatsApp); messages are truncated at 3500 chars. WhatsApp bold syntax `*text*`.
- Map stack: MapLibre GL + OpenStreetMap + Nominatim reverse-geocode (free, no API key); store coordinates come from `LOCATION.lat/lng` in `src/config/contact.ts`.
- Admin login persists via Supabase auth email; emails in `VITE_SUPER_ADMIN_EMAILS` land on the super-admin dashboard with the feature-gating tab.
- Tailwind design system: pink palette `paper`/`#FFE4E9` + `primary`/`#FF69B4`, `cocoa` text tones, fonts Caprasimo/Caveat/Nunito Sans plus Google Font Itim (injected per-component as `.font-itim`).

## Git

Destructive git commands (`git push`, `git reset --hard`, `git clean -fd`, force push, `git branch -D`) are blocked by `/.claude/hooks/block-dangerous-git.sh` — do not attempt them.