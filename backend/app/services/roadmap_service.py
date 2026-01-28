import json
import os
from sqlalchemy.orm import Session
from .. import models, schemas


def ingest_roadmaps(db: Session):
    # This assumes we are in the 'backend' directory
    roadmap_dir = "app/data/roadmaps"

    if not os.path.exists(roadmap_dir):
        print(f"Roadmap directory {roadmap_dir} not found.")
        return

    for filename in os.listdir(roadmap_dir):
        if filename.endswith(".json") and filename != "schema.json":
            filepath = os.path.join(roadmap_dir, filename)
            with open(filepath, "r") as f:
                data = json.load(f)

                roadmap_id = data["id"]
                db_roadmap = (
                    db.query(models.Roadmap)
                    .filter(models.Roadmap.id == roadmap_id)
                    .first()
                )

                if db_roadmap:
                    db_roadmap.title = data["title"]
                    db_roadmap.version = data["version"]
                    db_roadmap.description = data.get("description")
                    db_roadmap.content = data
                else:
                    db_roadmap = models.Roadmap(
                        id=roadmap_id,
                        title=data["title"],
                        version=data["version"],
                        description=data.get("description"),
                        content=data,
                    )
                    db.add(db_roadmap)
    db.commit()


def get_node_mastery(db: Session, user_id: int, roadmap_id: str):
    roadmap = db.query(models.Roadmap).filter(models.Roadmap.id == roadmap_id).first()
    if not roadmap:
        return None

    # Fetch all user cards
    user_cards = (
        db.query(models.Card)
        .join(models.Deck)
        .filter(models.Deck.owner_id == user_id)
        .all()
    )

    results = []

    def traverse(node):
        node_id = node["id"]
        node_tags = set(node.get("tags", []))

        # A card matches if it has ALL the tags of the node
        matching_cards = [c for c in user_cards if node_tags.issubset(set(c.tags))]

        total = len(matching_cards)
        mastered = len([c for c in matching_cards if c.interval >= 21])

        percentage = (mastered / total * 100) if total > 0 else 0

        results.append(
            schemas.NodeMastery(
                node_id=node_id,
                mastery_percentage=percentage,
                total_cards=total,
                mastered_cards=mastered,
            )
        )

        for child in node.get("children", []):
            traverse(child)

    traverse(roadmap.content["root"])
    return results


def subscribe_user(
    db: Session, user_id: int, roadmap_id: str, include_default_cards: bool = False
):
    subscription = (
        db.query(models.RoadmapSubscription)
        .filter(
            models.RoadmapSubscription.user_id == user_id,
            models.RoadmapSubscription.roadmap_id == roadmap_id,
        )
        .first()
    )

    if not subscription:
        subscription = models.RoadmapSubscription(
            user_id=user_id, roadmap_id=roadmap_id
        )
        db.add(subscription)

        if include_default_cards:
            # Find public cards associated with this roadmap owned by admin
            admin_user = (
                db.query(models.User)
                .filter(models.User.email == "admin@example.com")
                .first()
            )

            if admin_user:
                canonical_cards = (
                    db.query(models.Card)
                    .join(models.Deck)
                    .filter(
                        models.Card.roadmap_id == roadmap_id,
                        models.Deck.owner_id == admin_user.id,
                    )
                    .all()
                )

                if canonical_cards:
                    roadmap_obj = (
                        db.query(models.Roadmap)
                        .filter(models.Roadmap.id == roadmap_id)
                        .first()
                    )
                    deck_title = (
                        f"Starter: {roadmap_obj.title if roadmap_obj else roadmap_id}"
                    )

                    # Create a new deck for the user
                    new_deck = models.Deck(
                        title=deck_title,
                        description=f"Starter cards for the {roadmap_id} roadmap.",
                        owner_id=user_id,
                        is_public=False,
                    )
                    db.add(new_deck)
                    db.flush()  # Get new_deck.id

                    for card in canonical_cards:
                        new_card = models.Card(
                            deck_id=new_deck.id,
                            title=card.title,
                            code_snippet=card.code_snippet,
                            explanation=card.explanation,
                            language=card.language,
                            tags=card.tags,
                            roadmap_id=card.roadmap_id,
                            roadmap_title=card.roadmap_title,
                        )
                        db.add(new_card)

        db.commit()
        db.refresh(subscription)

    return subscription


def unsubscribe_user(db: Session, user_id: int, roadmap_id: str):
    subscription = (
        db.query(models.RoadmapSubscription)
        .filter(
            models.RoadmapSubscription.user_id == user_id,
            models.RoadmapSubscription.roadmap_id == roadmap_id,
        )
        .first()
    )

    if subscription:
        db.delete(subscription)
        db.commit()
        return True
    return False
