import pytest
from app.database import settings


def test_github_exchange_success(client):
    payload = {
        "email": "test@example.com",
        "github_id": "12345",
        "username": "testuser",
        "avatar_url": "http://example.com/avatar.png",
        "shared_secret": settings.INTERNAL_AUTH_SECRET,
    }
    response = client.post("/api/auth/github-exchange", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_github_exchange_wrong_secret(client):
    payload = {
        "email": "test@example.com",
        "github_id": "12345",
        "username": "testuser",
        "avatar_url": "http://example.com/avatar.png",
        "shared_secret": "wrong-secret",
    }
    response = client.post("/api/auth/github-exchange", json=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid internal auth secret"


def test_protected_route_without_token(client):
    response = client.get("/api/decks/")
    assert response.status_code == 401


def test_protected_route_with_valid_token(client):
    # 1. Exchange to get token
    payload = {
        "email": "test@example.com",
        "github_id": "12345",
        "username": "testuser",
        "shared_secret": settings.INTERNAL_AUTH_SECRET,
    }
    exchange_resp = client.post("/api/auth/github-exchange", json=payload)
    token = exchange_resp.json()["access_token"]

    # 2. Access protected route
    response = client.get("/api/decks/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_user_creation_and_update(client):
    # 1. First exchange (create)
    payload = {
        "email": "test@example.com",
        "github_id": "12345",
        "username": "testuser",
        "shared_secret": settings.INTERNAL_AUTH_SECRET,
    }
    client.post("/api/auth/github-exchange", json=payload)

    # 2. Second exchange (update username)
    payload["username"] = "newusername"
    response = client.post("/api/auth/github-exchange", json=payload)
    assert response.status_code == 200

    # Check if updated (via token decoding if we had a profile endpoint,
    # but here we'll just check it doesn't fail)
    assert "access_token" in response.json()
