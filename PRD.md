# Product Requirements Document: Flashcard AI MVP 2.0

## 1. Executive Summary
Flashcard AI is an intelligent learning platform specifically designed for developers. By combining AI-powered card generation with the SM-2 Spaced Repetition algorithm, it helps developers master complex technical concepts and syntax efficiently. MVP 2.0 transitions the product from a local tool to a collaborative, data-driven ecosystem.

**Vision:** To become the primary knowledge retention tool for the modern software engineer.

---

## 2. Target Audience
- **Primary:** Junior and Mid-level Developers learning new languages or frameworks.
- **Secondary:** Senior Developers preparing for interviews or maintaining high-level competency in multiple stacks.
- **Tertiary:** Coding bootcamp students requiring structured knowledge reinforcement.

---

## 3. Product Goals & KPIs
### Goals
- **Differentiation:** Move beyond generic flashcards with code-specific logic and AI-driven skill gap analysis.
- **Learning Outcomes:** Improve long-term retention through precision-scheduled reviews and diagnostic feedback.
- **User Growth:** Foster a community where developers share high-quality technical decks.

### Key Performance Indicators (KPIs)
- **Retention:** % of users returning for scheduled reviews at 7, 14, and 30-day marks.
- **Engagement:** Average number of cards generated and reviewed per user per week.
- **Social:** Number of public decks created and "forked" (cloned) by other users.
- **Mastery:** Improvement in "Time-to-Recall" metrics for technical concepts over time.

---

## 4. Feature Specifications

### 4.1 Authentication & User Management
- **GitHub OAuth:** Primary login method for developers, enabling sync with GitHub profiles.
- **JWT-based Sessions:** Secure API communication with token refresh logic.
- **User Profiles:** Displays learning streaks, technology stack focus, and public deck contributions.
- **Data Persistence:** Migration of local decks to user-linked cloud storage.

### 4.2 Social & Collaborative Learning
- **Deck Marketplace:** A searchable repository of public decks tagged by language (e.g., React, Rust, System Design).
- **Deck Forking:** Users can clone a public deck to their own collection for personalized modification.
- **Rating & Review System:** Community-driven quality control for shared content.
- **Collaborative Decks:** (Stretch Goal) Shared decks for teams or study groups.

### 4.3 Developer-Centric Analytics
- **Technology Mastery Matrix:** A heat-map visualization showing proficiency across different languages based on review performance.
- **Skill Gap Analysis:** AI identifies recurring failures in specific tags (e.g., "Closure", "Concurrency") and suggests targeted card generation.
- **Performance Dashboard:**
    - Daily/Weekly review volume.
    - Recall accuracy trends.
    - Average time-to-answer per topic.
- **Commit History Style Streak:** A "green square" grid representing study consistency, mirroring GitHub's UI.

---

## 5. Technical Requirements

### 5.1 Backend (FastAPI)
- **Auth Service:** Integration with NextAuth.js (Auth.js) on the frontend. Initial implementation uses a shared-secret handshake for "trust" during the OAuth callback.
- **Security Note (Auth):** Backend must eventually be updated to independently verify GitHub access tokens or implement a full OAuth2 code exchange flow to eliminate reliance on frontend trust.
- **Relational Updates:** Update SQLAlchemy models to support `User` ownership of `Decks` and many-to-many relationships for social features (likes, forks).
- **Aggregation Engine:** Background tasks to calculate analytics without impacting API latency.

### 5.2 Frontend (Next.js + shadcn/ui)
- **Auth State:** Persistent auth state management using React Query and secure cookies.
- **Data Visualization:** Integration of `Recharts` or `Nivo` for the mastery matrix and performance graphs.
- **Marketplace UI:** High-performance search and filtering for public decks.

### 5.3 AI Enhancements
- **Context-Aware Generation:** AI considers the user's existing knowledge (via analytics) to generate cards at the appropriate difficulty level.

---

## 6. Success Metrics & Roadmap

### Phase 1: Foundation (Weeks 1-3)
- [x] Implement GitHub Auth.
- [x] Migrate database to multi-tenant architecture.
- [x] Build basic User Profile pages.

### Phase 2: Social (Weeks 4-6)
- [x] Launch Deck Marketplace.
- [x] Implement Forking and Rating logic.
- [x] Public/Private deck privacy controls.

### Phase 3: Analytics (Weeks 7-9)
- [ ] Build the Analytics Dashboard.
- [ ] Implement AI Skill Gap Analysis.
- [ ] Add mastery matrix visualizations.

---

## 7. Risks & Mitigations
- **Data Privacy:** Ensure user-generated code snippets (which might contain sensitive logic) are handled securely.
- **AI Hallucinations:** Implement a "Refinement" step (already in MVP 1.0) to allow manual review of AI cards.
- **Scalability:** Optimize database queries for the marketplace as deck volume grows.
