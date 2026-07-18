# NeuralAtlas — Deployment Guide

The app has two parts that deploy independently:

- **Frontend** (React SPA) — deploys to **Netlify** or **Cloudflare Pages** (both configs included in the repo)
- **Backend** (FastAPI + MongoDB) — does **not** run on Netlify or Cloudflare Pages. Use Render / Railway / Fly.io / Emergent one-click deploy

The frontend needs to know where the backend lives via a single build-time env var:

```
REACT_APP_BACKEND_URL = https://<your-backend-host>
```

The frontend calls `${REACT_APP_BACKEND_URL}/api/...` for every request.

---

## Option A · Netlify

Config file: `/netlify.toml` (already committed)

### 1. Push code to GitHub / GitLab / Bitbucket

### 2. In Netlify: New site → Import from Git → pick this repo. Verify these settings (auto-filled from `netlify.toml`):

| Field | Value |
|---|---|
| Branch to deploy | `main` |
| Base directory | `frontend` |
| Build command | `yarn install --frozen-lockfile && yarn build` |
| Publish directory | `build` |

### 3. Site settings → Environment variables → Add

| Key | Value |
|---|---|
| `REACT_APP_BACKEND_URL` | `https://<your-backend-host>` (no trailing slash) |

### 4. Deploy site — first build takes ~2 minutes.

---

## Option B · Cloudflare Pages

No config file needed — Cloudflare Pages reads `frontend/public/_redirects` and `frontend/public/_headers` automatically (both committed in the repo).

### 1. Push code to GitHub.

### 2. In Cloudflare Pages: Create a project → Connect to Git → pick this repo.

### 3. Build settings:

| Field | Value |
|---|---|
| Production branch | `main` |
| Framework preset | **Create React App** (or "None" — both work) |
| Build command | `yarn install --frozen-lockfile && yarn build` |
| Build output directory | `build` |
| Root directory (advanced) | `frontend` |

### 4. Environment variables (Production + Preview):

| Variable | Value |
|---|---|
| `REACT_APP_BACKEND_URL` | `https://<your-backend-host>` |
| `NODE_VERSION` | `20` |
| `CI` | `false` |
| `GENERATE_SOURCEMAP` | `false` |

### 5. Save & Deploy — build takes ~2 minutes.

### Cloudflare-specific extras
- **Custom domain**: Pages → Custom domains → Add `neuralatlas.io` (Cloudflare auto-handles DNS if the domain is on their nameservers).
- **Analytics**: enabled by default (privacy-friendly, no cookies).

---

## Backend hosting (required for either option)

Pick one:

| Host | Free tier | Best for |
|---|---|---|
| **Render.com** | 750 hrs/month | Easy Dockerfile deploy — recommended |
| **Railway.app** | $5/month credit | Fastest DX, one-click Mongo |
| **Fly.io** | 3 shared-cpu VMs | Global edge, low latency |
| **Emergent one-click** | Included with Emergent | No config needed |

The backend needs:
- Python 3.11+, run `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Env vars from `/app/backend/.env` (copy them into the host's env settings — never commit real secrets!)
- MongoDB — use MongoDB Atlas free tier (`M0` cluster, 512 MB) and set `MONGO_URL` to the SRV connection string
- Set `CORS_ORIGINS` to your Netlify/Cloudflare URL (e.g. `https://neuralatlas.pages.dev,https://neuralatlas.io`)

---

## Custom domain (neuralatlas.io)

Once frontend and backend are both live:

1. **Frontend** → set `neuralatlas.io` on Netlify/Cloudflare Pages custom-domain tab.
2. **Backend** → point `api.neuralatlas.io` (subdomain) at your backend host.
3. **Update env var** on the frontend host: `REACT_APP_BACKEND_URL=https://api.neuralatlas.io`
4. Re-deploy the frontend — one click on either platform.

---

## Recommended path

If you want the fastest, lowest-friction path: **use Emergent's built-in Deploy button** (top-right of your Emergent workspace). One click deploys frontend + backend + Mongo together on `neuralatlas.io`, sets every env var correctly, wires CORS, and handles cookies for admin auth. Zero manual setup.

The Netlify/Cloudflare configs in this repo exist so you always have the option to self-host if you outgrow Emergent later.
