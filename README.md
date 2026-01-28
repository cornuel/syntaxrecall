# SyntaxRecall

An AI-powered full-stack application for generating and studying code-based flashcards using the SM-2 spaced repetition algorithm.

## Features
- **AI Card Generation**: Create high-fidelity flashcards from code snippets or concepts using Gemini/Groq.
- **Anki-Style Study**: Progressive reveal interface (Title -> Code -> Explanation) with "Again, Hard, Good, Easy" grading.
- **Dossier-Style Cards**: Professional UI featuring Monaco Code Editor (JetBrains Mono), Tiptap Rich Text, and background language watermarks.
- **Canonical Roadmaps**: Interactive learning paths with graph visualization (React Flow) and node-specific mastery tracking.
- **Starter Card Seeding**: Optionally subscribe to roadmaps with a pre-built "Starter Set" of high-quality cards (e.g., Pydantic v2 Mastery).
- **Community Marketplace**: Share, fork, rate, and review technical decks.
- **Technical Librarian Profiles**: Personalized dashboards with study streaks, contribution stats, active roadmap tracking, and achievement badges.
- **Advanced Discovery**: Fuzzy search, trigram-based similarity ranking, and tag-based filtering for deep exploration.
- **SM-2 Algorithm**: Precision-scheduled reviews based on proven cognitive science.
- **Knowledge Pruning**: "Burn Knowledge" destructive patterns for permanent removal of decks/cards with safety confirmation.
- **GitHub OAuth**: Seamless authentication for developers.

---

## 🛠️ Installation & Setup

### Option 1: Docker (Recommended for Dev & Prod)
The easiest way to get started is using Docker Compose.

1. **Setup Environment**:
   ```bash
   cp .env.example .env
   # Update .env with your API keys
   ```

2. **Run Setup Script**:
   ```bash
   ./scripts/docker-setup.sh
   ```
   This will build the images, start the containers, and initialize the database.

3. **Manual Control**:
   - Start: `docker compose up -d`
   - Stop: `docker compose down`
   - Logs: `docker compose logs -f`

### Option 2: Manual Installation
#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Setup**:
Create a `backend/.env` file:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flash
GOOGLE_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
INTERNAL_AUTH_SECRET=handshake-secret
```

**Database Setup**:
```bash
python reset_db.py       # Warning: This clears existing data
python seed.py           # Populate with demo users and initial decks
python ingest_roadmaps.py # Load canonical roadmaps from JSON
export PYTHONPATH=$PYTHONPATH:$(pwd) # Ensure app module is findable
python scripts/import_pydantic_cards.py # Import Pydantic v2 starter library
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
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, ShadCN UI, TanStack Query v5, React Flow.
- **Backend**: FastAPI, Python 3.14+, SQLAlchemy 2.0 (Mapped/mapped_column), Pydantic v2.
- **Database**: PostgreSQL (with Trigram search and pg_trgm extensions).
- **AI**: Google Gemini 2.0 Flash / Groq (Llama 3) / Qwen (via multi-provider adapter).
- **Auth**: NextAuth.js v5 (Beta) + Custom GitHub OAuth Handshake.

## 📄 Documentation
For detailed technical guides, see the `/docs` directory:
- [API Reference](./docs/api.md)
- [Architecture Overview](./docs/architecture.md)
- [Docker Development Workflow](./docs/docker-workflow.md)
- [Database Schema](./docs/database.md)
- [Agent Guidelines](./AGENTS.md)
