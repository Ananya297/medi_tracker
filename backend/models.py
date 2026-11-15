# -----------------------------------------------------------------------------
# Root Models Module (Backward Compatibility Alias)
# Imports and re-exports ORM entities from app.models.entities
# -----------------------------------------------------------------------------
from app.models.entities import User, Diagnosis, Medicine, IntakeLog, Base

__all__ = ["User", "Diagnosis", "Medicine", "IntakeLog", "Base"]
