from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ..database import get_db, settings
from .. import models, schemas

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Generates a JWT access token for a user.

    Args:
        data: Dictionary containing the 'sub' claim (user email).
        expires_delta: Optional expiration override.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """
    Dependency used to protect routes. Validates the JWT and returns the current user.

    Args:
        token: Bearer token from the Authorization header.
        db: Database session.

    Returns:
        The authenticated User model.

    Raises:
        HTTPException: 401 if token is invalid or user doesn't exist.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM]
        )
        email_val = payload.get("sub")
        if email_val is None or not isinstance(email_val, str):
            raise credentials_exception
        email: str = email_val
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/github-exchange", response_model=schemas.Token)
def github_exchange(
    request: schemas.GitHubExchangeRequest, db: Session = Depends(get_db)
):
    """
    Exchanges a verified GitHub profile for a system-level JWT.
    Trusts the request based on a shared INTERNAL_AUTH_SECRET.

    Args:
        request: Profile data from NextAuth.
        db: Database session.

    Returns:
        Access token and token type.
    """
    # Verify shared secret
    if request.shared_secret != settings.INTERNAL_AUTH_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal auth secret",
        )

    # Check if user exists
    user = db.query(models.User).filter(models.User.email == request.email).first()

    if not user:
        # Create new user
        user = models.User(
            email=request.email,
            github_id=request.github_id,
            username=request.username,
            avatar_url=request.avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user info
        user.github_id = request.github_id
        user.username = request.username
        user.avatar_url = request.avatar_url
        db.commit()
        db.refresh(user)

    # Generate JWT
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
