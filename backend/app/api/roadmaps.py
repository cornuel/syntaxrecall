from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..services import roadmap_service
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[schemas.RoadmapResponse])
def list_roadmaps(
    db: Session = Depends(get_db)
):
    """List all available canonical roadmaps."""
    return db.query(models.Roadmap).all()


@router.get("/subscriptions", response_model=List[schemas.RoadmapResponse])
def get_user_subscriptions(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    """Get roadmaps the current user is subscribed to."""
    return [sub.roadmap for sub in current_user.roadmap_subscriptions]


@router.get("/{roadmap_id}", response_model=schemas.RoadmapResponse)
def get_roadmap(
    roadmap_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific roadmap and its full structure."""
    roadmap = db.query(models.Roadmap).filter(models.Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.post(
    "/{roadmap_id}/subscribe", response_model=schemas.RoadmapSubscriptionResponse
)
def subscribe(
    roadmap_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Subscribe the current user to a roadmap."""
    roadmap = db.query(models.Roadmap).filter(models.Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap_service.subscribe_user(db, current_user.id, roadmap_id)


@router.get("/{roadmap_id}/mastery", response_model=List[schemas.NodeMastery])
def get_mastery(
    roadmap_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Calculate the user's mastery for each node in a roadmap based on their cards' SM-2 stats."""
    mastery = roadmap_service.get_node_mastery(db, current_user.id, roadmap_id)
    if mastery is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return mastery
