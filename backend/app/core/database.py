# -----------------------------------------------------------------------------
# Module Imports
# Import SQLAlchemy engine creation, session management, and Base class
# -----------------------------------------------------------------------------
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.core.config import settings

# -----------------------------------------------------------------------------
# Database Engine Initialization
# Configured specifically for Neon Serverless PostgreSQL:
# - pool_pre_ping=True tests live connection health before queries to prevent dropped sockets.
# - pool_recycle=300 recycles connections after 5 minutes to gracefully handle Neon compute autoscaling.
# -----------------------------------------------------------------------------
connect_args = {}
# SQLite specific argument if fallback is used
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5 if not settings.DATABASE_URL.startswith("sqlite") else None,
    max_overflow=10 if not settings.DATABASE_URL.startswith("sqlite") else None
)

# -----------------------------------------------------------------------------
# Database Session Factory
# Generates contextual SQLAlchemy database sessions
# -----------------------------------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# -----------------------------------------------------------------------------
# Declarative Base Class
# Base class for all ORM entities in the application
# -----------------------------------------------------------------------------
Base = declarative_base()


# -----------------------------------------------------------------------------
# Dependency: get_db
# FastAPI dependency to yield a database session per request and cleanly close it
# -----------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
