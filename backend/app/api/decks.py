from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi_filter import FilterDepends
from ..database import get_db
from .. import models, schemas, filters
from .auth import get_current_user

router = APIRouter()


def _prepare_deck_response(deck: models.Deck) -> schemas.DeckResponse:
    """Helper to populate DeckResponse fields from a Deck model."""
    response = schemas.DeckResponse.model_validate(deck)
    response.owner_username = deck.owner.username
    response.likes_count = len(deck.likes)
    response.forks_count = len(deck.forks)

    # Calculate ratings
    if deck.reviews:
        response.rating_avg = sum(r.rating for r in deck.reviews) / len(deck.reviews)
        response.rating_count = len(deck.reviews)
    else:
        response.rating_avg = 0.0
        response.rating_count = 0

    return response


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
    return _prepare_deck_response(db_deck)


@router.get("/", response_model=List[schemas.DeckResponse])
def read_decks(
    deck_filter: filters.DeckFilter = FilterDepends(filters.DeckFilter),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Fetch personal decks for the current user."""
    query = db.query(models.Deck).filter(models.Deck.owner_id == current_user.id)

    query = deck_filter.filter(query)
    decks = query.offset(skip).limit(limit).all()
    return [_prepare_deck_response(d) for d in decks]


@router.get("/marketplace", response_model=List[schemas.DeckResponse])
def read_marketplace(
    deck_filter: filters.DeckFilter = FilterDepends(filters.DeckFilter),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Fetch all public decks in the marketplace."""
    query = db.query(models.Deck).filter(models.Deck.is_public == True)
    query = deck_filter.filter(query)
    decks = query.offset(skip).limit(limit).all()
    return [_prepare_deck_response(d) for d in decks]


@router.get("/{deck_id}", response_model=schemas.DeckResponse)
def read_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if db_deck is None:
        raise HTTPException(status_code=404, detail="Deck not found")

    if not db_deck.is_public and db_deck.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return _prepare_deck_response(db_deck)


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
    return _prepare_deck_response(db_deck)


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
    card_filter: filters.CardFilter = FilterDepends(filters.CardFilter),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Fetch all cards in a specific deck."""
    db_deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if db_deck is None:
        raise HTTPException(status_code=404, detail="Deck not found")

    if not db_deck.is_public and db_deck.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    query = db.query(models.Card).filter(models.Card.deck_id == deck_id)
    query = card_filter.filter(query)
    return query.all()


@router.post("/{deck_id}/fork", response_model=schemas.DeckResponse)
def fork_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    source_deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not source_deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    if not source_deck.is_public and source_deck.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot fork private deck")

    new_deck = models.Deck(
        title=source_deck.title,
        description=source_deck.description,
        is_public=False,
        owner_id=current_user.id,
        parent_id=source_deck.id,
    )
    db.add(new_deck)
    db.flush()

    for card in source_deck.cards:
        new_card = models.Card(
            deck_id=new_deck.id,
            title=card.title,
            code_snippet=card.code_snippet,
            explanation=card.explanation,
            language=card.language,
            tags=card.tags,
            ease_factor=2.5,
            interval=0,
            repetitions=0,
        )
        db.add(new_card)

    db.commit()
    db.refresh(new_deck)
    return _prepare_deck_response(new_deck)


@router.post("/{deck_id}/like")
def like_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not db_deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    if not db_deck.is_public and db_deck.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot like private deck")

    existing_like = (
        db.query(models.Like)
        .filter(models.Like.user_id == current_user.id, models.Like.deck_id == deck_id)
        .first()
    )

    if existing_like:
        db.delete(existing_like)
        message = "Deck unliked"
    else:
        new_like = models.Like(user_id=current_user.id, deck_id=deck_id)
        db.add(new_like)
        message = "Deck liked"

    db.commit()
    return {"message": message}


@router.post("/{deck_id}/reviews", response_model=schemas.ReviewResponse)
def create_review(
    deck_id: int,
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not db_deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    if not db_deck.is_public and db_deck.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot review private deck")

    existing_review = (
        db.query(models.Review)
        .filter(
            models.Review.user_id == current_user.id, models.Review.deck_id == deck_id
        )
        .first()
    )

    if existing_review:
        existing_review.rating = review.rating
        existing_review.comment = review.comment
        db.commit()
        db.refresh(existing_review)
        db_review = existing_review
    else:
        db_review = models.Review(
            **review.model_dump(), user_id=current_user.id, deck_id=deck_id
        )
        db.add(db_review)
        db.commit()
        db.refresh(db_review)

    response = schemas.ReviewResponse.model_validate(db_review)
    response.username = current_user.username
    return response


@router.get("/{deck_id}/reviews", response_model=List[schemas.ReviewResponse])
def read_reviews(
    deck_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not db_deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if not db_deck.is_public and db_deck.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    reviews = (
        db.query(models.Review)
        .filter(models.Review.deck_id == deck_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for r in reviews:
        res = schemas.ReviewResponse.model_validate(r)
        res.username = r.user.username
        result.append(res)
    return result
