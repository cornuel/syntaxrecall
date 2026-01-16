from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..sm2 import calculate_sm2
from .auth import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.CardResponse)
def create_card(
    card: schemas.CardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verify deck ownership
    db_deck = (
        db.query(models.Deck)
        .filter(models.Deck.id == card.deck_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if not db_deck:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db_card = models.Card(**card.model_dump())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


@router.get("/{card_id}", response_model=schemas.CardResponse)
def read_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_card = (
        db.query(models.Card)
        .join(models.Deck)
        .filter(models.Card.id == card_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return db_card


@router.put("/{card_id}", response_model=schemas.CardResponse)
def update_card(
    card_id: int,
    card: schemas.CardUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_card = (
        db.query(models.Card)
        .join(models.Deck)
        .filter(models.Card.id == card_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")

    card_data = card.model_dump(exclude_unset=True)
    for key, value in card_data.items():
        setattr(db_card, key, value)

    db.commit()
    db.refresh(db_card)
    return db_card


@router.delete("/{card_id}")
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_card = (
        db.query(models.Card)
        .join(models.Deck)
        .filter(models.Card.id == card_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")

    db.delete(db_card)
    db.commit()
    return {"message": "Card deleted successfully"}


@router.post("/{card_id}/review", response_model=schemas.CardResponse)
def review_card(
    card_id: int,
    review: schemas.CardReview,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_card = (
        db.query(models.Card)
        .join(models.Deck)
        .filter(models.Card.id == card_id, models.Deck.owner_id == current_user.id)
        .first()
    )
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")

    new_reps, new_interval, new_ease, next_review = calculate_sm2(
        quality=review.rating,
        repetitions=db_card.repetitions,
        previous_interval=db_card.interval,
        previous_ease_factor=db_card.ease_factor,
    )

    db_card.repetitions = new_reps
    db_card.interval = new_interval
    db_card.ease_factor = new_ease
    db_card.next_review = next_review

    db.commit()
    db.refresh(db_card)
    return db_card
