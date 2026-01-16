# 🏗️ Architecture Overview

[← Back to Index](./README.md)

## System Design
Flashcard AI is built as a decoupled full-stack application optimized for developer experience and AI-driven workflows.

### 💻 Tech Stack
- **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS, shadcn/ui.
- **Backend**: FastAPI (Python 3.14+), SQLAlchemy 2.0.
- **Database**: PostgreSQL (Relational storage for decks, cards, and users).
- **AI**: Google Gemini (primary), with support for Groq and Qwen.
- **Auth**: NextAuth.js v5 + Custom JWT.

## 📁 Project Structure
```text
.
├── backend/            # FastAPI Application
│   ├── app/
│   │   ├── api/        # Endpoint routers (auth, decks, cards, ai)
│   │   ├── models.py   # SQLAlchemy models
│   │   ├── schemas.py  # Pydantic validation models
│   │   └── sm2.py      # Spaced Repetition logic
│   └── requirements.txt
├── frontend/           # Next.js Application
│   ├── src/
│   │   ├── app/        # Pages and Routes
│   │   ├── components/ # React components (UI/UX)
│   │   ├── lib/        # API client and utilities
│   │   └── auth.ts     # NextAuth configuration
│   └── package.json
└── docs/               # Technical Documentation
```

## 🛠️ Key Components

### 1. Spaced Repetition Engine (SM-2)
Located in `backend/app/sm2.py`, this engine calculates the next review date based on user ratings (0-5). It handles `ease_factor`, `interval`, and `repetitions`.

### 2. AI Card Generator
Located in `backend/app/api/ai.py`, this service interacts with LLMs to transform a simple technical concept into a structured code-centric flashcard.

### 3. Multi-Tenant Data Access
Implemented via FastAPI Dependencies. Every request for data is scoped to the `current_user.id`, ensuring private learning environments.

## 🛣️ Roadmap (MVP 2.0)
- **Phase 1 (Foundation)**: GitHub Auth, Multi-tenancy, User Profiles. ✅ *Current State*
- **Phase 2 (Social)**: Public Deck Marketplace, Forking, Ratings.
- **Phase 3 (Analytics)**: Mastery Matrix, Skill Gap Analysis (AI-driven).

---
[← Back to Index](./README.md)
