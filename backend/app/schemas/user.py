# -----------------------------------------------------------------------------
# Module Imports
# Import datetime types and Pydantic v2 base validation classes
# -----------------------------------------------------------------------------
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------------------------------------------
# Schema: UserBase
# Common fields shared across user request/response models
# -----------------------------------------------------------------------------
class UserBase(BaseModel):
    phone_number: str = Field(..., description="User primary phone number for authentication", min_length=7, max_length=20)


# -----------------------------------------------------------------------------
# Schema: UserLoginRequest
# Request payload for user login / onboarding upsert
# -----------------------------------------------------------------------------
class UserLoginRequest(UserBase):
    name: Optional[str] = Field(None, description="User full name", max_length=100)
    age: Optional[int] = Field(None, description="User age in years", ge=1, le=125)
    gender: Optional[str] = Field(None, description="User gender (e.g. Male, Female, Other)", max_length=20)


# -----------------------------------------------------------------------------
# Schema: UserResponse
# Response schema returning authenticated user information
# -----------------------------------------------------------------------------
class UserResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    phone_number: str
    created_at: Optional[datetime] = None

    # Pydantic v2 configuration for ORM model serialization
    model_config = ConfigDict(from_attributes=True)
