# NeuralAtlas.io — PRD

## Original problem statement
User wanted to build "an AI Marketplace" per attached business plan (Neural_Atlas_Business_Plan.docx). Follow-up: **modern design vibe, Landing/Marketing site with AI-integrated backend + Admin panel, bridging small/mid/large enterprises with the AI startup ecosystem. Name: NeuralAtlas.io. Bangalore & Dubai based company.**

## Architecture
- **Frontend:** React 19 + React Router, Tailwind + Shadcn UI. Dark boutique theme. Playfair Display (display) + Manrope (body) + JetBrains Mono (labels). Gold `#C5A059` + Cyan `#00E5FF` accents on `#0A0E17` base. Framer Motion for entrance.
- **Backend:** FastAPI + Motor (Mongo). All endpoints under `/api`. LLM via **Emergent Universal LLM Key + Claude Sonnet 4.6** (user asked for Ollama; Ollama can't run in this cloud env, so we substituted Emergent — same free-to-user experience).
- **Data models:** `enterprise_intakes`, `provider_applications`, `assessments` — all with UUID ids, ISO datetime strings.

## User personas
1. **Enterprise buyer** (CIO / Head of Digital / Innovation Head) at BFSI, Pharma, Energy, Manufacturing, Maritime, Retail, Telecom — small/mid/large. Free.
2. **AI service provider / startup / consultancy** — paid membership ($500 / $1,500 / $5,000 per year).
3. **Founder / operator (Admin)** — reviews leads, vets providers, moves them through kanban.

## What's implemented (Feb 17, 2026 — MVP v1)
- Landing (`/`): sticky glass nav, hero with live-pipeline card, How-it-Works (enterprise vs provider), 3-tier pricing with animated tracing-border on Elite, AI Maturity Assessment (Claude Sonnet 4.6 generates a markdown report), vetted-provider marquee, founder+rubric section, enterprise intake form, provider application form, Dubai + Bangalore footer.
- Admin (`/admin`, no auth for MVP): stats cards (enterprises, providers, assessments, estimated ARR), Provider Vetting kanban (new/assessing/approved/rejected) with Move dropdown, Enterprise Leads table with status update, AI Assessments cards with expandable reports.
- Backend endpoints: `POST/GET /api/enterprise/intake`, `PATCH /api/enterprise/intake/{id}`, `POST/GET /api/provider/application`, `PATCH /api/provider/application/{id}`, `POST/GET /api/assessment`, `GET /api/admin/stats`.
- Estimated ARR auto-computed from approved providers × tier price.
- Testing: 100% pass on both backend + frontend end-to-end (iteration_2).

## Prioritized backlog
### P0
- Admin authentication (protect `/admin` — currently public).
- Email notifications on new intakes / applications (Resend or SendGrid).

### P1
- Stripe checkout for provider membership tiers.
- Rich markdown rendering (react-markdown) on the assessment report.
- Named provider profiles + public "Featured providers" detail pages.
- Provider portal (login → see intros, manage listing).

### P2
- Case studies / success stories CMS section.
- Multi-language (Arabic / Hindi) for Dubai + Bangalore audiences.
- Automated shortlist matching (LLM matches enterprise intake → 3 providers).
- Analytics dashboard: funnel, conversion, revenue.

## Next tasks (in order)
1. Admin auth (JWT or Emergent Google login).
2. Stripe integration for provider payments.
3. Email notifications on form submissions.
4. Automated LLM-based enterprise → provider matcher.
