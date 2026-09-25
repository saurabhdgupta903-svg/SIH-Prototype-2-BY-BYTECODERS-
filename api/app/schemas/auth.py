from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.users import UserRole

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole
    institution_id: Optional[int] = None
    receiver_id: Optional[int] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    full_name: str
    role: str
    institution_id: Optional[int] = None
    receiver_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    institution_id: Optional[int] = None
    receiver_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True
