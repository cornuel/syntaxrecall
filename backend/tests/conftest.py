import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db
from app import models  # Ensure models are loaded

# Single shared test database engine
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def db_engine():
    # Create tables once for the session (or per test if needed, but per test is safer for isolation)
    # Using StaticPool with in-memory sqlite means dropping metadata clears it effectively.
    return engine


@pytest.fixture(scope="function")
def db_session(db_engine):
    # Create tables for each test
    Base.metadata.create_all(bind=db_engine)

    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

    # Drop tables after test
    Base.metadata.drop_all(bind=db_engine)


@pytest.fixture(scope="function", autouse=True)
def override_get_db(db_session):
    def _get_db_override():
        yield db_session

    app.dependency_overrides[get_db] = _get_db_override
    yield
    app.dependency_overrides.clear()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
