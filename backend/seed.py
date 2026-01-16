from app.database import SessionLocal, engine
from app import models

def seed():
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user 1 exists
        user = db.query(models.User).filter(models.User.id == 1).first()
        if not user:
            user = models.User(
                id=1,
                email="demo@example.com",
                hashed_password="hashed_placeholder"
            )
            db.add(user)
            db.commit()
            print("Created demo user.")

        # Check if any decks exist
        deck = db.query(models.Deck).first()
        if not deck:
            deck = models.Deck(
                title="React Hooks Masterclass",
                description="Master the most common React hooks with these flashcards.",
                owner_id=1
            )
            db.add(deck)
            db.commit()
            db.refresh(deck)
            print(f"Created demo deck: {deck.title}")

            # Add some cards
            cards = [
                models.Card(
                    deck_id=deck.id,
                    code_snippet="const [state, setState] = useState(initialState);",
                    explanation="useState is a Hook that lets you add React state to function components.",
                    language="javascript",
                    tags=["react", "hooks", "state"]
                ),
                models.Card(
                    deck_id=deck.id,
                    code_snippet="useEffect(() => {\n  document.title = `You clicked ${count} times`;\n}, [count]);",
                    explanation="useEffect lets you perform side effects in function components. The second argument is a dependency array.",
                    language="javascript",
                    tags=["react", "hooks", "effects"]
                )
            ]
            db.add_all(cards)
            db.commit()
            print("Added demo cards.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
