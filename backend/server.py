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
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [ALERT_EMAIL],
            "subject": subject,
            "html": html_body,
        })
        logger.info(f"Alert emailed to {ALERT_EMAIL}: {subject}")
    except Exception as e:
        logger.exception(f"Resend send failed: {e}")


# ---------- Models ----------

class LoginPayload(BaseModel):
    email: EmailStr
    password: str


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


# ---------- Public routes ----------

@api_router.get("/")
async def root():
    return {"service": "NeuralAtlas.io API", "status": "live"}


@api_router.post("/enterprise/intake", response_model=EnterpriseIntake)
async def create_enterprise_intake(payload: EnterpriseIntakeCreate):
    obj = EnterpriseIntake(**payload.model_dump())
    await db.enterprise_intakes.insert_one(obj.model_dump())

    html = f"""
    <h2>New Enterprise Intake</h2>
    <p><b>{obj.company_name}</b> ({obj.industry} · {obj.company_size})</p>
    <p>{obj.contact_name} &lt;{obj.email}&gt; · {obj.role}</p>
    <p><b>Budget:</b> {obj.budget_range} · <b>Timeline:</b> {obj.timeline} · <b>Region:</b> {obj.region}</p>
    <p><b>Project:</b><br>{obj.project_description}</p>
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
