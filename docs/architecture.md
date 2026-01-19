# 🏗️ Architecture Overview

[← Back to Index](./README.md)

## System Design
Flashcard AI is built as a decoupled full-stack application optimized for developer experience and AI-driven workflows.

### 💻 Tech Stack
- **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS, shadcn/ui, React Flow.
- **Backend**: FastAPI (Python 3.14+), SQLAlchemy 2.0.
- **Database**: PostgreSQL (Relational storage for decks, cards, and users).
- **AI**: Google Gemini (primary), with support for Groq and Qwen (multi-provider fallback).
- **Auth**: NextAuth.js v5 + Custom JWT.

## 📁 Project Structure
```text
.
├── backend/            # FastAPI Application
│   ├── app/
│   │   ├── api/        # Endpoint routers (auth, decks, cards, ai, roadmaps)
│   │   ├── data/       # Roadmap JSON definitions
│   │   ├── services/   # Business logic (roadmap_service.py)
│   │   ├── models.py   # SQLAlchemy models
│   │   ├── schemas.py  # Pydantic validation models
│   │   └── sm2.py      # Spaced Repetition logic
│   └── requirements.txt
├── frontend/           # Next.js Application
│   ├── src/
│   │   ├── app/        # Pages and Routes (decks, marketplace, roadmaps)
│   │   ├── components/ # React components (UI/UX, RoadmapGraph, StarRating)
│   │   ├── lib/        # API client and utilities (api.ts, roadmap-utils.ts)
│   │   └── auth.ts     # NextAuth configuration
│   └── package.json
└── docs/               # Technical Documentation
```

## 🛠️ Key Components

### 1. Spaced Repetition Engine (SM-2)
Located in `backend/app/sm2.py`, this engine calculates the next review date based on user ratings (0-5). It handles `ease_factor`, `interval`, and `repetitions`.

### 2. AI Card Generator
Located in `backend/app/api/ai.py`, this service interacts with LLMs to transform a simple technical concept into a structured code-centric flashcard. Supports multiple providers (Gemini, Groq, Qwen) with automatic fallback and generates descriptive titles for all cards.

### 3. Roadmap Service
Located in `backend/app/services/roadmap_service.py`, this service manages canonical learning paths, user subscriptions, and mastery calculations based on SM-2 performance across roadmap nodes.

### 4. Multi-Tenant Data Access
Implemented via FastAPI Dependencies. Every request for data is scoped to the `current_user.id`, ensuring private learning environments.

### 3. Multi-Tenant Data Access
Implemented via FastAPI Dependencies. Every request for data is scoped to the `current_user.id`, ensuring private learning environments.

## 🛣️ Roadmap (MVP 2.0)
- **Phase 1 (Foundation)**: GitHub Auth, Multi-tenancy, User Profiles. ✅ *Completed*
- **Phase 2 (Social)**: Public Deck Marketplace, Forking, Ratings & Reviews, Canonical Roadmaps. ✅ *Completed*
- **Phase 3 (Analytics)**: Mastery Matrix, Skill Gap Analysis (AI-driven). 🔄 *In Progress*

---
[← Back to Index](./README.md)
