from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="NeuralAtlas.io API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------

def now_iso():
    return datetime.now(timezone.utc).isoformat()


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
    data_readiness: int  # 1-5
    infrastructure: int  # 1-5
    talent: int  # 1-5
    use_case_clarity: int  # 1-5
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


# ---------- Routes ----------

@api_router.get("/")
async def root():
    return {"service": "NeuralAtlas.io API", "status": "live"}


@api_router.post("/enterprise/intake", response_model=EnterpriseIntake)
async def create_enterprise_intake(payload: EnterpriseIntakeCreate):
    obj = EnterpriseIntake(**payload.model_dump())
    await db.enterprise_intakes.insert_one(obj.model_dump())
    return obj


@api_router.get("/enterprise/intake", response_model=List[EnterpriseIntake])
async def list_enterprise_intakes():
    docs = await db.enterprise_intakes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.patch("/enterprise/intake/{intake_id}")
async def update_enterprise_status(intake_id: str, upd: StatusUpdate):
    r = await db.enterprise_intakes.update_one({"id": intake_id}, {"$set": {"status": upd.status}})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api_router.post("/provider/application", response_model=ProviderApplication)
async def create_provider_application(payload: ProviderApplicationCreate):
    obj = ProviderApplication(**payload.model_dump())
    await db.provider_applications.insert_one(obj.model_dump())
    return obj


@api_router.get("/provider/application", response_model=List[ProviderApplication])
async def list_provider_applications():
    docs = await db.provider_applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.patch("/provider/application/{app_id}")
async def update_provider_status(app_id: str, upd: StatusUpdate):
    r = await db.provider_applications.update_one({"id": app_id}, {"$set": {"status": upd.status}})
    if r.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@api_router.post("/assessment", response_model=MaturityAssessment)
async def create_assessment(payload: MaturityAssessmentCreate):
    total = payload.data_readiness + payload.infrastructure + payload.talent + payload.use_case_clarity
    score = int((total / 20) * 100)

    system_msg = (
        "You are a senior enterprise AI architect writing concise, executive-grade AI maturity reports "
        "for NeuralAtlas.io, a curated AI marketplace based in Bangalore & Dubai. Your tone is direct, "
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
            logging.exception("LLM error")
            report_md = f"### Report Generation Notice\nLLM temporarily unavailable ({e}). Score: **{score}/100**."
    else:
        report_md = f"### Report\nScore: **{score}/100** — LLM key not configured."

    obj = MaturityAssessment(**payload.model_dump(), score=score, report_markdown=report_md)
    await db.assessments.insert_one(obj.model_dump())
    return obj


@api_router.get("/assessment", response_model=List[MaturityAssessment])
async def list_assessments():
    docs = await db.assessments.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/admin/stats")
async def admin_stats():
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
            "total": prov_total,
            "new": prov_new,
            "assessing": prov_assessing,
            "approved": prov_approved,
            "rejected": prov_rejected,
        },
        "assessments_total": assessments,
        "estimated_arr_usd": est_arr,
    }


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
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
