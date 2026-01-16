# Flashcard Antigravity

An AI-powered full-stack application for generating and studying code-based flashcards using the SM-2 spaced repetition algorithm.

## Features
- **AI Card Generation**: Create flashcards from code snippets or concepts using Gemini/Groq.
- **SM-2 Spaced Repetition**: Optimized study schedule based on recall quality.
- **Community Marketplace**: Share your technical knowledge or fork decks from others.
- **GitHub OAuth**: Secure login with your GitHub account.

---

## 🛠️ Installation & Setup

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Database Setup**:
```bash
python reset_db.py  # Warning: This clears existing data
python seed.py      # Populate with demo data
```

**Run Server**:
```bash
uvicorn app.main:app --reload
```

### 2. Frontend (Next.js)
```bash
cd frontend
pnpm install
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to start studying.

---

## 🏗️ Technical Stack
- **Frontend**: Next.js 15+, Tailwind CSS, ShadCN UI, TanStack Query.
- **Backend**: FastAPI, Python 3.14+, SQLAlchemy 2.0, Pydantic v2.
- **Database**: SQLite (Development) / PostgreSQL (Production ready).
- **AI**: Google Gemini Pro / Groq.

## 📄 Documentation
For detailed technical guides, see the `/docs` directory:
- [API Reference](./docs/api.md)
- [Architecture Overview](./docs/architecture.md)
- [Database Schema](./docs/database.md)
- [Agent Guidelines](./AGENTS.md)
