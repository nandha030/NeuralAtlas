from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage
import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL'].lower()
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
ALERT_EMAIL = os.environ.get('ALERT_EMAIL', '')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
REPLY_TO_EMAIL = os.environ.get('REPLY_TO_EMAIL', '')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

app = FastAPI(title="NeuralAtlas.io API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)


# ---------- Helpers ----------

def now_iso():
    return datetime.now(timezone.utc).isoformat()


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def create_token(email: str, hours: int = 12) -> str:
    payload = {
        "sub": email,
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub", "").lower()
        if email != ADMIN_EMAIL:
            raise HTTPException(401, "Not authorised")
        return {"email": email, "role": "admin"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


def send_alert_email(subject: str, html_body: str) -> None:
    """Fire-and-forget email alert. No-op if RESEND_API_KEY not configured."""
    if not RESEND_API_KEY or not ALERT_EMAIL:
        logger.info(f"[email skipped, key missing] {subject}")
        return
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [ALERT_EMAIL],
            "subject": subject,
            "html": html_body,
        }
        if REPLY_TO_EMAIL:
            params["reply_to"] = REPLY_TO_EMAIL
        resend.Emails.send(params)
        logger.info(f"Alert emailed to {ALERT_EMAIL}: {subject}")
    except Exception as e:
        logger.exception(f"Resend send failed: {e}")


# ---------- Models ----------

class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class ShortlistMatch(BaseModel):
    provider_id: str
    name: str
    tier: str
    fit_reason: str


class EnterpriseIntake(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    contact_name: str
    email: EmailStr
    role: str
    industry: str
    company_size: Literal["startup", "small", "mid", "large", "enterprise"]
    project_description: str
    budget_range: str
    timeline: str
    region: Optional[str] = "India / UAE"
    status: Literal["new", "reviewing", "matched", "closed"] = "new"
    shortlist: List[ShortlistMatch] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)


class EnterpriseIntakeCreate(BaseModel):
    company_name: str
    contact_name: str
    email: EmailStr
    role: str
    industry: str
    company_size: Literal["startup", "small", "mid", "large", "enterprise"]
    project_description: str
    budget_range: str
    timeline: str
    region: Optional[str] = "India / UAE"


class ProviderApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    contact_name: str
    email: EmailStr
    website: Optional[str] = ""
    headquarters: str
    team_size: str
    specializations: str
    case_studies: str
    tier_interest: Literal["starter", "growth", "elite"]
    status: Literal["new", "assessing", "approved", "rejected"] = "new"
    created_at: str = Field(default_factory=now_iso)


class ProviderApplicationCreate(BaseModel):
    company_name: str
    contact_name: str
    email: EmailStr
    website: Optional[str] = ""
    headquarters: str
    team_size: str
    specializations: str
    case_studies: str
    tier_interest: Literal["starter", "growth", "elite"]


class MaturityAssessment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    email: EmailStr
    industry: str
    data_readiness: int
    infrastructure: int
    talent: int
    use_case_clarity: int
    goals: str
    score: int = 0
    report_markdown: str = ""
    created_at: str = Field(default_factory=now_iso)


class MaturityAssessmentCreate(BaseModel):
    company_name: str
    email: EmailStr
    industry: str
    data_readiness: int
    infrastructure: int
    talent: int
    use_case_clarity: int
    goals: str


class StatusUpdate(BaseModel):
    status: str


class NewsletterSubscribe(BaseModel):
    email: EmailStr


class CaseStudyMetric(BaseModel):
    label: str
    value: str


class CaseStudy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    subtitle: str
    client_name: str
    industry: str
    region: str
    provider_name: str
    tier: Literal["starter", "growth", "elite"] = "growth"
    hero_image: str = ""
    summary: str
    challenge: str
    solution: str
    metrics: List[CaseStudyMetric] = Field(default_factory=list)
    quote: str = ""
    quote_author: str = ""
    published: bool = False
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class CaseStudyCreate(BaseModel):
    slug: str
    title: str
    subtitle: str
    client_name: str
    industry: str
    region: str
    provider_name: str
    tier: Literal["starter", "growth", "elite"] = "growth"
    hero_image: str = ""
    summary: str
    challenge: str
    solution: str
    metrics: List[CaseStudyMetric] = Field(default_factory=list)
    quote: str = ""
    quote_author: str = ""
    published: bool = False


class CaseStudyUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    client_name: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    provider_name: Optional[str] = None
    tier: Optional[Literal["starter", "growth", "elite"]] = None
    hero_image: Optional[str] = None
    summary: Optional[str] = None
    challenge: Optional[str] = None
    solution: Optional[str] = None
    metrics: Optional[List[CaseStudyMetric]] = None
    quote: Optional[str] = None
    quote_author: Optional[str] = None
    published: Optional[bool] = None


# ---------- Shortlist matcher ----------

async def generate_shortlist(intake: dict) -> List[dict]:
    """Return top-3 matching providers from approved network, with fit reasons."""
    approved = await db.provider_applications.find(
        {"status": "approved"}, {"_id": 0}
    ).to_list(200)
    if not approved:
        return []

    provider_lines = []
    for p in approved:
        provider_lines.append(
            f"- id:{p['id']} | name:{p['company_name']} | tier:{p['tier_interest']} "
            f"| hq:{p.get('headquarters','')} | specialties:{p.get('specializations','')[:180]}"
        )
    providers_block = "\n".join(provider_lines)

    system_msg = (
        "You are the matching engine of NeuralAtlas, a curated AI marketplace. "
        "Given an enterprise's project brief and a list of vetted AI providers, "
        "pick the top 3 best-fit providers and write a concise 1-sentence 'why they fit' note for each. "
        "Output STRICT JSON only — no preamble, no markdown fences."
    )
    prompt = f"""
Enterprise brief:
- Company: {intake['company_name']}
- Industry: {intake['industry']}
- Size: {intake['company_size']}
- Budget: {intake['budget_range']}
- Timeline: {intake['timeline']}
- Region: {intake.get('region', '')}
- Project: {intake['project_description']}

Approved providers:
{providers_block}

Return JSON with this exact shape:
{{"matches":[{{"provider_id":"<id>","name":"<name>","tier":"<tier>","fit_reason":"<one sentence>"}}]}}

Rules:
- Return up to 3 matches. If fewer than 3 providers are relevant, return only the relevant ones.
- Use provider_id from the list above.
- Keep fit_reason under 25 words, specific to the project.
""".strip()

    if not EMERGENT_LLM_KEY:
        return [
            {"provider_id": p["id"], "name": p["company_name"],
             "tier": p["tier_interest"], "fit_reason": "Auto-selected (LLM key not configured)."}
            for p in approved[:3]
        ]

    try:
        import json as _json
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"shortlist-{uuid.uuid4()}",
            system_message=system_msg,
        ).with_model("anthropic", "claude-sonnet-4-6")
        resp = await chat.send_message(UserMessage(text=prompt))
        text = resp if isinstance(resp, str) else str(resp)
        # Strip potential fences
        t = text.strip()
        if t.startswith("```"):
            t = t.split("```", 2)[1]
            if t.startswith("json"):
                t = t[4:]
            t = t.strip()
        data = _json.loads(t)
        matches = data.get("matches", [])[:3]
        approved_ids = {p["id"] for p in approved}
        clean = []
        for m in matches:
            pid = m.get("provider_id", "")
            if pid in approved_ids:
                clean.append({
                    "provider_id": pid,
                    "name": str(m.get("name", ""))[:120],
                    "tier": str(m.get("tier", ""))[:40],
                    "fit_reason": str(m.get("fit_reason", ""))[:280],
                })
        return clean
    except Exception as e:
        logger.exception(f"Shortlist generation failed: {e}")
        return []


# ---------- Public routes ----------

@api_router.get("/")
async def root():
    return {"service": "NeuralAtlas.io API", "status": "live"}


@api_router.post("/enterprise/intake", response_model=EnterpriseIntake)
async def create_enterprise_intake(payload: EnterpriseIntakeCreate):
    obj = EnterpriseIntake(**payload.model_dump())
    obj.shortlist = [ShortlistMatch(**m) for m in await generate_shortlist(obj.model_dump())]
    await db.enterprise_intakes.insert_one(obj.model_dump())

    shortlist_html = ""
    if obj.shortlist:
        rows = "".join(
            f"<li><b>{m.name}</b> ({m.tier}) — {m.fit_reason}</li>" for m in obj.shortlist
        )
        shortlist_html = f"<h3>Auto-shortlist</h3><ol>{rows}</ol>"

    html = f"""
    <h2>New Enterprise Intake</h2>
    <p><b>{obj.company_name}</b> ({obj.industry} · {obj.company_size})</p>
    <p>{obj.contact_name} &lt;{obj.email}&gt; · {obj.role}</p>
    <p><b>Budget:</b> {obj.budget_range} · <b>Timeline:</b> {obj.timeline} · <b>Region:</b> {obj.region}</p>
    <p><b>Project:</b><br>{obj.project_description}</p>
    {shortlist_html}
    <hr><small>Sent by NeuralAtlas.io</small>
    """
    asyncio.get_event_loop().run_in_executor(
        None, send_alert_email, f"[NeuralAtlas] New enterprise lead — {obj.company_name}", html
    )
    return obj


@api_router.post("/provider/application", response_model=ProviderApplication)
async def create_provider_application(payload: ProviderApplicationCreate):
    obj = ProviderApplication(**payload.model_dump())
    await db.provider_applications.insert_one(obj.model_dump())

    html = f"""
    <h2>New Provider Application</h2>
    <p><b>{obj.company_name}</b> · {obj.headquarters}</p>
    <p>{obj.contact_name} &lt;{obj.email}&gt; · {obj.website or 'no website'}</p>
    <p><b>Tier:</b> {obj.tier_interest.upper()} · <b>Team:</b> {obj.team_size}</p>
    <p><b>Specializations:</b><br>{obj.specializations}</p>
    <p><b>Case studies:</b><br>{obj.case_studies}</p>
    <hr><small>Sent by NeuralAtlas.io</small>
    """
    asyncio.get_event_loop().run_in_executor(
        None, send_alert_email, f"[NeuralAtlas] New provider — {obj.company_name} ({obj.tier_interest})", html
    )
    return obj


@api_router.post("/assessment", response_model=MaturityAssessment)
async def create_assessment(payload: MaturityAssessmentCreate):
    total = payload.data_readiness + payload.infrastructure + payload.talent + payload.use_case_clarity
    score = int((total / 20) * 100)

    system_msg = (
        "You are a senior enterprise AI architect writing concise, executive-grade AI maturity reports "
        "for NeuralAtlas, a curated AI marketplace based in Bangalore & Dubai. Your tone is direct, "
        "unbiased, and pragmatic. Output valid Markdown only, no preamble."
    )
    prompt = f"""
Generate an AI Maturity Snapshot for the following enterprise. Keep it under 350 words.

Company: {payload.company_name}
Industry: {payload.industry}
Scores (1-5 scale):
- Data Readiness: {payload.data_readiness}
- Infrastructure: {payload.infrastructure}
- Talent: {payload.talent}
- Use-case Clarity: {payload.use_case_clarity}
Overall Score: {score}/100
Stated Goals: {payload.goals}

Structure the report as:
### Executive Summary
(2-3 sentences)

### Strengths
- bullet points based on high-score dimensions

### Gaps to Close
- bullet points based on low-score dimensions

### Recommended Next Steps
1. Concrete action
2. Concrete action
3. Concrete action

### Suggested Provider Profile
One line describing the type of AI vendor NeuralAtlas would shortlist for this stage.
""".strip()

    report_md = ""
    if EMERGENT_LLM_KEY:
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"assessment-{uuid.uuid4()}",
                system_message=system_msg,
            ).with_model("anthropic", "claude-sonnet-4-6")
            resp = await chat.send_message(UserMessage(text=prompt))
            report_md = resp if isinstance(resp, str) else str(resp)
        except Exception as e:
            logger.exception("LLM error")
            report_md = f"### Report Generation Notice\nLLM temporarily unavailable ({e}). Score: **{score}/100**."
    else:
        report_md = f"### Report\nScore: **{score}/100** — LLM key not configured."

    obj = MaturityAssessment(**payload.model_dump(), score=score, report_markdown=report_md)
    await db.assessments.insert_one(obj.model_dump())
    return obj


# ---------- Auth routes ----------

@api_router.post("/auth/login")
async def login(payload: LoginPayload, response: Response):
    email = payload.email.lower()
    if email != ADMIN_EMAIL:
        raise HTTPException(401, "Invalid credentials")

    doc = await db.users.find_one({"email": ADMIN_EMAIL}, {"_id": 0})
    if not doc:
        raise HTTPException(500, "Admin not seeded")
    if not verify_password(payload.password, doc["password_hash"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_token(ADMIN_EMAIL, hours=12)
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=12 * 3600, path="/",
    )
    return {"access_token": token, "token_type": "bearer", "email": ADMIN_EMAIL, "role": "admin"}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_admin)):
    return user


# ---------- Protected admin routes ----------

@api_router.get("/enterprise/intake", response_model=List[EnterpriseIntake])
async def list_enterprise_intakes(user: dict = Depends(get_current_admin)):
    docs = await db.enterprise_intakes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.patch("/enterprise/intake/{intake_id}")
async def update_enterprise_status(intake_id: str, upd: StatusUpdate, user: dict = Depends(get_current_admin)):
    r = await db.enterprise_intakes.update_one({"id": intake_id}, {"$set": {"status": upd.status}})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api_router.post("/enterprise/intake/{intake_id}/shortlist", response_model=EnterpriseIntake)
async def regenerate_shortlist(intake_id: str, user: dict = Depends(get_current_admin)):
    intake = await db.enterprise_intakes.find_one({"id": intake_id}, {"_id": 0})
    if not intake:
        raise HTTPException(404, "Not found")
    matches = await generate_shortlist(intake)
    await db.enterprise_intakes.update_one({"id": intake_id}, {"$set": {"shortlist": matches}})
    intake["shortlist"] = matches
    return intake


@api_router.post("/newsletter/subscribe")
async def newsletter_subscribe(payload: NewsletterSubscribe):
    email = payload.email.lower()
    existing = await db.newsletter_subscribers.find_one({"email": email})
    if not existing:
        await db.newsletter_subscribers.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "created_at": now_iso(),
        })
    return {"ok": True, "email": email}


# ---------- Case Studies ----------

@api_router.get("/case-studies", response_model=List[CaseStudy])
async def list_case_studies(include_drafts: bool = False, request: Request = None):
    # Only admins can see drafts
    query = {} if not include_drafts else None
    if include_drafts:
        try:
            await get_current_admin(request)
            query = {}
        except HTTPException:
            query = {"published": True}
    else:
        query = {"published": True}
    docs = await db.case_studies.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.get("/case-studies/{slug}", response_model=CaseStudy)
async def get_case_study(slug: str):
    doc = await db.case_studies.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    return doc


@api_router.post("/case-studies", response_model=CaseStudy)
async def create_case_study(payload: CaseStudyCreate, user: dict = Depends(get_current_admin)):
    if await db.case_studies.find_one({"slug": payload.slug}):
        raise HTTPException(409, "Slug already exists")
    obj = CaseStudy(**payload.model_dump())
    await db.case_studies.insert_one(obj.model_dump())
    return obj


@api_router.patch("/case-studies/{cs_id}", response_model=CaseStudy)
async def update_case_study(cs_id: str, upd: CaseStudyUpdate, user: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in upd.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")
    if "slug" in updates:
        clash = await db.case_studies.find_one({"slug": updates["slug"], "id": {"$ne": cs_id}})
        if clash:
            raise HTTPException(409, "Slug already exists")
    if "metrics" in updates:
        updates["metrics"] = [m.model_dump() if hasattr(m, "model_dump") else m for m in updates["metrics"]]
    updates["updated_at"] = now_iso()
    r = await db.case_studies.update_one({"id": cs_id}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    doc = await db.case_studies.find_one({"id": cs_id}, {"_id": 0})
    return doc


@api_router.delete("/case-studies/{cs_id}")
async def delete_case_study(cs_id: str, user: dict = Depends(get_current_admin)):
    r = await db.case_studies.delete_one({"id": cs_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api_router.get("/provider/application", response_model=List[ProviderApplication])
async def list_provider_applications(user: dict = Depends(get_current_admin)):
    docs = await db.provider_applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.patch("/provider/application/{app_id}")
async def update_provider_status(app_id: str, upd: StatusUpdate, user: dict = Depends(get_current_admin)):
    r = await db.provider_applications.update_one({"id": app_id}, {"$set": {"status": upd.status}})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api_router.get("/assessment", response_model=List[MaturityAssessment])
async def list_assessments(user: dict = Depends(get_current_admin)):
    docs = await db.assessments.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_current_admin)):
    ent_total = await db.enterprise_intakes.count_documents({})
    ent_new = await db.enterprise_intakes.count_documents({"status": "new"})
    ent_matched = await db.enterprise_intakes.count_documents({"status": "matched"})
    prov_total = await db.provider_applications.count_documents({})
    prov_approved = await db.provider_applications.count_documents({"status": "approved"})
    prov_new = await db.provider_applications.count_documents({"status": "new"})
    prov_assessing = await db.provider_applications.count_documents({"status": "assessing"})
    prov_rejected = await db.provider_applications.count_documents({"status": "rejected"})
    assessments = await db.assessments.count_documents({})

    tier_pricing = {"starter": 500, "growth": 1500, "elite": 5000}
    approved_docs = await db.provider_applications.find(
        {"status": "approved"}, {"_id": 0, "tier_interest": 1}
    ).to_list(1000)
    est_arr = sum(tier_pricing.get(d.get("tier_interest", "starter"), 0) for d in approved_docs)

    return {
        "enterprises": {"total": ent_total, "new": ent_new, "matched": ent_matched},
        "providers": {
            "total": prov_total, "new": prov_new, "assessing": prov_assessing,
            "approved": prov_approved, "rejected": prov_rejected,
        },
        "assessments_total": assessments,
        "estimated_arr_usd": est_arr,
    }


# ---------- Startup ----------

@app.on_event("startup")
async def startup_event():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin: {ADMIN_EMAIL}")
    else:
        if not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
            await db.users.update_one(
                {"email": ADMIN_EMAIL},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info(f"Rotated admin password: {ADMIN_EMAIL}")

    # Seed sample case studies if none exist
    if await db.case_studies.count_documents({}) == 0:
        samples = [
            {
                "slug": "meridian-bank-fraud-rag",
                "title": "Meridian Bank cuts fraud false-positives by 42%",
                "subtitle": "A RAG copilot for the fraud ops floor, deployed in eight weeks.",
                "client_name": "Meridian Bank",
                "industry": "BFSI",
                "region": "India",
                "provider_name": "Ledger Neural",
                "tier": "elite",
                "hero_image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
                "summary": "A tier-1 Indian bank replaced its rules-only fraud triage with a retrieval-augmented copilot that reads policy, prior cases, and live transaction context.",
                "challenge": "The fraud operations team was drowning in false positives — 3 in every 4 alerts were noise, and average handling time was rising 12% year-on-year. Legacy rule packs couldn't keep pace with new payment rails, and analysts had no context on prior similar cases.",
                "solution": "NeuralAtlas matched Meridian with Ledger Neural, an Elite-tier RAG specialist. The team shipped a copilot that retrieves relevant policy, past disposition notes and merchant history for every alert. Deployed on-prem, integrated with the existing case-management tool. Weekly evaluation runs by the NeuralAtlas architect ensured drift stayed under 3%.",
                "metrics": [
                    {"label": "False-positive rate", "value": "-42%"},
                    {"label": "Analyst handling time", "value": "-31%"},
                    {"label": "Time to production", "value": "8 weeks"},
                ],
                "quote": "The shortlist landed in 48 hours and the architect stayed in the room through go-live. That combination is why we picked NeuralAtlas over the big four.",
                "quote_author": "Head of Fraud Ops, Meridian Bank",
                "published": True,
            },
            {
                "slug": "helios-pharma-trial-analytics",
                "title": "Helios Pharma accelerates trial readouts by 3x",
                "subtitle": "Real-time analytics across five global trials, without touching the EDC.",
                "client_name": "Helios Pharma",
                "industry": "Pharma & Life Sciences",
                "region": "UAE",
                "provider_name": "Molecule.ai",
                "tier": "elite",
                "hero_image": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=80",
                "summary": "A Dubai-based pharma matched with a boutique trial-analytics team compressed monthly readouts from two weeks to under four days.",
                "challenge": "Helios ran five concurrent Phase-2 trials but each monthly readout took two weeks of manual SAS work. Biostatisticians were burnt out, and the CMO wanted daily visibility, not monthly.",
                "solution": "NeuralAtlas paired Helios with Molecule.ai — a five-person specialist in trial data platforms. They built a read-only analytics layer over the EDC using dbt + a lightweight LLM summariser, published to the CMO's dashboard.",
                "metrics": [
                    {"label": "Readout cycle", "value": "3x faster"},
                    {"label": "Biostat manual work", "value": "-70%"},
                    {"label": "Regulator queries answered", "value": "under 24h"},
                ],
                "quote": "We evaluated two big consultancies for six months. NeuralAtlas found the right five-person team in a week.",
                "quote_author": "Chief Medical Officer, Helios Pharma",
                "published": True,
            },
            {
                "slug": "coastway-maritime-route-ai",
                "title": "Coastway Maritime saves $2.1M on bunker fuel",
                "subtitle": "Route optimisation across 42 vessels, powered by a boutique four-person AI team.",
                "client_name": "Coastway Maritime",
                "industry": "Maritime",
                "region": "India / UAE",
                "provider_name": "Marlin AI",
                "tier": "growth",
                "hero_image": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1600&q=80",
                "summary": "A regional shipping operator matched with a niche AI team squeezed measurable fuel savings across a 42-vessel fleet in the first quarter.",
                "challenge": "Fuel is 60% of operating cost. Coastway's fleet operations centre relied on tribal knowledge and static routing plans. They wanted AI, but every vendor pitched a $2M+ 18-month engagement.",
                "solution": "NeuralAtlas introduced Marlin AI — a four-person team specialising in maritime weather + hull-fouling models. In six weeks they shipped a routing assistant integrated with the operator's existing AIS feed.",
                "metrics": [
                    {"label": "Bunker fuel saved", "value": "$2.1M / yr"},
                    {"label": "Voyage plan accuracy", "value": "+18%"},
                    {"label": "Payback period", "value": "4 months"},
                ],
                "quote": "Small team, sharp domain knowledge, real numbers. Exactly what a curated marketplace should deliver.",
                "quote_author": "COO, Coastway Maritime",
                "published": True,
            },
        ]
        for s in samples:
            obj = CaseStudy(**s)
            await db.case_studies.insert_one(obj.model_dump())
        logger.info(f"Seeded {len(samples)} sample case studies")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
