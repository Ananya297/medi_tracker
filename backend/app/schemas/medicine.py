# -----------------------------------------------------------------------------
# Module Imports
# Import typing, datetime, date, and Pydantic v2 validation classes
# -----------------------------------------------------------------------------
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------------------------------------------
# Schema: DiagnosisBase & Response
# Schemas for medical diagnoses (conditions)
# -----------------------------------------------------------------------------
class DiagnosisCreate(BaseModel):
    condition_name: str = Field(..., min_length=2, max_length=150, description="Name of diagnosis or disease")


class DiagnosisResponse(BaseModel):
    id: int
    user_id: int
    condition_name: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Schema: MedicineCreate
# Creation payload supporting either an existing diagnosis_id or direct condition_name
# -----------------------------------------------------------------------------
class MedicineCreate(BaseModel):
    medicine_name: str = Field(..., min_length=1, max_length=150, description="Brand or generic medicine name")
    scheduled_time: str = Field(..., pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$", description="Intake time in 24-hr HH:MM format (e.g. 08:30)")
    condition_name: Optional[str] = Field(None, max_length=150, description="Condition name to auto-create or associate")
    diagnosis_id: Optional[int] = Field(None, description="Existing diagnosis ID to associate")


# -----------------------------------------------------------------------------
# Schema: IntakeToggleRequest
# Payload for toggling or explicitly setting dosage completion state
# -----------------------------------------------------------------------------
class IntakeToggleRequest(BaseModel):
    log_date: Optional[date] = Field(None, description="Target calendar date (defaults to current date)")
    is_taken: Optional[bool] = Field(None, description="Target completion boolean, or None to invert current state")


# -----------------------------------------------------------------------------
# Schema: IntakeLogResponse
# Response representing daily intake state for a single medicine
# -----------------------------------------------------------------------------
class IntakeLogResponse(BaseModel):
    id: int
    medicine_id: int
    log_date: date
    is_taken: bool
    taken_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Schema: MedicineResponse
# Full medicine details including active daily intake status
# -----------------------------------------------------------------------------
class MedicineResponse(BaseModel):
    id: int
    user_id: int
    diagnosis_id: int
    condition_name: str
    medicine_name: str
    scheduled_time: str
    is_active: bool
    created_at: Optional[datetime] = None
    is_taken_today: bool = False
    taken_at: Optional[datetime] = None
    log_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Schema: DiseaseGroupedMedicines
# Grouping structure matching the frontend disease-wise accordion / section list
# -----------------------------------------------------------------------------
class DiseaseGroupedMedicines(BaseModel):
    diagnosis_id: int
    condition_name: str
    medicines: List[MedicineResponse]


# -----------------------------------------------------------------------------
# Schema: DailyScheduleResponse
# Summary response for the today dashboard
# -----------------------------------------------------------------------------
class DailyScheduleResponse(BaseModel):
    date: date
    total_count: int
    taken_count: int
    groups: List[DiseaseGroupedMedicines]
