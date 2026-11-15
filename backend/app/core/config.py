# -----------------------------------------------------------------------------
# Module Imports
# Import os, typing, and pydantic settings / dotenv for environment management
# -----------------------------------------------------------------------------
import os
from typing import List
from dotenv import load_dotenv

# -----------------------------------------------------------------------------
# Environment Initialization
# Explicitly load .env file from the current and parent backend directory
# -----------------------------------------------------------------------------
load_dotenv()


# -----------------------------------------------------------------------------
# Class: Settings
# Encapsulates application configuration, database connection strings, and CORS
# -----------------------------------------------------------------------------
class Settings:
    PROJECT_NAME: str = "MedTracker API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Raw Database URL from environment variable
    RAW_DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./medtracker.db"
    )

    # -------------------------------------------------------------------------
    # Property: DATABASE_URL
    # Normalizes database scheme for SQLAlchemy. If a raw 'postgresql://' or
    # legacy 'postgres://' is provided without an explicit driver, this maps it
    # to 'postgresql+psycopg2://' ensuring full compatibility with psycopg2-binary
    # while allowing modern psycopg (v3) if explicitly configured.
    # -------------------------------------------------------------------------
    @property
    def DATABASE_URL(self) -> str:
        url = self.RAW_DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            return url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url

    # -------------------------------------------------------------------------
    # Configuration: Allowed CORS Origins
    # Permits Android Capacitor webview (capacitor://, http://localhost), Vite dev
    # server (http://localhost:5173), and wildcard in development environments.
    # -------------------------------------------------------------------------
    CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:3000",
        "capacitor://localhost",
        "http://localhost:8080"
    ]


# -----------------------------------------------------------------------------
# Settings Singleton Instance
# Global instance used across backend modules
# -----------------------------------------------------------------------------
settings = Settings()
