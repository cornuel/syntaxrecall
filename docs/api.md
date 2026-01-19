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

## Reviews

### `GET /decks/{deck_id}/reviews`
Fetch community reviews for a deck.
- **Query Params**: `skip` (int), `limit` (int)
- **Returns**: List of `ReviewResponse` (id, user_id, deck_id, rating, comment, username, created_at)

### `POST /decks/{deck_id}/reviews`
Submit or update a star rating and comment.
- **Payload**: `ReviewCreate` (rating: 1-5, comment: string)
- **Returns**: `ReviewResponse`
- **Rules**: One review per user per deck. Subsequent posts update the existing review.

---

## Cards

### `POST /cards/`
Add a card to a deck.
- **Payload**: `CardCreate` (deck_id, title, code_snippet, explanation, language, tags)
- **Note**: The `title` field is required and should be a short, descriptive summary of the concept.

### `POST /cards/{card_id}/review`
Submit an SM-2 review rating.
- **Payload**: `CardReview` (rating: 0-5)
- **Effect**: Updates `next_review`, `interval`, and `ease_factor`.

---

## Roadmaps

### `GET /roadmaps/`
List all available canonical roadmaps.
- **Returns**: List of `RoadmapResponse` (id, title, version, description, content)

### `GET /roadmaps/{roadmap_id}`
Get a specific roadmap and its full structure.
- **Returns**: `RoadmapResponse`

### `POST /roadmaps/{roadmap_id}/subscribe`
Subscribe the current user to a roadmap.
- **Returns**: `RoadmapSubscriptionResponse` (user_id, roadmap_id, created_at)

### `GET /roadmaps/subscriptions`
Get roadmaps the current user is subscribed to.
- **Returns**: List of `RoadmapResponse`

### `GET /roadmaps/{roadmap_id}/mastery`
Calculate the user's mastery for each node in a roadmap based on their cards' SM-2 stats.
- **Returns**: List of `NodeMastery` (node_id, mastery_percentage, total_cards, mastered_cards)

---

## AI

### `POST /ai/generate`
Generate a card using LLMs.
- **Payload**: `AIPromptRequest` (prompt string)
- **Returns**: `AIProjectResponse` (title, code_snippet, explanation, language, tags)
- **Note**: The AI automatically generates a descriptive title for each card.

---
[← Back to Index](./README.md)
