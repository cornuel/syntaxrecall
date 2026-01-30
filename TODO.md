# SyntaxRecall Task Board

## 🔵 Completed

- [x] Design and implement beautiful landing page
- [x] Fix 'client is not defined' error in frontend API and Roadmap components
- [x] Phase 1: Foundation (GitHub Auth, Multi-tenancy, User Profiles)
- [x] Spaced Repetition (SM-2) verification
- [x] Technical Documentation (`/docs`)
- [x] Backend & Logic Testing
- [x] **Deck Marketplace Foundation** (Search & Listing)
- [x] **Deck Forking** (Cloning & Social Graph)
- [x] **Community Ratings** (Star ratings & reviews)
- [x] **Canonical Roadmap System**
- [x] Execute rebranding to SyntaxRecall across codebase and documentation
- [x] **Containerization & Professional Docker Environment** (Multi-stage builds, Dev/Prod orchestration)
- [x] **Documentation & Developer Experience Update** (Refined README, AGENTS.md, and JSDoc/Docstrings)
- [x] **Pydantic v2 Flashcard Library & Roadmap Integration**
  - [x] Research Pydantic v2 docs using Context7
  - [x] Generate 15+ high-quality flashcards in Markdown format
  - [x] Expand FastAPI Roadmap with advanced Pydantic nodes
  - [x] Build and execute automated import script for card ingestion
- [x] **Phase 3: Discovery Enhancements**
  - [x] Enable `pg_trgm` extension in PostgreSQL
  - [x] Migrate `Card.tags` to `JSONB` format
  - [x] Add GIN indexes for tags and GIN Trigram indexes for fuzzy search
  - [x] Integrate `fastapi-filter` for standardized query logic
  - [x] Implement fuzzy search similarity ranking in backend
  - [x] Build `AdvancedFilterBar` and Discovery UI
- [x] **Knowledge Management & Journey Initialization**
  - [x] **Starter Card Seeding**: Optional "Starter Set" opt-in dialog during roadmap subscription
  - [x] **Language Engine Fix**: Decoupled visual language identification from tags; now relies on normalized `language` field
  - [x] **Roadmap Lifecycle**: Implemented "Unsubscribe/Leave Roadmap" functionality with destructive confirmation UI
  - [x] **Knowledge Pruning (Burn Deck)**: Implemented secure deck deletion with card count warnings and top-center Sonner notifications
  - [x] **Bug Fix**: Resolved exponential card growth bug in roadmap seeding by restricting canonical search to system admin
- [x] **AI Generation Evolution (BYOK)**: Transferred to a stateless Bring Your Own Key architecture with a secure AI API Vault and multi-provider support (OpenAI, Anthropic, Gemini, etc.).

## 🟢 In Progress

- [ ] **Phase 3: Analytics & Mastery Matrix**
  - [ ] Build the Analytics Dashboard
  - [ ] Implement AI Skill Gap Analysis
  - [ ] Add mastery matrix visualizations

## 🟡 Backlog

- [ ] **Economics & Monetization**
  - [ ] Implement Pricing Section (Post-Economics decision)
- [ ] **Deck Marketplace Enhancements**
  - [ ] Tag-based exploration (dedicated UI)
- [ ] **Infrastructure**
  - [ ] Backend verification of GitHub tokens (Security hardening)
  - [ ] Frontend integration testing
- [ ] **Advanced Features**
  - [ ] Collaborative deck editing
  - [ ] Advanced search filters (by author, date, popularity)
  - [ ] Export decks to Anki/JSON
