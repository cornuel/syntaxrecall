import os
import re
import yaml
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, engine
from backend.app.models import Card, Deck, User, Base


def parse_markdown_cards(file_path):
    with open(file_path, "r") as f:
        content = f.read()

    # Split by separator ---
    sections = re.split(r"\n---\n", content)
    cards = []

    for i in range(len(sections)):
        section = sections[i].strip()
        if not section:
            continue

        # Try to parse as YAML
        try:
            metadata = yaml.safe_load(section)
            # Check if it's actually our frontmatter
            if isinstance(metadata, dict) and (
                "tags" in metadata or "roadmap_id" in metadata
            ):
                # Found frontmatter, the next section should be the body
                if i + 1 < len(sections):
                    body_raw = sections[i + 1].strip()

                    # Parse body
                    title_match = re.search(r"^# (.*)", body_raw, re.MULTILINE)
                    title = title_match.group(1) if title_match else "Untitled Card"

                    code_match = re.search(
                        r"## Code Snippet\s+```python\n(.*?)\n```", body_raw, re.DOTALL
                    )
                    code_snippet = code_match.group(1) if code_match else ""

                    explanation_match = re.search(
                        r"## Explanation\n(.*)", body_raw, re.DOTALL
                    )
                    explanation = (
                        explanation_match.group(1).strip() if explanation_match else ""
                    )

                    cards.append(
                        {
                            "title": title,
                            "code_snippet": code_snippet,
                            "explanation": explanation,
                            "language": metadata.get("language", "python"),
                            "tags": metadata.get("tags", []),
                            "roadmap_id": metadata.get("roadmap_id"),
                            "roadmap_title": metadata.get("roadmap_title"),
                        }
                    )
        except (yaml.YAMLError, AttributeError):
            continue

    return cards


def import_cards(file_path, user_email="admin@example.com"):
    db = SessionLocal()
    try:
        # Get or create user
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            user = User(email=user_email, username="admin")
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user: {user_email}")

        # Get or create default Pydantic deck
        deck = (
            db.query(Deck)
            .filter(Deck.owner_id == user.id, Deck.title == "Pydantic Mastery")
            .first()
        )
        if not deck:
            deck = Deck(
                title="Pydantic Mastery",
                description="Comprehensive Pydantic v2 flashcards for FastAPI developers.",
                owner_id=user.id,
                is_public=True,
            )
            db.add(deck)
            db.commit()
            db.refresh(deck)
            print(f"Created deck: {deck.title}")

        cards_data = parse_markdown_cards(file_path)
        print(f"Found {len(cards_data)} cards in {file_path}")

        new_cards_count = 0
        for data in cards_data:
            # Check if card already exists in this deck
            existing = (
                db.query(Card)
                .filter(Card.deck_id == deck.id, Card.title == data["title"])
                .first()
            )

            if not existing:
                card = Card(
                    deck_id=deck.id,
                    title=data["title"],
                    code_snippet=data["code_snippet"],
                    explanation=data["explanation"],
                    language=data["language"],
                    tags=data["tags"],
                    roadmap_id=data["roadmap_id"],
                    roadmap_title=data["roadmap_title"],
                )
                db.add(card)
                new_cards_count += 1

        db.commit()
        print(f"Imported {new_cards_count} new cards into deck '{deck.title}'")

    finally:
        db.close()


if __name__ == "__main__":
    import_cards("docs/flashcards/pydantic.md")
