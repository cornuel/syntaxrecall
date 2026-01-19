import pytest
from app.database import settings
from app.services.roadmap_service import ingest_roadmaps


@pytest.fixture(autouse=True)
def run_ingestion(db_session):
    ingest_roadmaps(db_session)


def get_auth_header(client, email: str, username: str, github_id: str):
    payload = {
        "email": email,
        "github_id": github_id,
        "username": username,
        "shared_secret": settings.INTERNAL_AUTH_SECRET,
    }
    response = client.post("/api/auth/github-exchange", json=payload)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_list_roadmaps(client):
    header = get_auth_header(client, "test@example.com", "testuser", "123")
    response = client.get("/api/roadmaps/", headers=header)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    ids = [r["id"] for r in data]
    assert "fastapi-backend-developer" in ids
    assert "python-core" in ids


def test_subscribe_and_mastery(client):
    header = get_auth_header(client, "test@example.com", "testuser", "123")
    roadmap_id = "python-core"

    # Subscribe
    sub_resp = client.post(f"/api/roadmaps/{roadmap_id}/subscribe", headers=header)
    assert sub_resp.status_code == 200
    assert sub_resp.json()["roadmap_id"] == roadmap_id

    # Check mastery (should be 0)
    mastery_resp = client.get(f"/api/roadmaps/{roadmap_id}/mastery", headers=header)
    assert mastery_resp.status_code == 200
    for node in mastery_resp.json():
        assert node["mastery_percentage"] == 0
        assert node["total_cards"] == 0


def test_mastery_with_cards(client):
    header = get_auth_header(client, "test@example.com", "testuser", "123")
    roadmap_id = "python-core"

    # Create a deck
    deck_resp = client.post("/api/decks/", headers=header, json={"title": "Test Deck"})
    deck_id = deck_resp.json()["id"]

    # Create a card with Python Fundamentals tags
    client.post(
        "/api/cards/",
        headers=header,
        json={
            "deck_id": deck_id,
            "title": "Python Assignment",
            "code_snippet": "x = 1",
            "explanation": "assignment",
            "language": "python",
            "tags": ["lang:python", "syntax:types", "syntax:control-flow"],
        },
    )

    # Verify we can fetch all cards
    cards_resp = client.get("/api/cards/", headers=header)
    assert cards_resp.status_code == 200
    assert len(cards_resp.json()) >= 1

    # Check mastery
    mastery_resp = client.get(f"/api/roadmaps/{roadmap_id}/mastery", headers=header)
    found = False
    for node in mastery_resp.json():
        if node["node_id"] == "py-fundamentals":
            assert node["total_cards"] == 1
            assert node["mastery_percentage"] == 0  # interval is 0
            found = True
    assert found
