import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import Card, Deck, User


def test_card_filtering_by_language(client, db_session, auth_headers):
    # Setup: Create a deck and some cards
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    deck = Deck(title="Test Deck", owner_id=user.id, is_public=True)
    db_session.add(deck)
    db_session.flush()

    c1 = Card(
        deck_id=deck.id,
        title="Python Card",
        explanation="Python exp",
        code_snippet="print()",
        language="python",
        tags=["lang:py"],
    )
    c2 = Card(
        deck_id=deck.id,
        title="JS Card",
        explanation="JS exp",
        code_snippet="console.log()",
        language="javascript",
        tags=["lang:js"],
    )
    db_session.add_all([c1, c2])
    db_session.commit()

    # Test language filter
    response = client.get("/api/cards/?language=python", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["language"] == "python"


def test_card_filtering_by_tags_partial(client, db_session, auth_headers):
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    deck = Deck(title="Test Deck", owner_id=user.id, is_public=True)
    db_session.add(deck)
    db_session.flush()

    c1 = Card(
        deck_id=deck.id,
        title="DI Card",
        explanation="DI exp",
        code_snippet="def di(): pass",
        language="python",
        tags=["pattern:dependency-injection"],
    )
    c2 = Card(
        deck_id=deck.id,
        title="Auth Card",
        explanation="Auth exp",
        code_snippet="def auth(): pass",
        language="python",
        tags=["pattern:auth"],
    )
    db_session.add_all([c1, c2])
    db_session.commit()

    # Test partial tag match: 'injection' should match 'pattern:dependency-injection'
    response = client.get("/api/cards/?tags__contains=injection", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "DI Card"


def test_card_global_search(client, db_session, auth_headers):
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    deck = Deck(title="Test Deck", owner_id=user.id, is_public=True)
    db_session.add(deck)
    db_session.flush()

    c1 = Card(
        deck_id=deck.id,
        title="FastAPI Depends",
        explanation="Using Depends for DI",
        code_snippet="@app.get('/')",
        language="python",
        tags=["fastapi"],
    )
    c2 = Card(
        deck_id=deck.id,
        title="React Hooks",
        explanation="Using useEffect",
        code_snippet="useEffect(() => {})",
        language="javascript",
        tags=["react"],
    )
    db_session.add_all([c1, c2])
    db_session.commit()

    # Search for code snippet part
    response = client.get("/api/cards/?search=@app.get", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "FastAPI Depends"

    # Search for explanation part
    response = client.get("/api/cards/?search=useEffect", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "React Hooks"


def test_deck_marketplace_filtering(client, db_session, auth_headers):
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    d1 = Deck(
        title="Python Basics",
        description="Learn Python",
        owner_id=user.id,
        is_public=True,
    )
    d2 = Deck(
        title="Advanced JS", description="Learn JS", owner_id=user.id, is_public=True
    )
    d3 = Deck(
        title="Private Deck", description="Secret", owner_id=user.id, is_public=False
    )
    db_session.add_all([d1, d2, d3])
    db_session.commit()

    # Search marketplace
    response = client.get("/api/decks/marketplace?search=Python", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Python Basics"
