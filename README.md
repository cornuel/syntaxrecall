# SyntaxRecall

An AI-powered full-stack application for generating and studying code-based flashcards using the SM-2 spaced repetition algorithm.

## Features
- **AI Card Generation**: Create high-fidelity flashcards from code snippets or concepts using Gemini/Groq.
- **Anki-Style Study**: Progressive reveal interface (Title -> Code -> Explanation) with "Again, Hard, Good, Easy" grading.
- **Dossier-Style Cards**: Professional UI featuring Monaco Code Editor (JetBrains Mono), Tiptap Rich Text, and background language watermarks.
- **Canonical Roadmaps**: Interactive learning paths with graph visualization (React Flow) and node-specific mastery tracking.
- **Community Marketplace**: Share, fork, rate, and review technical decks.
- **SM-2 Algorithm**: Precision-scheduled reviews based on proven cognitive science.
- **GitHub OAuth**: Seamless authentication for developers.

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
- **Frontend**: Next.js 15+, React 19, Tailwind CSS, ShadCN UI, TanStack Query, React Flow.
- **Backend**: FastAPI, Python 3.14+, SQLAlchemy 2.0, Pydantic v2.
- **Database**: SQLite (Development) / PostgreSQL (Production ready).
- **AI**: Google Gemini Pro / Groq / Qwen (multi-provider support).
- **Auth**: NextAuth.js v5 + Custom JWT.

## 📄 Documentation
For detailed technical guides, see the `/docs` directory:
- [API Reference](./docs/api.md)
- [Architecture Overview](./docs/architecture.md)
- [Database Schema](./docs/database.md)
- [Agent Guidelines](./AGENTS.md)
