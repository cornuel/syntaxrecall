from datetime import datetime
from typing import List, Optional
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import (
    String,
    Text,
    ForeignKey,
    DateTime,
    Float,
    Boolean,
    JSON,
    func,
    Integer,
    Index,
    event,
    DDL,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


# Database Events
event.listen(
    Base.metadata,
    "before_create",
    DDL("CREATE EXTENSION IF NOT EXISTS pg_trgm").execute_if(dialect="postgresql"),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    github_id: Mapped[Optional[str]] = mapped_column(
        String(100), unique=True, index=True, nullable=True
    )
    username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    decks: Mapped[List["Deck"]] = relationship(
        back_populates="owner", foreign_keys="[Deck.owner_id]"
    )
    likes: Mapped[List["Like"]] = relationship(back_populates="user")
    reviews: Mapped[List["Review"]] = relationship(back_populates="user")
    roadmap_subscriptions: Mapped[List["RoadmapSubscription"]] = relationship(
        back_populates="user"
    )


class Like(Base):
    __tablename__ = "likes"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    deck_id: Mapped[int] = mapped_column(ForeignKey("decks.id"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="likes")
    deck: Mapped["Deck"] = relationship(back_populates="likes")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    deck_id: Mapped[int] = mapped_column(ForeignKey("decks.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 stars
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="reviews")
    deck: Mapped["Deck"] = relationship(back_populates="reviews")


class Deck(Base):
    """
    Represents a collection of flashcards.

    Decks are the primary unit of organization and sharing in SyntaxRecall.
    A deck can be public (Marketplace) or private (Personal).
    Supports 'forking' via parent_id to track the lineage of technical knowledge.
    """

    __tablename__ = "decks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("decks.id"), nullable=True
    )

    owner: Mapped["User"] = relationship(
        back_populates="decks", foreign_keys=[owner_id]
    )
    cards: Mapped[List["Card"]] = relationship(
        back_populates="deck", cascade="all, delete-orphan"
    )
    likes: Mapped[List["Like"]] = relationship(
        back_populates="deck", cascade="all, delete-orphan"
    )
    reviews: Mapped[List["Review"]] = relationship(
        back_populates="deck", cascade="all, delete-orphan"
    )
    forks: Mapped[List["Deck"]] = relationship(back_populates="parent")
    parent: Mapped[Optional["Deck"]] = relationship(
        back_populates="forks", remote_side=[id]
    )


class Card(Base):
    """
    The core atomic unit of knowledge.

    Contains code snippets, explanations, and SM-2 metadata for spaced repetition.
    Cards can be linked to Canonical Roadmaps via roadmap_id for progress tracking.
    Uses GIN Trigram indexes on title, explanation, and code for high-performance fuzzy search.
    """

    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    deck_id: Mapped[int] = mapped_column(ForeignKey("decks.id"))
    title: Mapped[str] = mapped_column(
        String(255), nullable=False, server_default="Untitled Card"
    )

    code_snippet: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(50), nullable=False)
    tags: Mapped[list] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"), default=list
    )

    # Roadmap Linking
    roadmap_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    roadmap_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Spaced Repetition (SM-2 Algorithm fields)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    interval: Mapped[int] = mapped_column(Integer, default=0)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)
    next_review: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    deck: Mapped["Deck"] = relationship(back_populates="cards")


# GIN and Trigram Indexes
Index("idx_card_tags_gin", Card.tags, postgresql_using="gin")
Index(
    "idx_card_title_trgm",
    Card.title,
    postgresql_using="gin",
    postgresql_ops={"title": "gin_trgm_ops"},
)
Index(
    "idx_card_explanation_trgm",
    Card.explanation,
    postgresql_using="gin",
    postgresql_ops={"explanation": "gin_trgm_ops"},
)
Index(
    "idx_card_code_snippet_trgm",
    Card.code_snippet,
    postgresql_using="gin",
    postgresql_ops={"code_snippet": "gin_trgm_ops"},
)


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    subscriptions: Mapped[List["RoadmapSubscription"]] = relationship(
        back_populates="roadmap", cascade="all, delete-orphan"
    )


class RoadmapSubscription(Base):
    __tablename__ = "roadmap_subscriptions"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    roadmap_id: Mapped[str] = mapped_column(ForeignKey("roadmaps.id"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="roadmap_subscriptions")
    roadmap: Mapped["Roadmap"] = relationship(back_populates="subscriptions")
