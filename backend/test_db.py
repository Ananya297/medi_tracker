# -----------------------------------------------------------------------------
# Module Imports
# Import SQLAlchemy utilities, database engine/base, and ORM models
# -----------------------------------------------------------------------------
from sqlalchemy import text, inspect
from database import engine, Base
import models


# -----------------------------------------------------------------------------
# Function: init_and_verify
# Creates all database tables defined in models.py and verifies Neon connectivity
# -----------------------------------------------------------------------------
def init_and_verify():
    print("Connecting to Neon PostgreSQL...")
    
    # Create tables defined in models.py if they do not exist
    Base.metadata.create_all(bind=engine)
    
    # Establish a connection and verify query execution
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print("Connected! Database version:", result.fetchone()[0])

    # Inspect and print created tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Verified Database Tables:", tables)


# -----------------------------------------------------------------------------
# Script Entry Point
# Executes initialization and verification when run directly
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    init_and_verify()
