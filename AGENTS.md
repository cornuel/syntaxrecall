# Agent Guidelines: SyntaxRecall

This document provides essential information for AI agents working on the SyntaxRecall project. Adhere to these conventions to ensure consistency and quality.

## 1. Project Overview

A full-stack application for generating and studying code-based flashcards using AI (Gemini/Groq) and the SM-2 spaced repetition algorithm. SyntaxRecall focuses on the "Technical Librarian" persona, allowing users to curate high-quality technical knowledge through a **Community Marketplace** and follow structured learning paths via **Canonical Roadmaps**.

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, ShadCN UI, TanStack Query, React Flow.
- **Backend**: FastAPI, Python 3.14+, SQLAlchemy (2.0+), Pydantic v2, PostgreSQL (with Trigram search).
- **Features**: AI Generation, SM-2 Spaced Repetition (Anki-style), GitHub OAuth, Deck Marketplace, Canonical Roadmaps, Monaco Code Editor, Tiptap Rich Text, Technical Librarian Profiles, Advanced Discovery (Fuzzy Search & Filtering).

## 2. Startup & Task Protocol

CRITICAL: At the start of every session, your first internal action must be:

1. **Check for `TODO.md`**:
   - If `TODO.md` does not exist or is empty, you MUST generate it immediately.
   - Base the initial `TODO.md` on the goals defined in `PRD.md`.
   - Organize tasks into: `[ ] Backlog`, `[ ] In Progress`, and `[x] Completed`.
2. **Sync State**: If `TODO.md` exists, read it to identify the current "In Progress" task before answering the user.

### Persistence Rules

- After completing any significant code change, you must update the corresponding task in `TODO.md` to `[x]`.
- If a new requirement emerges during conversation, add it to the `[ ] Backlog` in `TODO.md`.

## 3. Core Development Workflow (Phase-Gate)

Strictly follow these phases. Do not skip to Dev before Architect is done.

- **Phase 1: Architect**: Define DB models (`backend/app/models.py`) and Pydantic/Zod schemas.
- **Phase 2: Dev**: Implement logic. Use TanStack Query for all FE data fetching.
- **Phase 3: Test**: Every logic change requires a test. SM-2 logic must pass this check:
  $$EF' = \max(1.3, EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)))$$
- **Phase 4: Docs & Commit**: Update JSDoc/Docstrings. Update documentation inside /docs. Use `/commit` for atomic saves.

## 4. Backend Style Guidelines (Python/FastAPI)

- **Directory**: All work happens in `backend/`.
- **Imports**: Standard lib > 3rd Party > Local. Use absolute `app.xxx` imports.
- **Models**: Use SQLAlchemy 2.0 `Mapped` and `mapped_column`.
- **Schemas**: Response models must use `from_attributes = True`.

## 5. Frontend Style Guidelines (Next.js/TS)

- **Directory**: All work happens in `frontend/`.
- **Typing**: **ZERO `any` usage.** Infer types from Zod: `type T = z.infer<typeof S>`.
- **Components**: Functional components + Arrow functions. UI in `src/components/ui/`.
- **State**: Server state in TanStack Query. Local UI state in `useState`. No Redux.

## 6. API & Environment

- **REST**: Follow standard naming:
  - `GET /api/auth/me` - Profile stats and mastery overview
  - `GET /api/decks` - Personal library
  - `GET /api/decks/marketplace` - Community discovery (supports `title__ilike` filter)
  - `POST /api/decks` - Create a new technical deck
  - `PUT /api/decks/{id}` - Update deck details (title, description, is_public)
  - `DELETE /api/decks/{id}` - "Burn Knowledge" (irreversible deletion)
  - `POST /api/decks/{id}/fork` - Clone to library (resets SM-2 stats)
  - `POST /api/decks/{id}/like` - Toggle community upvote
  - `POST /api/decks/{id}/reviews` - Add/Update star rating and comment
  - `GET /api/decks/{id}/reviews` - Get community feedback
  - `GET /api/cards` - Personal card library (supports `tags__contains`, `language`, `search`)
  - `POST /api/cards/{id}/review` - SM-2 review
  - `POST /api/ai/generate` - AI-powered card generation
  - `GET /api/roadmaps` - List all canonical roadmaps
  - `GET /api/roadmaps/subscriptions` - List roadmaps user is tracking
  - `POST /api/roadmaps/{id}/subscribe` - Track progress (supports `include_default_cards=true` seeding)
  - `DELETE /api/roadmaps/{id}/unsubscribe` - Terminate roadmap journey
  - `GET /api/roadmaps/{id}/mastery` - Calculate proficiency per node (returns `mastery_percentage`, `total_cards`, etc.)
- **UI Logic**: 
  - **Cards**: Use the "Dossier" layout. Language logos are background watermarks (`opacity-[0.08]`). Relies on `card.language` matching full names in `LANGUAGE_MAP`.
  - **Editors**: Use `CodeEditor` (Monaco) for snippets and `RichTextEditor` (Tiptap) for explanations.
  - **Study**: Progressive reveal: Title (Mental Recall) -> click -> Code & Explanation.
  - **Destructive Actions**: Use the "Burn Knowledge" dialog pattern with card count warnings and top-center destructive Sonner toasts.
- **Commands**:
  - **BE**: `venv/bin/pytest`, `venv/bin/uvicorn app.main:app`
  - **FE**: `pnpm dev`, `pnpm build`, `pnpm lint`

## 7. Error Recovery & Safety

- **The 3-Strike Rule**: If a fix fails 3 times, suggest `/revert`.
- **Panic Button**: If the build is broken, use `/fix` before adding any new code.
- **Cleanup**: Never leave `console.log`, `print()`, or commented-out code blocks.

---
