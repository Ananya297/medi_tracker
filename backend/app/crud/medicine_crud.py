# -----------------------------------------------------------------------------
# Module Imports
# Import dates, typing, SQLAlchemy Session, functions, and ORM entities/schemas
# -----------------------------------------------------------------------------
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.models.entities import Diagnosis, Medicine, IntakeLog
from app.schemas.medicine import (
    MedicineCreate,
    MedicineResponse,
    DiseaseGroupedMedicines,
    DailyScheduleResponse
)


# -----------------------------------------------------------------------------
# Function: get_or_create_diagnosis
# Finds existing diagnosis for user or creates a new one
# -----------------------------------------------------------------------------
def get_or_create_diagnosis(db: Session, user_id: int, condition_name: str) -> Diagnosis:
    normalized_name = condition_name.strip()

    # Query for existing diagnosis matching user and normalized name
    diagnosis = db.query(Diagnosis).filter(
        Diagnosis.user_id == user_id,
        func.lower(Diagnosis.condition_name) == normalized_name.lower()
    ).first()

    if not diagnosis:
        # Create and persist new diagnosis
        diagnosis = Diagnosis(
            user_id=user_id,
            condition_name=normalized_name
        )
        db.add(diagnosis)
        db.commit()
        db.refresh(diagnosis)

    return diagnosis


# -----------------------------------------------------------------------------
# Function: get_diagnoses_by_user
# Fetches all unique diagnosed conditions registered for a user
# -----------------------------------------------------------------------------
def get_diagnoses_by_user(db: Session, user_id: int) -> List[Diagnosis]:
    return db.query(Diagnosis).filter(
        Diagnosis.user_id == user_id
    ).order_by(Diagnosis.condition_name.asc()).all()


# -----------------------------------------------------------------------------
# Function: create_medicine
# Creates a new medicine entry, associating with diagnosis_id or creating condition
# -----------------------------------------------------------------------------
def create_medicine(db: Session, user_id: int, med_data: MedicineCreate) -> Medicine:
    # -------------------------------------------------------------------------
    # Diagnosis Association
    # Determine target diagnosis either from provided diagnosis_id or condition_name
    # -------------------------------------------------------------------------
    diag_id = med_data.diagnosis_id

    if not diag_id:
        target_condition = med_data.condition_name if med_data.condition_name else "General Health"
        diagnosis = get_or_create_diagnosis(db, user_id=user_id, condition_name=target_condition)
        diag_id = diagnosis.id
    else:
        # Verify diagnosis exists and belongs to user
        diag = db.query(Diagnosis).filter(Diagnosis.id == diag_id, Diagnosis.user_id == user_id).first()
        if not diag:
            target_condition = med_data.condition_name if med_data.condition_name else "General Health"
            diagnosis = get_or_create_diagnosis(db, user_id=user_id, condition_name=target_condition)
            diag_id = diagnosis.id

    # -------------------------------------------------------------------------
    # Insert Medicine Record
    # Create and commit new medication
    # -------------------------------------------------------------------------
    new_medicine = Medicine(
        user_id=user_id,
        diagnosis_id=diag_id,
        medicine_name=med_data.medicine_name.strip(),
        scheduled_time=med_data.scheduled_time.strip(),
        is_active=True
    )

    db.add(new_medicine)
    db.commit()
    db.refresh(new_medicine)
    return new_medicine


# -----------------------------------------------------------------------------
# Function: get_medicines_by_user
# Retrieves all medicines registered by a user, optionally filtering by active state
# -----------------------------------------------------------------------------
def get_medicines_by_user(db: Session, user_id: int, active_only: bool = True) -> List[Medicine]:
    query = db.query(Medicine).filter(Medicine.user_id == user_id)
    if active_only:
        query = query.filter(Medicine.is_active == True)
    return query.order_by(Medicine.scheduled_time.asc()).all()


# -----------------------------------------------------------------------------
# Function: get_today_schedule
# Builds the comprehensive daily medicine tracker view, joining intake logs
# and grouping medicines under their diagnosed conditions
# -----------------------------------------------------------------------------
def get_today_schedule(db: Session, user_id: int, target_date: Optional[date] = None) -> DailyScheduleResponse:
    if target_date is None:
        target_date = date.today()

    # -------------------------------------------------------------------------
    # Query: Fetch Active Medicines and Daily Logs
    # Perform outer join with intake_logs for the specific target date
    # -------------------------------------------------------------------------
    medicines = db.query(Medicine).filter(
        Medicine.user_id == user_id,
        Medicine.is_active == True
    ).order_by(Medicine.scheduled_time.asc()).all()

    # Pre-fetch intake logs for today for these medicines
    med_ids = [m.id for m in medicines]
    logs = {}
    if med_ids:
        raw_logs = db.query(IntakeLog).filter(
            IntakeLog.medicine_id.in_(med_ids),
            IntakeLog.log_date == target_date
        ).all()
        for log in raw_logs:
            logs[log.medicine_id] = log

    # -------------------------------------------------------------------------
    # Grouping: Group Medicines by Condition Name
    # Group active medications under their respective diagnoses
    # -------------------------------------------------------------------------
    groups_dict = {}
    total_count = len(medicines)
    taken_count = 0

    for med in medicines:
        log = logs.get(med.id)
        is_taken = bool(log and log.is_taken)
        taken_at = log.taken_at if log else None
        log_id = log.id if log else None

        if is_taken:
            taken_count += 1

        condition_name = med.diagnosis.condition_name if med.diagnosis else "General Health"
        diag_id = med.diagnosis_id

        res_item = MedicineResponse(
            id=med.id,
            user_id=med.user_id,
            diagnosis_id=diag_id,
            condition_name=condition_name,
            medicine_name=med.medicine_name,
            scheduled_time=med.scheduled_time,
            is_active=med.is_active,
            created_at=med.created_at,
            is_taken_today=is_taken,
            taken_at=taken_at,
            log_id=log_id
        )

        if diag_id not in groups_dict:
            groups_dict[diag_id] = {
                "diagnosis_id": diag_id,
                "condition_name": condition_name,
                "medicines": []
            }
        groups_dict[diag_id]["medicines"].append(res_item)

    # -------------------------------------------------------------------------
    # Assemble Structured Response
    # Format grouped entries into DiseaseGroupedMedicines models
    # -------------------------------------------------------------------------
    groups_list = [
        DiseaseGroupedMedicines(
            diagnosis_id=g["diagnosis_id"],
            condition_name=g["condition_name"],
            medicines=g["medicines"]
        )
        for g in groups_dict.values()
    ]

    return DailyScheduleResponse(
        date=target_date,
        total_count=total_count,
        taken_count=taken_count,
        groups=groups_list
    )


# -----------------------------------------------------------------------------
# Function: toggle_intake_status
# Flips the checkbox state (is_taken) for a medicine on a given calendar day
# -----------------------------------------------------------------------------
def toggle_intake_status(
    db: Session,
    medicine_id: int,
    user_id: int,
    target_date: Optional[date] = None,
    force_is_taken: Optional[bool] = None
) -> IntakeLog:
    if target_date is None:
        target_date = date.today()

    # -------------------------------------------------------------------------
    # Authorization Check
    # Verify medicine exists and belongs to the active user
    # -------------------------------------------------------------------------
    med = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == user_id
    ).first()
    if not med:
        raise ValueError(f"Medicine with id {medicine_id} not found for this user.")

    # -------------------------------------------------------------------------
    # Log Lookup or Creation
    # Retrieve existing log for target date or instantiate a new record
    # -------------------------------------------------------------------------
    log = db.query(IntakeLog).filter(
        IntakeLog.medicine_id == medicine_id,
        IntakeLog.log_date == target_date
    ).first()

    now_timestamp = datetime.now()

    if not log:
        # Determine initial completion state
        new_state = True if force_is_taken is None else force_is_taken
        log = IntakeLog(
            medicine_id=medicine_id,
            log_date=target_date,
            is_taken=new_state,
            taken_at=now_timestamp if new_state else None
        )
        db.add(log)
    else:
        # Determine toggled state
        if force_is_taken is not None:
            log.is_taken = force_is_taken
        else:
            log.is_taken = not log.is_taken

        log.taken_at = now_timestamp if log.is_taken else None

    db.commit()
    db.refresh(log)
    return log


# -----------------------------------------------------------------------------
# Function: delete_medicine
# Deletes a medicine and its associated intake logs
# -----------------------------------------------------------------------------
def delete_medicine(db: Session, medicine_id: int, user_id: int) -> bool:
    med = db.query(Medicine).filter(
        Medicine.id == medicine_id,
        Medicine.user_id == user_id
    ).first()

    if not med:
        return False

    db.delete(med)
    db.commit()
    return True
