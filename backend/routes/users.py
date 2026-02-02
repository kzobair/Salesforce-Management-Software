"""
User management routes (Super User only)
"""
from fastapi import APIRouter, HTTPException, status, Depends
from models import User, UserResponse
from dependencies import get_db, get_super_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/pending", response_model=List[UserResponse])
async def get_pending_users(
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Get list of pending user registrations (Super User only)
    """
    users = await db.users.find(
        {"status": "Pending"},
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).to_list(1000)
    
    # Convert datetime strings back to datetime objects
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user.get('updated_at'), str):
            user['updated_at'] = datetime.fromisoformat(user['updated_at'])
        if user.get('last_login_at') and isinstance(user.get('last_login_at'), str):
            user['last_login_at'] = datetime.fromisoformat(user['last_login_at'])
    
    return [UserResponse(**user) for user in users]


@router.get("/active", response_model=List[UserResponse])
async def get_active_users(
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Get list of active users (Super User only)
    """
    users = await db.users.find(
        {"status": "Active"},
        {"_id": 0, "password_hash": 0}
    ).sort("name", 1).to_list(1000)
    
    # Convert datetime strings back to datetime objects
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user.get('updated_at'), str):
            user['updated_at'] = datetime.fromisoformat(user['updated_at'])
        if user.get('last_login_at') and isinstance(user.get('last_login_at'), str):
            user['last_login_at'] = datetime.fromisoformat(user['last_login_at'])
    
    return [UserResponse(**user) for user in users]


@router.get("/rejected", response_model=List[UserResponse])
async def get_rejected_users(
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Get list of rejected users (Super User only)
    """
    users = await db.users.find(
        {"status": "Rejected"},
        {"_id": 0, "password_hash": 0}
    ).sort("updated_at", -1).to_list(1000)
    
    # Convert datetime strings back to datetime objects
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user.get('updated_at'), str):
            user['updated_at'] = datetime.fromisoformat(user['updated_at'])
        if user.get('last_login_at') and isinstance(user.get('last_login_at'), str):
            user['last_login_at'] = datetime.fromisoformat(user['last_login_at'])
    
    return [UserResponse(**user) for user in users]


@router.get("/kams", response_model=List[UserResponse])
async def get_kam_users(
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Get list of all KAM users (for dropdown selections)
    """
    users = await db.users.find(
        {"role": "KAM", "status": "Active"},
        {"_id": 0, "password_hash": 0}
    ).sort("name", 1).to_list(1000)
    
    # Convert datetime strings back to datetime objects
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
        if isinstance(user.get('updated_at'), str):
            user['updated_at'] = datetime.fromisoformat(user['updated_at'])
        if user.get('last_login_at') and isinstance(user.get('last_login_at'), str):
            user['last_login_at'] = datetime.fromisoformat(user['last_login_at'])
    
    return [UserResponse(**user) for user in users]


@router.post("/approve/{user_id}", response_model=UserResponse)
async def approve_user(
    user_id: str,
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Approve a pending user (Super User only)
    """
    # Find user
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_doc['status'] != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is not pending approval. Current status: {user_doc['status']}"
        )
    
    # Update status to Active
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "status": "Active",
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    # Convert datetime strings
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    if isinstance(updated_user.get('updated_at'), str):
        updated_user['updated_at'] = datetime.fromisoformat(updated_user['updated_at'])
    if updated_user.get('last_login_at') and isinstance(updated_user.get('last_login_at'), str):
        updated_user['last_login_at'] = datetime.fromisoformat(updated_user['last_login_at'])
    
    return UserResponse(**updated_user)


@router.post("/reject/{user_id}", response_model=UserResponse)
async def reject_user(
    user_id: str,
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Reject a pending user (Super User only)
    """
    # Find user
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_doc['status'] != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is not pending approval. Current status: {user_doc['status']}"
        )
    
    # Update status to Rejected
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "status": "Rejected",
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    # Convert datetime strings
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    if isinstance(updated_user.get('updated_at'), str):
        updated_user['updated_at'] = datetime.fromisoformat(updated_user['updated_at'])
    if updated_user.get('last_login_at') and isinstance(updated_user.get('last_login_at'), str):
        updated_user['last_login_at'] = datetime.fromisoformat(updated_user['last_login_at'])
    
    return UserResponse(**updated_user)


@router.post("/deactivate/{user_id}", response_model=UserResponse)
async def deactivate_user(
    user_id: str,
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Deactivate an active user (Super User only)
    """
    # Find user
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_doc['status'] != "Active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is not active. Current status: {user_doc['status']}"
        )
    
    # Cannot deactivate yourself
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account"
        )
    
    # Update status to Disabled
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "status": "Disabled",
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    # Convert datetime strings
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    if isinstance(updated_user.get('updated_at'), str):
        updated_user['updated_at'] = datetime.fromisoformat(updated_user['updated_at'])
    if updated_user.get('last_login_at') and isinstance(updated_user.get('last_login_at'), str):
        updated_user['last_login_at'] = datetime.fromisoformat(updated_user['last_login_at'])
    
    return UserResponse(**updated_user)


@router.post("/reactivate/{user_id}", response_model=UserResponse)
async def reactivate_user(
    user_id: str,
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Reactivate a disabled user (Super User only)
    """
    # Find user
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_doc['status'] != "Disabled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is not disabled. Current status: {user_doc['status']}"
        )
    
    # Update status to Active
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "status": "Active",
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Fetch updated user
    updated_user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    # Convert datetime strings
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    if isinstance(updated_user.get('updated_at'), str):
        updated_user['updated_at'] = datetime.fromisoformat(updated_user['updated_at'])
    if updated_user.get('last_login_at') and isinstance(updated_user.get('last_login_at'), str):
        updated_user['last_login_at'] = datetime.fromisoformat(updated_user['last_login_at'])
    
    return UserResponse(**updated_user)
