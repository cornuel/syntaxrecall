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


def test_deck_star_rating_and_reviews(client):
    # 1. User A creates a public deck
    header_a = get_auth_header(client, "user_a@example.com", "usera", "1")
    deck_resp = client.post(
        "/api/decks/",
        headers=header_a,
        json={"title": "Reviewable Deck", "is_public": True},
    )
    deck_id = deck_resp.json()["id"]

    # 2. User B submits a review
    header_b = get_auth_header(client, "user_b@example.com", "userb", "2")
    review_resp = client.post(
        f"/api/decks/{deck_id}/reviews",
        headers=header_b,
        json={"rating": 5, "comment": "Excellent deck!"},
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["rating"] == 5
    assert review_resp.json()["username"] == "userb"

    # 3. Verify average rating in deck response
    deck_get = client.get(f"/api/decks/{deck_id}", headers=header_b)
    assert deck_get.json()["rating_avg"] == 5.0
    assert deck_get.json()["rating_count"] == 1

    # 4. User C submits another review
    header_c = get_auth_header(client, "user_c@example.com", "userc", "3")
    client.post(
        f"/api/decks/{deck_id}/reviews",
        headers=header_c,
        json={"rating": 3, "comment": "It's okay."},
    )

    deck_get = client.get(f"/api/decks/{deck_id}", headers=header_a)
    assert deck_get.json()["rating_avg"] == 4.0  # (5+3)/2
    assert deck_get.json()["rating_count"] == 2

    # 5. User B updates their review
    client.post(
        f"/api/decks/{deck_id}/reviews",
        headers=header_b,
        json={"rating": 1, "comment": "Changed my mind, it's bad."},
    )

    deck_get = client.get(f"/api/decks/{deck_id}", headers=header_a)
    assert deck_get.json()["rating_avg"] == 2.0  # (1+3)/2
    assert deck_get.json()["rating_count"] == 2

    # 6. List reviews
    reviews_list = client.get(f"/api/decks/{deck_id}/reviews", headers=header_a)
    assert len(reviews_list.json()) == 2
