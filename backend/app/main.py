# -----------------------------------------------------------------------------
# Module Imports
# Import contextlib lifespan, FastAPI core, CORS middleware, and application routes
# -----------------------------------------------------------------------------
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models.entities  # Ensures all ORM models are registered with Base.metadata
from app.api.routes import router


# -----------------------------------------------------------------------------
# Lifespan Context Manager
# Automatically verifies/creates database tables upon startup
# -----------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # -------------------------------------------------------------------------
    # Database Initialization on Startup
    # Creates tables in Neon Serverless Postgres if they do not yet exist
    # -------------------------------------------------------------------------
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup logic (if any) when server shuts down


# -----------------------------------------------------------------------------
# FastAPI Application Instance
# Configures title, version, and lifespan management
# -----------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-ready FastAPI backend for Everyday Medicine Tracker Android application",
    lifespan=lifespan
)


# -----------------------------------------------------------------------------
# Middleware: Cross-Origin Resource Sharing (CORS)
# Permissive configuration allowing Capacitor Android apps and Vite dev servers
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Capacitor webview and local dev hosts
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Router Registration: Contract Alignment
# Exposes routes both at direct root (/auth/login, /medicines/today)
# and under versioned prefixes (/api/v1/auth/login, /api/auth/login)
# ensuring total frontend flexibility regardless of environment base URL.
# -----------------------------------------------------------------------------
app.include_router(router)
app.include_router(router, prefix="/api/v1")
app.include_router(router, prefix="/api")


# -----------------------------------------------------------------------------
# Root Endpoint
# Health and index redirection
# -----------------------------------------------------------------------------
@app.get("/", tags=["System"])
def root_index():
    return {
        "message": "Welcome to MedTracker Backend API",
        "docs_url": "/docs",
        "version": settings.VERSION,
        "status": "operational"
    }
