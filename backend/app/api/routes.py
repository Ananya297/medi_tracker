# -----------------------------------------------------------------------------
# Module Imports
# Import FastAPI routing utilities, status codes, dependency injection, and schemas
# -----------------------------------------------------------------------------
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserLoginRequest, UserResponse
from app.schemas.medicine import (
    DiagnosisCreate,
    DiagnosisResponse,
    MedicineCreate,
    MedicineResponse,
    IntakeToggleRequest,
    IntakeLogResponse,
    DailyScheduleResponse
)
from app.crud import (
    get_user_by_id,
    login_or_register_user,
    get_or_create_diagnosis,
    get_diagnoses_by_user,
    create_medicine,
    get_medicines_by_user,
    get_today_schedule,
    toggle_intake_status,
    delete_medicine
)

# -----------------------------------------------------------------------------
# Router Initialization
# Unified router exposing user authentication and medicine management endpoints
# -----------------------------------------------------------------------------
router = APIRouter()


# -----------------------------------------------------------------------------
# Helper Dependency: resolve_user_id
# Extracts user_id from query parameter or custom 'X-User-Id' HTTP header
# -----------------------------------------------------------------------------
def resolve_user_id(
    user_id: Optional[int] = Query(None, description="User ID query parameter"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id", description="User ID request header")
) -> int:
    # -------------------------------------------------------------------------
    # ID Resolution Logic
    # Checks query parameter first, then header fallback
    # -------------------------------------------------------------------------
    if user_id is not None:
        return user_id

    if x_user_id is not None:
        try:
            return int(x_user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-User-Id header must be a valid integer."
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing user identifier. Provide ?user_id= or X-User-Id header."
    )


# -----------------------------------------------------------------------------
# Route: Health Check
# -----------------------------------------------------------------------------
@router.get("/health", tags=["System"])
def health_check():
    # -------------------------------------------------------------------------
    # System Status Payload
    # -------------------------------------------------------------------------
    return {
        "status": "healthy",
        "service": "MedTracker API",
        "timestamp": datetime.utcnow().isoformat()
    }


# -----------------------------------------------------------------------------
# Route: User Login / Onboarding
# POST /auth/login
# -----------------------------------------------------------------------------
@router.post(
    "/auth/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"]
)
def login_or_register(payload: UserLoginRequest, db: Session = Depends(get_db)):
    # -------------------------------------------------------------------------
    # Authentication Query
    # Upserts user based on phone_number; registers automatically if new
    # -------------------------------------------------------------------------
    user = login_or_register_user(db, payload)
    return user


# -----------------------------------------------------------------------------
# Route: User Profile
# GET /auth/me
# -----------------------------------------------------------------------------
@router.get(
    "/auth/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"]
)
def get_current_user_profile(
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------------------
    # Profile Lookup
    # -------------------------------------------------------------------------
    user = get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )
    return user


# -----------------------------------------------------------------------------
# Route: Get User Diagnoses / Conditions
# GET /medicines/diagnoses
# -----------------------------------------------------------------------------
@router.get(
    "/medicines/diagnoses",
    response_model=List[DiagnosisResponse],
    status_code=status.HTTP_200_OK,
    tags=["Diagnoses"]
)
def list_diagnoses(
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------------------
    # Query: Fetch Diagnoses
    # -------------------------------------------------------------------------
    return get_diagnoses_by_user(db, user_id=user_id)


# -----------------------------------------------------------------------------
# Route: Add Diagnosis / Condition
# POST /medicines/diagnoses
# -----------------------------------------------------------------------------
@router.post(
    "/medicines/diagnoses",
    response_model=DiagnosisResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Diagnoses"]
)
def create_diagnosis_endpoint(
    payload: DiagnosisCreate,
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------------------
    # Diagnosis Persistence
    # -------------------------------------------------------------------------
    diagnosis = get_or_create_diagnosis(db, user_id=user_id, condition_name=payload.condition_name)
    return diagnosis


# -----------------------------------------------------------------------------
# Route: Daily Medicines Dashboard (Disease-Grouped)
# GET /medicines/today
# -----------------------------------------------------------------------------
@router.get(
    "/medicines/today",
    response_model=DailyScheduleResponse,
    status_code=status.HTTP_200_OK,
    tags=["Medicines"]
)
def get_daily_medicines(
    target_date: Optional[date] = Query(None, description="Optional target date in YYYY-MM-DD format"),
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------------------
    # Query: Fetch Daily Grouped Schedule
    # -------------------------------------------------------------------------
    schedule = get_today_schedule(db, user_id=user_id, target_date=target_date)
    return schedule


# -----------------------------------------------------------------------------
# Route: List All User Medicines
# GET /medicines
# -----------------------------------------------------------------------------
@router.get(
    "/medicines",
    response_model=List[MedicineResponse],
    status_code=status.HTTP_200_OK,
    tags=["Medicines"]
)
def list_all_medicines(
    active_only: bool = Query(True, description="Filter for active medications"),
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------------------
    # Query: Fetch User Medications
    # -------------------------------------------------------------------------
    raw_meds = get_medicines_by_user(db, user_id=user_id, active_only=active_only)
    
    # Format to response schema
    results = []
    for med in raw_meds:
        results.append(
            MedicineResponse(
                id=med.id,
                user_id=med.user_id,
                diagnosis_id=med.diagnosis_id,
                condition_name=med.diagnosis.condition_name if med.diagnosis else "General Health",
                medicine_name=med.medicine_name,
                scheduled_time=med.scheduled_time,
                is_active=med.is_active,
                created_at=med.created_at,
                is_taken_today=False
            )
        )
    return results


# -----------------------------------------------------------------------------
# Route: Add New Medicine
# POST /medicines
# -----------------------------------------------------------------------------
@router.post(
    "/medicines",
    response_model=MedicineResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Medicines"]
)
def add_medicine(
    payload: MedicineCreate,
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------------------
    # Persistence: Create Medication
    # -------------------------------------------------------------------------
    new_med = create_medicine(db, user_id=user_id, med_data=payload)

    return MedicineResponse(
        id=new_med.id,
        user_id=new_med.user_id,
        diagnosis_id=new_med.diagnosis_id,
        condition_name=new_med.diagnosis.condition_name if new_med.diagnosis else "General Health",
        medicine_name=new_med.medicine_name,
        scheduled_time=new_med.scheduled_time,
        is_active=new_med.is_active,
        created_at=new_med.created_at,
        is_taken_today=False
    )


# -----------------------------------------------------------------------------
# Route: Toggle Dosage Checkbox
# POST /medicines/{medicine_id}/toggle
# -----------------------------------------------------------------------------
@router.post(
    "/medicines/{medicine_id}/toggle",
    response_model=IntakeLogResponse,
    status_code=status.HTTP_200_OK,
    tags=["Medicines"]
)
def toggle_medicine_intake(
    medicine_id: int,
    payload: Optional[IntakeToggleRequest] = None,
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------------------
    # Toggle Checkbox State
    # -------------------------------------------------------------------------
    target_date = payload.log_date if payload and payload.log_date else None
    force_val = payload.is_taken if payload else None

    try:
        log = toggle_intake_status(
            db=db,
            medicine_id=medicine_id,
            user_id=user_id,
            target_date=target_date,
            force_is_taken=force_val
        )
        return log
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )


# -----------------------------------------------------------------------------
# Route: Delete Medicine
# DELETE /medicines/{medicine_id}
# -----------------------------------------------------------------------------
@router.delete(
    "/medicines/{medicine_id}",
    status_code=status.HTTP_200_OK,
    tags=["Medicines"]
)
def delete_medicine_endpoint(
    medicine_id: int,
    user_id: int = Depends(resolve_user_id),
    db: Session = Depends(get_db)
):
    # -------------------------------------------------------------------------
    # Deletion: Remove Medicine
    # -------------------------------------------------------------------------
    deleted = delete_medicine(db, medicine_id=medicine_id, user_id=user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicine with ID {medicine_id} not found."
        )
    return {"status": "success", "message": f"Medicine {medicine_id} deleted successfully."}
