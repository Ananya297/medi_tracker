# -----------------------------------------------------------------------------
# Module Imports
# Import typing, SQLAlchemy Session, and ORM entities & schemas
# -----------------------------------------------------------------------------
from typing import Optional
from sqlalchemy.orm import Session
from app.models.entities import User
from app.schemas.user import UserLoginRequest


# -----------------------------------------------------------------------------
# Function: get_user_by_id
# Retrieves a user by their primary key integer ID
# -----------------------------------------------------------------------------
def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    # Query database for user matching given id
    return db.query(User).filter(User.id == user_id).first()


# -----------------------------------------------------------------------------
# Function: get_user_by_phone
# Retrieves a user by their unique phone number
# -----------------------------------------------------------------------------
def get_user_by_phone(db: Session, phone_number: str) -> Optional[User]:
    # Query database for user matching given phone_number
    return db.query(User).filter(User.phone_number == phone_number.strip()).first()


# -----------------------------------------------------------------------------
# Function: login_or_register_user
# Upserts a user based on phone_number: logs in if existing or registers new user
# -----------------------------------------------------------------------------
def login_or_register_user(db: Session, login_data: UserLoginRequest) -> User:
    cleaned_phone = login_data.phone_number.strip()
    
    # -------------------------------------------------------------------------
    # Query: Existing User Check
    # Check if a user with this phone number is already registered
    # -------------------------------------------------------------------------
    existing_user = db.query(User).filter(User.phone_number == cleaned_phone).first()

    if existing_user:
        # Update user profile attributes if non-null values were supplied
        if login_data.name:
            existing_user.name = login_data.name.strip()
        if login_data.age is not None:
            existing_user.age = login_data.age
        if login_data.gender:
            existing_user.gender = login_data.gender.strip()
        
        db.commit()
        db.refresh(existing_user)
        return existing_user

    # -------------------------------------------------------------------------
    # Creation: Register New User
    # Default values supplied if minimal phone-only login was initiated
    # -------------------------------------------------------------------------
    new_user = User(
        phone_number=cleaned_phone,
        name=login_data.name.strip() if login_data.name else "Patient",
        age=login_data.age if login_data.age is not None else 30,
        gender=login_data.gender.strip() if login_data.gender else "Other"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
