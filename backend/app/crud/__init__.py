# -----------------------------------------------------------------------------
# CRUD Package Init
# Re-exports data access functions for users, diagnoses, and medications
# -----------------------------------------------------------------------------
from .user_crud import (
    get_user_by_id,
    get_user_by_phone,
    login_or_register_user
)
from .medicine_crud import (
    get_or_create_diagnosis,
    get_diagnoses_by_user,
    create_medicine,
    get_medicines_by_user,
    get_today_schedule,
    toggle_intake_status,
    delete_medicine
)

__all__ = [
    "get_user_by_id",
    "get_user_by_phone",
    "login_or_register_user",
    "get_or_create_diagnosis",
    "get_diagnoses_by_user",
    "create_medicine",
    "get_medicines_by_user",
    "get_today_schedule",
    "toggle_intake_status",
    "delete_medicine"
]
