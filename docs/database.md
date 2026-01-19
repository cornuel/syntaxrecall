# 🗄️ Database Schema

[← Back to Index](./README.md)

## Entity Relationship Diagram
Flashcard AI uses a relational schema designed for scalability and social features.

### 1. User (`users`)
Stores profile information and authentication identifiers.
- `id`: Primary Key.
- `email`: Unique.
- `github_id`: Unique identifier for OAuth.
- `username`: GitHub handle.
- `avatar_url`: Link to profile picture.
- `hashed_password`: Optional (used for future email/pass fallback).

### 2. Deck (`decks`)
The parent container for flashcards.
- `id`: Primary Key.
- `title`: String (e.g., "React Hooks").
- `description`: Text.
- `is_public`: Boolean (controls Marketplace visibility).
- `owner_id`: Foreign Key to `User.id`.
- `parent_id`: Foreign Key to `Deck.id` (tracks fork lineage).

### 3. Review (`reviews`)
Community feedback for public decks.
- `id`: Primary Key.
- `user_id`: Foreign Key to `User.id`.
- `deck_id`: Foreign Key to `Deck.id`.
- `rating`: Integer (1-5 stars).
- `comment`: Optional text.
- `created_at` / `updated_at`: Timestamps.

### 4. Card (`cards`)
Individual learning units.
- `id`: Primary Key.
- `deck_id`: Foreign Key to `Deck.id`.
- `code_snippet`: The primary code example.
- `explanation`: Concept details.
- `language`: Code highlight tag (py, js, etc.).
- `tags`: JSON list of keywords for AI skill analysis.

## 🧠 Spaced Repetition (SM-2) Fields
Each `Card` maintains its own learning state:
- `ease_factor`: Default 2.5. Influences how fast the interval grows.
- `interval`: Days until the next review.
- `repetitions`: Number of successful consecutive reviews.
- `next_review`: DateTime (UTC).
- `created_at` / `updated_at`: Timestamps.

## 📊 Data Relationships
- **One-to-Many**: User → Decks
- **One-to-Many**: Deck → Cards
- **One-to-Many**: User → Reviews
- **One-to-Many**: Deck → Reviews
- **One-to-Many**: Deck → Forks (via `parent_id`)
- **Many-to-Many**: User Likes on Decks (via `likes` table)

## 🔄 Resetting the Database
To wipe the database and recreate the tables based on the latest models:
```bash
cd backend
PYTHONPATH=. venv/bin/python3 reset_db.py
```

---
[← Back to Index](./README.md)
