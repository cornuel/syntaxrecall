from datetime import datetime
from typing import List, Optional
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
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


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


class Like(Base):
    __tablename__ = "likes"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    deck_id: Mapped[int] = mapped_column(ForeignKey("decks.id"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="likes")
    deck: Mapped["Deck"] = relationship(back_populates="likes")


class Deck(Base):
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
    forks: Mapped[List["Deck"]] = relationship(back_populates="parent")
    parent: Mapped[Optional["Deck"]] = relationship(
        back_populates="forks", remote_side=[id]
    )


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    deck_id: Mapped[int] = mapped_column(ForeignKey("decks.id"))

    code_snippet: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(50), nullable=False)
    tags: Mapped[list] = mapped_column(JSON, default=list)

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
