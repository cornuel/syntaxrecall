# 🔌 API Reference

[← Back to Index](./README.md)

## Base URL
`http://localhost:8000/api`

## Authentication
Most endpoints require a Bearer JWT in the `Authorization` header.

### `POST /auth/github-exchange`
Exchange GitHub profile data for a system JWT.
- **Payload**: `GitHubExchangeRequest` (email, github_id, username, avatar_url, shared_secret)
- **Returns**: `Token` (access_token, token_type)

---

## Decks

### `GET /decks/`
Returns all decks owned by the authenticated user.

### `POST /decks/`
Create a new deck.
- **Payload**: `DeckCreate` (title, description, is_public)

### `GET /decks/{deck_id}`
Get a specific deck and its cards.

### `GET /decks/marketplace`
List all public decks for discovery. Supports optional `search` query parameter.

### `POST /decks/{deck_id}/fork`
Clone a public deck into the authenticated user's library. Resets SM-2 stats for the new cards.

### `POST /decks/{deck_id}/like`
Toggle a "like" on a deck.

---

## Cards

### `POST /cards/`
Add a card to a deck.
- **Payload**: `CardCreate` (deck_id, code_snippet, explanation, language, tags)

### `POST /cards/{card_id}/review`
Submit an SM-2 review rating.
- **Payload**: `CardReview` (rating: 0-5)
- **Effect**: Updates `next_review`, `interval`, and `ease_factor`.

---

## AI

### `POST /ai/generate`
Generate a card using LLMs.
- **Payload**: `AIPromptRequest` (prompt string)
- **Returns**: `AIProjectResponse` (structured card data)

---
[← Back to Index](./README.md)
