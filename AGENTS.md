# Agent Guidelines: SyntaxRecall

This document provides essential information for AI agents working on the SyntaxRecall project. Adhere to these conventions to ensure consistency and quality.

## 1. Project Overview

A full-stack application for generating and studying code-based flashcards using AI (Gemini/Groq) and the SM-2 spaced repetition algorithm. Includes a **Community Marketplace** for sharing and forking technical knowledge.

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, ShadCN UI, TanStack Query.
- **Backend**: FastAPI, Python 3.14+, SQLAlchemy (2.0+), Pydantic v2.
- **Features**: AI Generation, SM-2 Spaced Repetition, GitHub OAuth, Deck Marketplace, Forking/cloning, Like system.

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
  - `GET /api/decks` - Personal library
  - `GET /api/decks/marketplace` - Community discovery
  - `POST /api/decks/{id}/fork` - Clone to library (resets SM-2 stats)
  - `POST /api/decks/{id}/like` - Toggle community upvote
  - `POST /api/cards/{id}/review` - SM-2 review
- **UI Logic**: Forked decks should be identified via `parent_id` rather than title modification. Use the `GitFork` icon for visual identification.
- **Commands**:
  - **BE**: `venv/bin/pytest`, `venv/bin/uvicorn app.main:app`
  - **FE**: `pnpm dev`, `pnpm build`, `pnpm lint`

## 7. Error Recovery & Safety

- **The 3-Strike Rule**: If a fix fails 3 times, suggest `/revert`.
- **Panic Button**: If the build is broken, use `/fix` before adding any new code.
- **Cleanup**: Never leave `console.log`, `print()`, or commented-out code blocks.

---
