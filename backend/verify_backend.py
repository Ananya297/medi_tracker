# -----------------------------------------------------------------------------
# Module Imports
# Import datetime, database session, schemas, and CRUD / route logic
# -----------------------------------------------------------------------------
from datetime import date
from app.core.database import SessionLocal
from app.schemas.user import UserLoginRequest
from app.schemas.medicine import MedicineCreate, IntakeToggleRequest
from app.crud import (
    login_or_register_user,
    get_or_create_diagnosis,
    get_diagnoses_by_user,
    create_medicine,
    get_today_schedule,
    toggle_intake_status,
    delete_medicine
)

# -----------------------------------------------------------------------------
# Verification Function: run_backend_verification
# End-to-end verification of all data operations against live Neon PostgreSQL
# -----------------------------------------------------------------------------
def run_backend_verification():
    print("=" * 60)
    print("Beginning MedTracker Backend End-to-End Verification")
    print("=" * 60)

    db = SessionLocal()
    try:
        # 1. Test User Login / Upsert
        print("\n[Step 1] Testing User Onboarding / Login...")
        login_data = UserLoginRequest(
            phone_number="+919876543210",
            name="John Doe",
            age=32,
            gender="Male"
        )
        user = login_or_register_user(db, login_data)
        print(f"-> User Verified: ID={user.id}, Name={user.name}, Phone={user.phone_number}")

        # 2. Test Diagnosis Creation
        print("\n[Step 2] Testing Diagnosis Management...")
        diag1 = get_or_create_diagnosis(db, user_id=user.id, condition_name="Type 2 Diabetes")
        diag2 = get_or_create_diagnosis(db, user_id=user.id, condition_name="Hypertension")
        print(f"-> Diagnoses Created: '{diag1.condition_name}' (ID={diag1.id}), '{diag2.condition_name}' (ID={diag2.id})")

        all_diags = get_diagnoses_by_user(db, user_id=user.id)
        print(f"-> Total User Diagnoses: {len(all_diags)}")

        # 3. Test Medicine Creation
        print("\n[Step 3] Testing Medicine Creation...")
        med1_data = MedicineCreate(
            medicine_name="Metformin 500mg",
            scheduled_time="08:00",
            diagnosis_id=diag1.id
        )
        med1 = create_medicine(db, user_id=user.id, med_data=med1_data)
        print(f"-> Medication 1 Created: ID={med1.id}, Name={med1.medicine_name}, Time={med1.scheduled_time}")

        med2_data = MedicineCreate(
            medicine_name="Amlodipine 5mg",
            scheduled_time="20:00",
            condition_name="Hypertension"  # Tests auto-association by condition name
        )
        med2 = create_medicine(db, user_id=user.id, med_data=med2_data)
        print(f"-> Medication 2 Created: ID={med2.id}, Name={med2.medicine_name}, Time={med2.scheduled_time}")

        # 4. Test Disease-Grouped Daily Schedule Retrieval
        print("\n[Step 4] Testing Daily Grouped Medicines Query...")
        schedule = get_today_schedule(db, user_id=user.id, target_date=date.today())
        print(f"-> Daily Schedule Date: {schedule.date}")
        print(f"-> Total Medicines: {schedule.total_count}, Taken: {schedule.taken_count}")
        for group in schedule.groups:
            print(f"   [Condition: {group.condition_name}]")
            for m in group.medicines:
                print(f"     * {m.medicine_name} at {m.scheduled_time} (Taken: {m.is_taken_today})")

        # 5. Test Checkbox Toggle (Mark as Taken)
        print(f"\n[Step 5] Toggling Checkbox for Medicine ID {med1.id} (Mark as Taken)...")
        log = toggle_intake_status(db, medicine_id=med1.id, user_id=user.id)
        print(f"-> IntakeLog Updated: ID={log.id}, is_taken={log.is_taken}, taken_at={log.taken_at}")

        # 6. Verify Daily Schedule Reflects Taken Status
        print("\n[Step 6] Verifying Schedule Updated State...")
        updated_schedule = get_today_schedule(db, user_id=user.id, target_date=date.today())
        print(f"-> Total Taken Count: {updated_schedule.taken_count}/{updated_schedule.total_count}")
        assert updated_schedule.taken_count >= 1, "Expected at least 1 medicine marked as taken"

        # 7. Test Checkbox Toggle Again (Untake)
        print(f"\n[Step 7] Toggling Checkbox Again for Medicine ID {med1.id} (Unmark)...")
        untaken_log = toggle_intake_status(db, medicine_id=med1.id, user_id=user.id)
        print(f"-> IntakeLog Toggled: is_taken={untaken_log.is_taken}")
        assert untaken_log.is_taken is False, "Expected medicine to be un-taken"

        # 8. Clean up created test medicines
        print("\n[Step 8] Cleaning up test medicines...")
        delete_medicine(db, medicine_id=med1.id, user_id=user.id)
        delete_medicine(db, medicine_id=med2.id, user_id=user.id)
        print("-> Cleaned up test medicine records.")

        print("\n" + "=" * 60)
        print("ALL BACKEND CHECKS PASSED SUCCESSFULLY!")
        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    run_backend_verification()
