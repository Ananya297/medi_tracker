# -----------------------------------------------------------------------------
# Module Imports
# Import SQLAlchemy types, relationships, constraints, and timestamps
# -----------------------------------------------------------------------------
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


# -----------------------------------------------------------------------------
# Entity Model: User
# Represents registered application users identified primarily by phone_number
# -----------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    # Primary key identifier
    id = Column(Integer, primary_key=True, index=True)

    # User personal profile details
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)

    # Audit timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relational cascade mappings
    diagnoses = relationship(
        "Diagnosis",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    medicines = relationship(
        "Medicine",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# -----------------------------------------------------------------------------
# Entity Model: Diagnosis
# Represents diagnosed medical conditions (e.g., Hypertension, Diabetes, Thyroid)
# -----------------------------------------------------------------------------
class Diagnosis(Base):
    __tablename__ = "diagnoses"

    # Primary key identifier
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key link to owning user
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Condition name (e.g., "Hypertension")
    condition_name = Column(String(150), nullable=False)

    # Audit timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Constraints: A user cannot duplicate the same condition name
    __table_args__ = (
        UniqueConstraint("user_id", "condition_name", name="uq_user_condition"),
    )

    # Relational mappings
    user = relationship("User", back_populates="diagnoses")
    medicines = relationship(
        "Medicine",
        back_populates="diagnosis",
        cascade="all, delete-orphan"
    )


# -----------------------------------------------------------------------------
# Entity Model: Medicine
# Represents prescribed medications associated with a condition and intake schedule
# -----------------------------------------------------------------------------
class Medicine(Base):
    __tablename__ = "medicines"

    # Primary key identifier
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key references to owning user and specific diagnosis
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id", ondelete="CASCADE"), nullable=False)

    # Medication specifications
    medicine_name = Column(String(150), nullable=False)
    scheduled_time = Column(String(5), nullable=False)  # HH:MM 24-hr format (e.g., "08:00")
    is_active = Column(Boolean, default=True)

    # Audit timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relational mappings
    user = relationship("User", back_populates="medicines")
    diagnosis = relationship("Diagnosis", back_populates="medicines")
    logs = relationship(
        "IntakeLog",
        back_populates="medicine",
        cascade="all, delete-orphan"
    )


# -----------------------------------------------------------------------------
# Entity Model: IntakeLog
# Tracks daily dosage completion status (checkbox toggle) per medicine per day
# -----------------------------------------------------------------------------
class IntakeLog(Base):
    __tablename__ = "intake_logs"

    # Primary key identifier
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key reference to the medicine taken
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)

    # Target scheduled date of intake (YYYY-MM-DD)
    log_date = Column(Date, nullable=False)

    # Checkbox completion state and timestamp when taken
    is_taken = Column(Boolean, default=False)
    taken_at = Column(DateTime(timezone=True), nullable=True)

    # Constraints: Only one log entry per medicine per calendar day
    __table_args__ = (
        UniqueConstraint("medicine_id", "log_date", name="uq_medicine_date"),
    )

    # Relational mapping
    medicine = relationship("Medicine", back_populates="logs")
