from typing import Optional, List, Union, Any
from fastapi_filter.contrib.sqlalchemy import Filter
from sqlalchemy import func, or_, cast, String
from sqlalchemy.dialects.postgresql import JSONB
from pydantic import field_validator
from .models import Card, Deck


class CardFilter(Filter):
    language: Optional[str] = None
    tags__contains: Optional[List[str]] = None
    title__ilike: Optional[str] = None
    explanation__ilike: Optional[str] = None
    search: Optional[str] = None

    @field_validator("tags__contains", mode="before")
    @classmethod
    def split_tags(cls, v: Any) -> Any:
        if isinstance(v, str):
            return [v]
        return v

    def filter(self, query):
        # 1. Handle Fuzzy Search (similarity ranking)
        search_term = self.search
        self.search = (
            None  # Prevent super().filter from trying to find a 'search' column
        )

        dialect = query.session.bind.dialect.name

        if search_term:
            if dialect == "postgresql":
                # For technical search, we combine fuzzy (similarity) with exact substring (ILIKE)
                # ILIKE is essential for symbols like '@app.get' which might fail similarity thresholds
                query = query.filter(
                    or_(
                        Card.title.op("%")(search_term),
                        Card.explanation.op("%")(search_term),
                        Card.code_snippet.op("%")(search_term),
                        Card.title.ilike(f"%{search_term}%"),
                        Card.explanation.ilike(f"%{search_term}%"),
                        Card.code_snippet.ilike(f"%{search_term}%"),
                        cast(Card.tags, String).ilike(f"%{search_term}%"),
                    )
                ).order_by(func.similarity(Card.title, search_term).desc())
            else:
                # Fallback for SQLite/other dialects in tests
                query = query.filter(
                    or_(
                        Card.title.ilike(f"%{search_term}%"),
                        Card.explanation.ilike(f"%{search_term}%"),
                        Card.code_snippet.ilike(f"%{search_term}%"),
                        cast(Card.tags, String).ilike(f"%{search_term}%"),
                    )
                )

        # 2. Handle Tags

        tags = self.tags__contains
        self.tags__contains = None

        query = super().filter(query)

        # Restore fields for potential later use (though usually not needed after filter)
        self.search = search_term
        self.tags__contains = tags

        if tags:
            for tag in tags:
                query = query.filter(cast(Card.tags, String).ilike(f"%{tag}%"))

        return query

    class Constants(Filter.Constants):
        model = Card
        # search_field_name = "search" # Handled manually


class DeckFilter(Filter):
    title__ilike: Optional[str] = None
    is_public: Optional[bool] = None
    owner_id: Optional[int] = None
    search: Optional[str] = None

    def filter(self, query):
        search_term = self.search
        self.search = None

        if search_term:
            query = query.filter(
                or_(
                    Deck.title.ilike(f"%{search_term}%"),
                    Deck.description.ilike(f"%{search_term}%"),
                )
            )

        return super().filter(query)

    class Constants(Filter.Constants):
        model = Deck
        # search_field_name = "search" # Handled manually
