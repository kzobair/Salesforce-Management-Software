"""
Authentication routes for user registration, login, and password management
"""
from fastapi import APIRouter, HTTPException, status, Depends
from models import (
    UserCreate, UserLogin, User, Token, UserResponse, UserInDB,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
    PasswordResetToken
)
from auth_utils import verify_password, get_password_hash, create_access_token
from dependencies import get_db, get_current_user
from datetime import datetime, timedelta
import uuid
import secrets

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db = Depends(get_db)):
    """
    Register a new user
    - Creates user with status "Pending" 
    - Requires admin approval before login
    """
    # Check if passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = get_password_hash(user_data.password)
    
    # Create user object
    user = User(
        name=user_data.name,
        email=user_data.email.lower(),
        mobile=user_data.mobile,
        status="Pending"  # Default status for new registrations
    )
    
    # Convert to dict and add password hash
    user_dict = user.model_dump()
    user_dict['password_hash'] = password_hash
    
    # Serialize datetime fields
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    if user_dict.get('last_login_at'):
        user_dict['last_login_at'] = user_dict['last_login_at'].isoformat()
    
    # Insert into database
    await db.users.insert_one(user_dict)
    
    return user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db = Depends(get_db)):
    """
    Login user and return JWT token
    - Only active users can login
    """
    # Find user by email
    user_doc = await db.users.find_one({"email": credentials.email.lower()}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if user_doc['status'] == "Pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending approval. Please wait for administrator approval."
        )
    elif user_doc['status'] == "Rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been rejected. Please contact administrator."
        )
    elif user_doc['status'] == "Disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled. Please contact administrator."
        )
    elif user_doc['status'] != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not active. Please contact administrator."
        )
    
    # Update last login time
    await db.users.update_one(
        {"user_id": user_doc['user_id']},
        {"$set": {"last_login_at": datetime.utcnow().isoformat()}}
    )
    
    # Create access token
    access_token = create_access_token(
        data={
            "user_id": user_doc['user_id'],
            "email": user_doc['email'],
            "role": user_doc['role']
        }
    )
    
    # Remove password hash before returning
    user_doc.pop('password_hash', None)
    
    # Convert datetime strings back to datetime objects
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    if isinstance(user_doc.get('updated_at'), str):
        user_doc['updated_at'] = datetime.fromisoformat(user_doc['updated_at'])
    if user_doc.get('last_login_at') and isinstance(user_doc.get('last_login_at'), str):
        user_doc['last_login_at'] = datetime.fromisoformat(user_doc['last_login_at'])
    
    user = UserResponse(**user_doc)
    
    return Token(access_token=access_token, user=user)


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest, db = Depends(get_db)):
    """
    Request password reset (Mocked - stores token in database)
    In production, this would send an email with reset link
    """
    # Find user by email
    user_doc = await db.users.find_one({"email": request.email.lower()}, {"_id": 0})
    
    # Don't reveal if email exists (security best practice)
    if not user_doc:
        return {
            "message": "If the email exists, a password reset link has been sent. (Mocked: Check /api/auth/get-reset-token/{email})"
        }
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Create password reset token document
    token_doc = PasswordResetToken(
        user_id=user_doc['user_id'],
        token=reset_token,
        expires_at=datetime.utcnow() + timedelta(minutes=15)  # 15 minutes expiry
    )
    
    # Store in database
    token_dict = token_doc.model_dump()
    token_dict['created_at'] = token_dict['created_at'].isoformat()
    token_dict['expires_at'] = token_dict['expires_at'].isoformat()
    
    await db.password_reset_tokens.insert_one(token_dict)
    
    return {
        "message": f"If the email exists, a password reset link has been sent. (Mocked: Use token from /api/auth/get-reset-token/{request.email})"
    }


@router.get("/get-reset-token/{email}")
async def get_reset_token(email: str, db = Depends(get_db)):
    """
    Mocked endpoint to retrieve reset token for testing
    In production, this would not exist - token sent via email
    """
    # Find user
    user_doc = await db.users.find_one({"email": email.lower()})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Find latest unused token
    token_doc = await db.password_reset_tokens.find_one(
        {
            "user_id": user_doc['user_id'],
            "used": False
        },
        {"_id": 0},
        sort=[("created_at", -1)]
    )
    
    if not token_doc:
        raise HTTPException(status_code=404, detail="No reset token found. Please request password reset first.")
    
    # Check if expired
    expires_at = datetime.fromisoformat(token_doc['expires_at'])
    if expires_at < datetime.utcnow():
        return {
            "message": "Token expired. Please request a new one.",
            "token": token_doc['token'],
            "expired": True
        }
    
    return {
        "message": "Use this token to reset password (valid for 15 minutes)",
        "token": token_doc['token'],
        "expired": False,
        "expires_at": token_doc['expires_at']
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest, db = Depends(get_db)):
    """
    Reset password using token from forgot-password flow
    """
    # Check if passwords match
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Find token
    token_doc = await db.password_reset_tokens.find_one(
        {"token": request.token, "used": False},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used token"
        )
    
    # Check if expired
    expires_at = datetime.fromisoformat(token_doc['expires_at'])
    if expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has expired. Please request a new password reset."
        )
    
    # Hash new password
    password_hash = get_password_hash(request.new_password)
    
    # Update user password
    await db.users.update_one(
        {"user_id": token_doc['user_id']},
        {
            "$set": {
                "password_hash": password_hash,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Mark token as used
    await db.password_reset_tokens.update_one(
        {"token_id": token_doc['token_id']},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successful. You can now login with your new password."}


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Change password for logged-in user
    """
    # Check if passwords match
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    # Get user with password hash
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(request.current_password, user_doc['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    password_hash = get_password_hash(request.new_password)
    
    # Update password
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {
            "$set": {
                "password_hash": password_hash,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    return {"message": "Password changed successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current logged-in user information
    """
    return current_user
