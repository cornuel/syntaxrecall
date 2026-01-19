from app.database import SessionLocal
from app.services.roadmap_service import ingest_roadmaps


def main():
    db = SessionLocal()
    try:
        print("Starting roadmap ingestion...")
        ingest_roadmaps(db)
        print("Roadmap ingestion completed.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
