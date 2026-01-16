from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from .auth import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.DeckResponse)
def create_deck(
    deck: schemas.DeckCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = models.Deck(**deck.model_dump(), owner_id=current_user.id)
    db.add(db_deck)
    db.commit()
    db.refresh(db_deck)
    return db_deck


@router.get("/", response_model=List[schemas.DeckResponse])
def read_decks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    decks = (
        db.query(models.Deck)
        .filter(models.Deck.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return decks


@router.get("/{deck_id}", response_model=schemas.DeckResponse)
def read_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = (
        db.query(models.Deck)
        .filter(models.Deck.id == deck_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if db_deck is None:
        raise HTTPException(status_code=404, detail="Deck not found")
    return db_deck


@router.put("/{deck_id}", response_model=schemas.DeckResponse)
def update_deck(
    deck_id: int,
    deck: schemas.DeckUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = (
        db.query(models.Deck)
        .filter(models.Deck.id == deck_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if db_deck is None:
        raise HTTPException(status_code=404, detail="Deck not found")

    deck_data = deck.model_dump(exclude_unset=True)
    for key, value in deck_data.items():
        setattr(db_deck, key, value)

    db.commit()
    db.refresh(db_deck)
    return db_deck


@router.delete("/{deck_id}")
def delete_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = (
        db.query(models.Deck)
        .filter(models.Deck.id == deck_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if db_deck is None:
        raise HTTPException(status_code=404, detail="Deck not found")

    db.delete(db_deck)
    db.commit()
    return {"message": "Deck deleted successfully"}


@router.get("/{deck_id}/cards", response_model=List[schemas.CardResponse])
def read_deck_cards(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = (
        db.query(models.Deck)
        .filter(models.Deck.id == deck_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if db_deck is None:
        raise HTTPException(status_code=404, detail="Deck not found")
    return db_deck.cards
