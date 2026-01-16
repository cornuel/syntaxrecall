import pytest
from app.database import settings


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


def test_marketplace_and_forking(client):
    # 1. Create User A and a public deck
    header_a = get_auth_header(client, "user_a@example.com", "usera", "1")
    deck_resp = client.post(
        "/api/decks/",
        headers=header_a,
        json={
            "title": "Public Deck",
            "description": "Shared knowledge",
            "is_public": True,
        },
    )
    deck_id = deck_resp.json()["id"]

    # Add a card to User A's deck
    client.post(
        "/api/cards/",
        headers=header_a,
        json={
            "deck_id": deck_id,
            "code_snippet": "print('hello')",
            "explanation": "prints hello",
            "language": "python",
            "tags": ["basic"],
        },
    )

    # 2. User B views marketplace
    header_b = get_auth_header(client, "user_b@example.com", "userb", "2")
    market_resp = client.get("/api/decks/marketplace", headers=header_b)
    assert market_resp.status_code == 200
    market_data = market_resp.json()
    assert len(market_data) >= 1
    # Check if our deck is in the list
    found = False
    for deck in market_data:
        if deck["id"] == deck_id:
            assert deck["title"] == "Public Deck"
            assert deck["owner_username"] == "usera"
            found = True
            break
    assert found

    # 3. User B forks the deck
    fork_resp = client.post(f"/api/decks/{deck_id}/fork", headers=header_b)
    assert fork_resp.status_code == 200
    fork_data = fork_resp.json()
    assert fork_data["title"] == "Public Deck"
    assert fork_data["owner_id"] != deck_resp.json()["owner_id"]
    assert fork_data["parent_id"] == deck_id

    # 4. Verify User B has the card and SM-2 stats are reset
    cards_resp = client.get(f"/api/decks/{fork_data['id']}/cards", headers=header_b)
    assert len(cards_resp.json()) == 1
    card = cards_resp.json()[0]
    assert card["code_snippet"] == "print('hello')"
    assert card["repetitions"] == 0
    assert card["ease_factor"] == 2.5


def test_like_system(client):
    header_a = get_auth_header(client, "user_a@example.com", "usera", "1")
    header_b = get_auth_header(client, "user_b@example.com", "userb", "2")

    deck_resp = client.post(
        "/api/decks/",
        headers=header_a,
        json={"title": "Likeable Deck", "is_public": True},
    )
    deck_id = deck_resp.json()["id"]

    # User B likes the deck
    like_resp = client.post(f"/api/decks/{deck_id}/like", headers=header_b)
    assert like_resp.status_code == 200
    assert like_resp.json()["message"] == "Deck liked"

    # Check marketplace for like count
    market_resp = client.get("/api/decks/marketplace", headers=header_b)
    found = False
    for deck in market_resp.json():
        if deck["id"] == deck_id:
            assert deck["likes_count"] == 1
            found = True
    assert found

    # User B unlikes the deck
    unlike_resp = client.post(f"/api/decks/{deck_id}/like", headers=header_b)
    assert unlike_resp.json()["message"] == "Deck unliked"

    market_resp = client.get("/api/decks/marketplace", headers=header_b)
    found = False
    for deck in market_resp.json():
        if deck["id"] == deck_id:
            assert deck["likes_count"] == 0
            found = True
    assert found
