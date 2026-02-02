"""
Meeting routes for client meeting management
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import Meeting, MeetingCreate, User
from dependencies import get_db, get_current_user
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/meetings", tags=["Meetings"])


async def generate_serial_number(db, prefix: str = "MTG") -> str:
    """Generate serial number for meeting"""
    year = datetime.utcnow().year
    
    # Get the last serial number for this year
    last_record = await db.meetings.find_one(
        {"serial_number": {"$regex": f"^{prefix}-{year}-"}},
        sort=[("serial_number", -1)]
    )
    
    if last_record:
        # Extract number and increment
        last_num = int(last_record['serial_number'].split('-')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    return f"{prefix}-{year}-{new_num:04d}"


@router.post("/", response_model=Meeting, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_data: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Create a new meeting record
    - KAMs can only create for themselves
    - Super User can create for any KAM
    """
    # If user is KAM, force kam_user_id to be their own ID
    if current_user.role == "KAM":
        meeting_data.kam_user_id = current_user.user_id
    else:
        # Super User can specify any KAM
        # Validate that the specified KAM exists
        kam_user = await db.users.find_one({
            "user_id": meeting_data.kam_user_id,
            "role": "KAM",
            "status": "Active"
        })
        if not kam_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid KAM user specified"
            )
    
    # Generate serial number
    serial_number = await generate_serial_number(db, "MTG")
    
    # Create meeting object
    meeting = Meeting(
        **meeting_data.model_dump(),
        serial_number=serial_number,
        created_by=current_user.user_id,
        updated_by=current_user.user_id
    )
    
    # Convert to dict and serialize datetime fields
    meeting_dict = meeting.model_dump()
    meeting_dict['created_at'] = meeting_dict['created_at'].isoformat()
    meeting_dict['updated_at'] = meeting_dict['updated_at'].isoformat()
    
    # Insert into database
    await db.meetings.insert_one(meeting_dict)
    
    return meeting


@router.get("/", response_model=List[Meeting])
async def get_meetings(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by client name or contact name"),
    kam_user_id: Optional[str] = Query(None, description="Filter by KAM (Super User only)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get list of meetings
    - KAMs see only their own meetings
    - Super User sees all meetings (can filter by KAM)
    """
    # Build query
    query = {"is_deleted": False}
    
    # Role-based filtering
    if current_user.role == "KAM":
        query["kam_user_id"] = current_user.user_id
    elif current_user.role == "SuperUser" and kam_user_id:
        query["kam_user_id"] = kam_user_id
    
    # Search filter
    if search:
        query["$or"] = [
            {"client_name": {"$regex": search, "$options": "i"}},
            {"contact_name": {"$regex": search, "$options": "i"}}
        ]
    
    # Get meetings
    meetings = await db.meetings.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Convert datetime strings back to datetime objects
    for meeting in meetings:
        if isinstance(meeting.get('created_at'), str):
            meeting['created_at'] = datetime.fromisoformat(meeting['created_at'])
        if isinstance(meeting.get('updated_at'), str):
            meeting['updated_at'] = datetime.fromisoformat(meeting['updated_at'])
    
    return [Meeting(**meeting) for meeting in meetings]


@router.get("/{meeting_id}", response_model=Meeting)
async def get_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get a specific meeting by ID"""
    meeting_doc = await db.meetings.find_one(
        {"meeting_id": meeting_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not meeting_doc:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check access permissions
    if current_user.role == "KAM" and meeting_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own meetings"
        )
    
    # Convert datetime strings
    if isinstance(meeting_doc.get('created_at'), str):
        meeting_doc['created_at'] = datetime.fromisoformat(meeting_doc['created_at'])
    if isinstance(meeting_doc.get('updated_at'), str):
        meeting_doc['updated_at'] = datetime.fromisoformat(meeting_doc['updated_at'])
    
    return Meeting(**meeting_doc)


@router.put("/{meeting_id}", response_model=Meeting)
async def update_meeting(
    meeting_id: str,
    meeting_data: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update a meeting
    - KAMs can only update their own meetings
    - Super User can update any meeting
    """
    # Find meeting
    meeting_doc = await db.meetings.find_one(
        {"meeting_id": meeting_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not meeting_doc:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check permissions
    if current_user.role == "KAM" and meeting_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own meetings"
        )
    
    # If user is KAM, force kam_user_id to be their own ID
    if current_user.role == "KAM":
        meeting_data.kam_user_id = current_user.user_id
    
    # Update meeting
    update_dict = meeting_data.model_dump()
    update_dict['updated_at'] = datetime.utcnow().isoformat()
    update_dict['updated_by'] = current_user.user_id
    
    await db.meetings.update_one(
        {"meeting_id": meeting_id},
        {"$set": update_dict}
    )
    
    # Fetch updated meeting
    updated_meeting = await db.meetings.find_one(
        {"meeting_id": meeting_id},
        {"_id": 0}
    )
    
    # Convert datetime strings
    if isinstance(updated_meeting.get('created_at'), str):
        updated_meeting['created_at'] = datetime.fromisoformat(updated_meeting['created_at'])
    if isinstance(updated_meeting.get('updated_at'), str):
        updated_meeting['updated_at'] = datetime.fromisoformat(updated_meeting['updated_at'])
    
    return Meeting(**updated_meeting)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Delete a meeting (soft delete)
    - KAMs can only delete their own meetings
    - Super User can delete any meeting
    """
    # Find meeting
    meeting_doc = await db.meetings.find_one(
        {"meeting_id": meeting_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not meeting_doc:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check permissions
    if current_user.role == "KAM" and meeting_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own meetings"
        )
    
    # Soft delete
    await db.meetings.update_one(
        {"meeting_id": meeting_id},
        {
            "$set": {
                "is_deleted": True,
                "updated_at": datetime.utcnow().isoformat(),
                "updated_by": current_user.user_id
            }
        }
    )
    
    return None
