"""
Database models and Pydantic schemas for FGL Salesforce Management Platform
"""
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from typing import Optional, Literal
from datetime import datetime
import uuid
import re


# ==================== USER MODELS ====================

class UserBase(BaseModel):
    """Base user model with common fields"""
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    mobile: Optional[str] = Field(None, max_length=20)


class UserCreate(UserBase):
    """User creation model (registration)"""
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password complexity"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    @field_validator('mobile')
    @classmethod
    def validate_mobile(cls, v):
        """Validate mobile number format"""
        if v and not re.match(r'^\+?[\d\s\-\(\)]{10,20}$', v):
            raise ValueError('Invalid mobile number format')
        return v


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class User(UserBase):
    """Full user model (response)"""
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: Literal["SuperUser", "KAM"] = Field(default="KAM")
    status: Literal["Pending", "Active", "Rejected", "Disabled"] = Field(default="Pending")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None


class UserInDB(User):
    """User model with password hash (internal)"""
    password_hash: str


class UserResponse(User):
    """User response model (without sensitive data)"""
    pass


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Token payload data"""
    user_id: str
    email: str
    role: str


# ==================== PASSWORD RESET MODELS ====================

class ForgotPasswordRequest(BaseModel):
    """Forgot password request"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request"""
    token: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        """Validate password complexity"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class ChangePasswordRequest(BaseModel):
    """Change password request (for logged-in users)"""
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)


class PasswordResetToken(BaseModel):
    """Password reset token model"""
    model_config = ConfigDict(extra="ignore")
    
    token_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    used: bool = Field(default=False)


# ==================== MEETING MODELS ====================

class MeetingBase(BaseModel):
    """Base meeting model"""
    client_name: str = Field(..., min_length=1, max_length=200)
    client_address: str = Field(..., max_length=500)
    contact_name: str = Field(..., min_length=1, max_length=200)
    contact_number: str = Field(..., max_length=20)
    capacity_req: float = Field(..., ge=0)
    capacity_unit: Literal["Mbps", "Gbps", "IPLC"] = Field(default="Mbps")
    capacity_mrc: float = Field(..., ge=0)
    capacity_mrc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    capacity_otc: Optional[float] = Field(0, ge=0)
    capacity_otc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    other_cap_req: Optional[float] = Field(0, ge=0)
    other_cap_unit: Optional[Literal["Mbps", "Gbps", "IPLC"]] = Field(default="Mbps")
    other_cap_mrc: Optional[float] = Field(0, ge=0)
    other_cap_mrc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    other_cap_otc: Optional[float] = Field(0, ge=0)
    other_cap_otc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    kam_user_id: str
    meeting_minutes: str = Field(..., max_length=5000)


class MeetingCreate(MeetingBase):
    """Meeting creation model"""
    pass


class Meeting(MeetingBase):
    """Full meeting model"""
    model_config = ConfigDict(extra="ignore")
    
    meeting_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    serial_number: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str
    is_deleted: bool = Field(default=False)


# ==================== PIPELINE MODELS ====================

class PipelineBase(BaseModel):
    """Base pipeline model"""
    client_name: str = Field(..., min_length=1, max_length=200)
    client_address: str = Field(..., max_length=500)
    contact_name: str = Field(..., min_length=1, max_length=200)
    contact_number: str = Field(..., max_length=20)
    capacity_req: float = Field(..., ge=0)
    capacity_unit: Literal["Mbps", "Gbps", "IPLC"] = Field(default="Mbps")
    capacity_mrc: float = Field(..., ge=0)
    capacity_mrc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    capacity_otc: Optional[float] = Field(0, ge=0)
    capacity_otc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    other_cap_req: Optional[float] = Field(0, ge=0)
    other_cap_unit: Optional[Literal["Mbps", "Gbps", "IPLC"]] = Field(default="Mbps")
    other_cap_mrc: Optional[float] = Field(0, ge=0)
    other_cap_mrc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    other_cap_otc: Optional[float] = Field(0, ge=0)
    other_cap_otc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    kam_user_id: str
    confirmation_status: Literal["Pending", "Confirmed"] = Field(default="Pending")
    confirmation_date: Optional[datetime] = None
    confirmation_notes: Optional[str] = Field(None, max_length=1000)
    delivered_status: Literal["Yes", "No", "Pending", "In Process"] = Field(default="Pending")


class PipelineCreate(PipelineBase):
    """Pipeline creation model"""
    
    @field_validator('confirmation_date')
    @classmethod
    def validate_confirmation_date(cls, v, info):
        """Validate confirmation date is required when status is Confirmed"""
        if info.data.get('confirmation_status') == 'Confirmed' and not v:
            raise ValueError('Confirmation date is required when status is Confirmed')
        if v and v.replace(tzinfo=None) > datetime.utcnow():
            raise ValueError('Confirmation date cannot be in the future')
        return v


class Pipeline(PipelineBase):
    """Full pipeline model"""
    model_config = ConfigDict(extra="ignore")
    
    pipeline_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    serial_number: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str
    is_deleted: bool = Field(default=False)


# ==================== DELIVERED MODELS ====================

class DeliveredBase(BaseModel):
    """Base delivered model"""
    client_name: str = Field(..., min_length=1, max_length=200)
    client_address: str = Field(..., max_length=500)
    contact_name: str = Field(..., min_length=1, max_length=200)
    contact_number: str = Field(..., max_length=20)
    capacity_req: float = Field(..., ge=0)
    capacity_unit: Literal["Mbps", "Gbps", "IPLC"] = Field(default="Mbps")
    capacity_mrc: float = Field(..., ge=0)
    capacity_mrc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    capacity_otc: Optional[float] = Field(0, ge=0)
    capacity_otc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    other_cap_req: Optional[float] = Field(0, ge=0)
    other_cap_unit: Optional[Literal["Mbps", "Gbps", "IPLC"]] = Field(default="Mbps")
    other_cap_mrc: Optional[float] = Field(0, ge=0)
    other_cap_mrc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    other_cap_otc: Optional[float] = Field(0, ge=0)
    other_cap_otc_currency: Literal["BDT", "USD"] = Field(default="BDT")
    kam_user_id: str
    pipeline_id: Optional[str] = None  # Link to pipeline record
    kpi_score: float = Field(default=0, ge=0)  # From KPI assignment (optional with default 0)
    delivered_date: datetime
    delivered_status: Optional[Literal["Delivered", "Partial", "Cancelled"]] = Field(default="Delivered")


class DeliveredCreate(DeliveredBase):
    """Delivered creation model"""
    
    @field_validator('delivered_date')
    @classmethod
    def validate_delivered_date(cls, v):
        """Validate delivered date is not in future"""
        if v and v > datetime.utcnow():
            raise ValueError('Delivered date cannot be in the future')
        return v


class Delivered(DeliveredBase):
    """Full delivered model"""
    model_config = ConfigDict(extra="ignore")
    
    delivered_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    serial_number: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str
    is_deleted: bool = Field(default=False)


# ==================== KPI ASSIGNMENT MODELS ====================

class KPIAssignmentBase(BaseModel):
    """Base KPI assignment model"""
    month: str = Field(..., pattern=r'^\d{4}-\d{2}$')  # Format: YYYY-MM
    kam_user_id: str
    revenue_target: float = Field(..., ge=0)
    capacity_target: float = Field(..., ge=0)
    kpi_score_target: float = Field(default=0, ge=0)  # KPI score target (optional with default 0)
    notes: Optional[str] = Field(None, max_length=1000)


class KPIAssignmentCreate(KPIAssignmentBase):
    """KPI assignment creation model"""
    pass


class KPIAssignment(KPIAssignmentBase):
    """Full KPI assignment model"""
    model_config = ConfigDict(extra="ignore")
    
    assignment_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    serial_number: str
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str
    is_deleted: bool = Field(default=False)
