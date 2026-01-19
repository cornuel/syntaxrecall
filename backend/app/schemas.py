from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: Optional[str] = None
    github_id: Optional[str] = None


class UserResponse(UserBase):
    id: int
    github_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class GitHubExchangeRequest(BaseModel):
    email: EmailStr
    github_id: str
    username: str
    avatar_url: Optional[str] = None
    shared_secret: str


class Token(BaseModel):
    access_token: str
    token_type: str


# Card Schemas
class CardBase(BaseModel):
    title: str = "Untitled Card"
    code_snippet: str
    explanation: str
    language: str
    tags: List[str] = []


class CardCreate(CardBase):
    deck_id: int


class CardUpdate(BaseModel):
    title: Optional[str] = None
    code_snippet: Optional[str] = None
    explanation: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None


class CardResponse(CardBase):
    id: int
    deck_id: int
    ease_factor: float
    interval: int
    repetitions: int
    next_review: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Deck Schemas
class DeckBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_public: bool = False


class DeckCreate(DeckBase):
    pass


class DeckUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None


class DeckResponse(DeckBase):
    id: int
    owner_id: int
    owner_username: Optional[str] = None
    likes_count: int = 0
    forks_count: int = 0
    rating_avg: float = 0.0
    rating_count: int = 0
    parent_id: Optional[int] = None
    cards: List[CardResponse] = []

    model_config = ConfigDict(from_attributes=True)


# AI Generation Schemas
class AIPromptRequest(BaseModel):
    prompt: str


class AIProjectResponse(BaseModel):
    title: str = "AI Generated Card"
    code_snippet: str
    explanation: str
    language: str
    tags: List[str]


# Spaced Repetition Review
class CardReview(BaseModel):
    rating: int = Field(..., ge=0, le=5)  # SM-2 uses 0-5


# Community Review/Rating Schemas
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    deck_id: int
    username: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Roadmap Schemas
class RoadmapBase(BaseModel):
    id: str
    title: str
    version: str
    description: Optional[str] = None
    content: dict


class RoadmapResponse(RoadmapBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoadmapSubscriptionResponse(BaseModel):
    user_id: int
    roadmap_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NodeMastery(BaseModel):
    node_id: str
    mastery_percentage: float
    total_cards: int
    mastered_cards: int
