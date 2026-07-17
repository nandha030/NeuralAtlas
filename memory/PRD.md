# NeuralAtlas — PRD

## Original problem statement
Build "an AI Marketplace" per attached business plan (Neural_Atlas_Business_Plan.docx). Follow-up: modern design, Landing/Marketing site with AI-integrated backend + Admin panel, bridging small/mid/large enterprises with AI startup ecosystem. Name: NeuralAtlas. Bangalore & Dubai based. Later iteration: private admin login, new compass logo + favicon, email alerts, Space Grotesk font, dual light/dark theme with toggle.

## Architecture
- **Frontend**: React 19 + React Router, Tailwind + Shadcn UI, `next-themes` pattern via custom ThemeContext (`.dark` class on `<html>`). **Space Grotesk** display + body, JetBrains Mono labels. CSS-variable theme tokens (`--na-bg`, `--na-gold`, `--na-cyan`, etc.) that swap between light & dark. Framer Motion for entrance animations.
- **Backend**: FastAPI + Motor (Mongo), all endpoints under `/api`. JWT auth (HS256, 12h expiry) via Bearer token + cookie fallback. Bcrypt password hashing. LLM via Emergent Universal Key + Claude Sonnet 4.6. Email alerts via Resend (no-op when `RESEND_API_KEY` empty).
- **Auth**: Single seeded admin (email/password from `.env`); rotates password if `.env` value changes. `ProtectedRoute` wraps `/admin`.
- **Data models**: `users`, `enterprise_intakes`, `provider_applications`, `assessments` — all UUID ids, ISO datetime strings.

## User personas
1. Enterprise buyer (CIO / Head of Digital) — free intake.
2. AI provider / startup / consultancy — paid membership tiers ($500 / $1,500 / $5,000).
3. Founder/Operator (Admin) — vets, matches, tracks pipeline.

## What's implemented
### Feb 17, 2026 — MVP v1
- Landing (`/`): sticky glass nav, hero + live pipeline, How-it-Works, 3-tier pricing (tracing-border on Elite), AI Maturity Assessment (Claude Sonnet 4.6), vetted-provider marquee, founder + vetting rubric, enterprise + provider intake forms, dual-city footer.
- Admin (`/admin`, open at first): stats cards, provider vetting kanban with Move dropdown, enterprise leads table, AI assessment cards.
- Public + protected endpoints, LLM markdown report generation, ARR aggregation.

### Feb 17, 2026 — iteration 3
- **Private admin login** at `/admin/login` — JWT (Bearer + cookie), seeded admin (email/password in `.env`), auto-rotation on password change, protected admin endpoints (`GET /api/admin/stats`, list + patch endpoints).
- **Sign-out** button in admin header — clears token, redirects to login.
- **New compass logo** (inline SVG in `/app/frontend/src/components/Logo.jsx`) + favicon.svg — gold gradient, scales cleanly, theme-aware.
- **Email alerts via Resend** on new enterprise intake and provider application — sent to `ALERT_EMAIL` (default `info@neuralatlas.io`) from `FROM_EMAIL`. Gracefully skipped when `RESEND_API_KEY` empty.
- **Rebrand**: Playfair Display → **Space Grotesk** (modern geometric sans). Wordmark now "NeuralAtlas" with the "Atlas" in gold.
- **Dual light + dark theme** — CSS variable tokens for background, text, borders, gold, cyan. Toggle button (`data-testid=theme-toggle`) in nav and login header, persists to `localStorage.na_theme`.

### Feb 17, 2026 — iteration 4
- **Auto Shortlist (BOTH modes)**: `generate_shortlist()` in `server.py` calls Claude Sonnet 4.6 with the enterprise brief + list of approved providers, returns top 3 with 1-line fit reasons. Runs automatically on new intake AND on-demand via `POST /api/enterprise/intake/{id}/shortlist` (admin only).
- **Admin UI**: Enterprise Leads table now has row expander showing project brief + AI shortlist cards (rank, name, tier, fit reason). Per-row `Match` button regenerates shortlist.
- **Rich footer**: brand + newsletter form on top, Product / Company / Legal link columns, embedded Dubai & Bangalore office cards, LinkedIn/Twitter/Email social row, copyright bar.
- **Static pages**: /about, /contact, /careers, /privacy, /terms, /cookies — served via shared StaticPage component with theme toggle in each page's header.
- **Newsletter**: `POST /api/newsletter/subscribe` (public, idempotent) + `NewsletterForm` component in footer.

## Prioritized backlog
### P0
- Stripe checkout for provider membership tiers.

### P1
- Rich markdown rendering (react-markdown) on assessment report.
- Automated LLM-based enterprise → provider matcher (auto-shortlist 3).
- Provider portal (login → see intros, manage listing).
- Brute-force lockout on admin login (5 attempts / 15 min).

### P2
- Case studies / success stories CMS section.
- Multi-language (Arabic / Hindi) support.
- Analytics dashboard: funnel, conversion, revenue.
- Migrate `@app.on_event` → FastAPI `lifespan` context manager.
- Split Landing.jsx into per-section modules.

## Credentials
Admin login credentials stored in `/app/memory/test_credentials.md`.

## Next tasks (recommended)
1. Add Resend API key to `.env` so alerts start flowing.
2. Stripe integration for provider payments.
3. LLM-based auto-shortlist matcher.
4. Case studies + testimonials section.
