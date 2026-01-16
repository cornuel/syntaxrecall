from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api import decks, cards, ai, auth

# Create database tables
# In a real app, we'd use Alembic migrations
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Flashcard AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Flashcard AI API"}


# We'll include routers here
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(decks.router, prefix="/api/decks", tags=["decks"])
app.include_router(cards.router, prefix="/api/cards", tags=["cards"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
