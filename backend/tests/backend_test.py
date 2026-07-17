"""NeuralAtlas backend API tests - auth, protection, public endpoints, email no-op."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aimart-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "nandhavignesh2010@gmail.com"
ADMIN_PASSWORD = "NeuralAtlas@2026"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Health ----------

class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("status") == "live"


# ---------- Auth ----------

class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        assert data["email"].lower() == ADMIN_EMAIL.lower()
        assert data["role"] == "admin"
        # cookie set
        assert "access_token" in r.cookies or any("access_token" in h for h in r.headers.get("set-cookie", "").lower().split(","))

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_login_wrong_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "notadmin@example.com", "password": ADMIN_PASSWORD})
        assert r.status_code == 401

    def test_me_with_bearer(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"].lower() == ADMIN_EMAIL.lower()
        assert data["role"] == "admin"

    def test_me_without_auth(self, session):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------- Protection ----------

class TestProtection:
    @pytest.mark.parametrize("path", [
        "/admin/stats", "/enterprise/intake", "/provider/application", "/assessment"
    ])
    def test_get_requires_auth(self, path):
        r = requests.get(f"{API}{path}")
        assert r.status_code == 401, f"{path} should return 401 without auth, got {r.status_code}"

    @pytest.mark.parametrize("path", [
        "/admin/stats", "/enterprise/intake", "/provider/application", "/assessment"
    ])
    def test_get_with_auth(self, path, auth_headers):
        r = requests.get(f"{API}{path}", headers=auth_headers)
        assert r.status_code == 200, f"{path} should return 200 with auth, got {r.status_code} {r.text}"


# ---------- Public endpoints (unchanged) ----------

class TestPublicEndpoints:
    def test_enterprise_intake_public(self):
        payload = {
            "company_name": f"TEST_Ent_{int(time.time())}",
            "contact_name": "Test Contact",
            "email": "test_ent@example.com",
            "role": "CTO",
            "industry": "SaaS",
            "company_size": "mid",
            "project_description": "Test project for auth verification",
            "budget_range": "$50k-$100k",
            "timeline": "Q1 2026",
            "region": "India"
        }
        r = requests.post(f"{API}/enterprise/intake", json=payload)
        assert r.status_code == 200, f"Public intake failed: {r.status_code} {r.text}"
        data = r.json()
        assert data["company_name"] == payload["company_name"]
        assert data["status"] == "new"
        assert "id" in data
        return data["id"]

    def test_provider_application_public(self):
        payload = {
            "company_name": f"TEST_Prov_{int(time.time())}",
            "contact_name": "Provider Test",
            "email": "test_prov@example.com",
            "website": "https://example.com",
            "headquarters": "Bangalore",
            "team_size": "10-50",
            "specializations": "LLM, RAG, MLOps",
            "case_studies": "Test case study data",
            "tier_interest": "growth"
        }
        r = requests.post(f"{API}/provider/application", json=payload)
        assert r.status_code == 200, f"Public provider app failed: {r.status_code} {r.text}"
        data = r.json()
        assert data["company_name"] == payload["company_name"]
        assert data["tier_interest"] == "growth"
        assert data["status"] == "new"


# ---------- Email graceful no-op ----------

class TestEmailNoop:
    """Verify RESEND_API_KEY empty does NOT cause 500."""
    def test_intake_still_200_when_no_resend_key(self):
        payload = {
            "company_name": f"TEST_EmailNoop_{int(time.time())}",
            "contact_name": "Noop",
            "email": "noop@example.com",
            "role": "CEO",
            "industry": "Fintech",
            "company_size": "startup",
            "project_description": "email noop test",
            "budget_range": "$10k",
            "timeline": "asap",
        }
        r = requests.post(f"{API}/enterprise/intake", json=payload)
        assert r.status_code == 200

    def test_provider_still_200_when_no_resend_key(self):
        payload = {
            "company_name": f"TEST_EmailNoop_Prov_{int(time.time())}",
            "contact_name": "Noop",
            "email": "noopp@example.com",
            "headquarters": "Dubai",
            "team_size": "5",
            "specializations": "vision",
            "case_studies": "case",
            "tier_interest": "starter"
        }
        r = requests.post(f"{API}/provider/application", json=payload)
        assert r.status_code == 200


# ---------- End-to-end: submit intake then admin verifies ----------

class TestEndToEnd:
    def test_e2e_intake_and_admin_verify(self, auth_headers):
        # public submit
        marker = f"TEST_E2E_{int(time.time())}"
        payload = {
            "company_name": marker,
            "contact_name": "E2E Test",
            "email": "e2e@example.com",
            "role": "VP Eng",
            "industry": "Retail",
            "company_size": "large",
            "project_description": "e2e verification",
            "budget_range": "$100k",
            "timeline": "Q2",
        }
        r = requests.post(f"{API}/enterprise/intake", json=payload)
        assert r.status_code == 200
        created_id = r.json()["id"]

        # admin lists and finds
        r = requests.get(f"{API}/enterprise/intake", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert any(x["id"] == created_id and x["company_name"] == marker for x in items), \
            f"Newly created intake {created_id} not found in admin list"

        # patch status
        r = requests.patch(f"{API}/enterprise/intake/{created_id}",
                           headers=auth_headers, json={"status": "reviewing"})
        assert r.status_code == 200


# ---------- Iteration 4: Shortlist auto-generation ----------

class TestShortlist:
    def _base_intake(self, marker: str, project: str) -> dict:
        return {
            "company_name": marker,
            "contact_name": "Shortlist Tester",
            "email": "shortlist@example.com",
            "role": "CTO",
            "industry": "BFSI",
            "company_size": "large",
            "project_description": project,
            "budget_range": "$200k",
            "timeline": "Q1 2026",
            "region": "India",
        }

    def test_intake_returns_shortlist_field(self):
        # Even if no approved providers, shortlist must be a list (possibly empty).
        marker = f"TEST_Shortlist_{int(time.time())}"
        r = requests.post(f"{API}/enterprise/intake",
                          json=self._base_intake(marker, "Fraud detection RAG platform for retail banking."))
        assert r.status_code == 200, r.text
        data = r.json()
        assert "shortlist" in data, "response must include shortlist field"
        assert isinstance(data["shortlist"], list)

    def test_intake_shortlist_populated_when_approved_providers_exist(self, auth_headers):
        # Ensure at least one approved provider exists.
        r = requests.get(f"{API}/provider/application", headers=auth_headers)
        assert r.status_code == 200
        providers = r.json()
        approved = [p for p in providers if p.get("status") == "approved"]
        if not approved:
            # Approve first non-approved provider (or create + approve one) for the assertion.
            if providers:
                pid = providers[0]["id"]
                requests.patch(f"{API}/provider/application/{pid}",
                               headers=auth_headers, json={"status": "approved"})
            else:
                # Create then approve
                create_payload = {
                    "company_name": f"TEST_Prov_ForShortlist_{int(time.time())}",
                    "contact_name": "For Shortlist",
                    "email": "sl_prov@example.com",
                    "headquarters": "Bangalore",
                    "team_size": "10-50",
                    "specializations": "Fraud detection, RAG, LLM ops for BFSI",
                    "case_studies": "Deployed fraud detection at Tier1 bank.",
                    "tier_interest": "growth",
                }
                cr = requests.post(f"{API}/provider/application", json=create_payload)
                pid = cr.json()["id"]
                requests.patch(f"{API}/provider/application/{pid}",
                               headers=auth_headers, json={"status": "approved"})

        marker = f"TEST_ShortlistPop_{int(time.time())}"
        r = requests.post(f"{API}/enterprise/intake",
                          json=self._base_intake(marker,
                                                 "Build a fraud detection and RAG pipeline for BFSI KYC."))
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data["shortlist"], list)
        assert len(data["shortlist"]) >= 1, "Expected at least 1 shortlist match with approved providers"
        assert len(data["shortlist"]) <= 3
        m = data["shortlist"][0]
        for key in ("provider_id", "name", "tier", "fit_reason"):
            assert key in m and m[key], f"missing/empty {key} in match: {m}"

        # Persistence: fetch admin list and confirm shortlist persisted
        list_r = requests.get(f"{API}/enterprise/intake", headers=auth_headers)
        assert list_r.status_code == 200
        found = next((x for x in list_r.json() if x["id"] == data["id"]), None)
        assert found is not None
        assert isinstance(found["shortlist"], list)
        assert len(found["shortlist"]) == len(data["shortlist"])

    def test_regenerate_shortlist_requires_auth(self):
        # First create an intake so we have an id to hit
        marker = f"TEST_RegenAuth_{int(time.time())}"
        r = requests.post(f"{API}/enterprise/intake",
                          json=self._base_intake(marker, "Regen auth test — RAG project."))
        assert r.status_code == 200
        intake_id = r.json()["id"]
        # No bearer -> 401
        r2 = requests.post(f"{API}/enterprise/intake/{intake_id}/shortlist")
        assert r2.status_code == 401

    def test_regenerate_shortlist_with_admin(self, auth_headers):
        marker = f"TEST_Regen_{int(time.time())}"
        r = requests.post(f"{API}/enterprise/intake",
                          json=self._base_intake(marker, "Fraud detection RAG for KYC in BFSI."))
        assert r.status_code == 200
        intake_id = r.json()["id"]
        r2 = requests.post(f"{API}/enterprise/intake/{intake_id}/shortlist",
                           headers=auth_headers)
        assert r2.status_code == 200, r2.text
        data = r2.json()
        assert data["id"] == intake_id
        assert isinstance(data["shortlist"], list)

    def test_regenerate_shortlist_404_for_unknown(self, auth_headers):
        r = requests.post(f"{API}/enterprise/intake/does-not-exist-xyz/shortlist",
                          headers=auth_headers)
        assert r.status_code == 404


# ---------- Iteration 4: Newsletter ----------

class TestNewsletter:
    def test_subscribe_valid_email(self):
        email = f"test_news_{int(time.time())}@example.com"
        r = requests.post(f"{API}/newsletter/subscribe", json={"email": email})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert data.get("email") == email.lower()

    def test_subscribe_idempotent_same_email(self):
        email = f"test_news_dupe_{int(time.time())}@example.com"
        r1 = requests.post(f"{API}/newsletter/subscribe", json={"email": email})
        r2 = requests.post(f"{API}/newsletter/subscribe", json={"email": email})
        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r1.json().get("ok") is True
        assert r2.json().get("ok") is True

    def test_subscribe_invalid_email(self):
        r = requests.post(f"{API}/newsletter/subscribe", json={"email": "not-an-email"})
        assert r.status_code == 422

    def test_subscribe_missing_email(self):
        r = requests.post(f"{API}/newsletter/subscribe", json={})
        assert r.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
