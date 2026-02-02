"""
Dependencies for authentication and authorization
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from models import User, TokenData
from auth_utils import decode_access_token
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Security scheme
security = HTTPBearer()


async def get_db():
    """Get database instance"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    try:
        yield db
    finally:
        client.close()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
    
    # Fetch user from database
    user_doc = await db.users.find_one({"user_id": user_id, "is_deleted": {"$ne": True}}, {"_id": 0, "password_hash": 0})
    
    if user_doc is None:
        raise credentials_exception
    
    # Check if user is active
    if user_doc.get("status") != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    
    # Convert datetime strings back to datetime objects if needed
    if isinstance(user_doc.get('created_at'), str):
        from datetime import datetime
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    if isinstance(user_doc.get('updated_at'), str):
        from datetime import datetime
        user_doc['updated_at'] = datetime.fromisoformat(user_doc['updated_at'])
    if user_doc.get('last_login_at') and isinstance(user_doc.get('last_login_at'), str):
        from datetime import datetime
        user_doc['last_login_at'] = datetime.fromisoformat(user_doc['last_login_at'])
    
    return User(**user_doc)


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if current_user.status != "Active":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_super_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current user and verify they are a Super User"""
    if current_user.role != "SuperUser":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This operation requires Super User privileges"
        )
    return current_user


async def get_kam_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current user and verify they are a KAM"""
    if current_user.role != "KAM":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This operation requires KAM role"
        )
    return current_user
