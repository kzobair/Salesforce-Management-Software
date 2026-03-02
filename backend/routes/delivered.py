"""
Delivered routes for completed client deliveries
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import Delivered, DeliveredCreate, User
from dependencies import get_db, get_current_user
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/delivered", tags=["Delivered"])


async def generate_serial_number(db, prefix: str = "DEL") -> str:
    """Generate serial number for delivered"""
    year = datetime.utcnow().year
    
    # Get the last serial number for this year
    last_record = await db.delivered.find_one(
        {"serial_number": {"$regex": f"^{prefix}-{year}-"}},
        sort=[("serial_number", -1)]
    )
    
    if last_record:
        last_num = int(last_record['serial_number'].split('-')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    return f"{prefix}-{year}-{new_num:04d}"


@router.post("/", response_model=Delivered, status_code=status.HTTP_201_CREATED)
async def create_delivered(
    delivered_data: DeliveredCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Create a new delivered record
    - KAMs can only create for themselves
    - Super User can create for any KAM
    """
    # If user is KAM, force kam_user_id to be their own ID
    if current_user.role == "KAM":
        delivered_data.kam_user_id = current_user.user_id
    else:
        # Super User can specify any KAM
        kam_user = await db.users.find_one({
            "user_id": delivered_data.kam_user_id,
            "role": "KAM",
            "status": "Active"
        })
        if not kam_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid KAM user specified"
            )
    
    # Generate serial number
    serial_number = await generate_serial_number(db, "DEL")
    
    # Create delivered object
    delivered = Delivered(
        **delivered_data.model_dump(),
        serial_number=serial_number,
        created_by=current_user.user_id,
        updated_by=current_user.user_id
    )
    
    # Convert to dict and serialize datetime fields
    delivered_dict = delivered.model_dump()
    delivered_dict['created_at'] = delivered_dict['created_at'].isoformat()
    delivered_dict['updated_at'] = delivered_dict['updated_at'].isoformat()
    delivered_dict['delivered_date'] = delivered_dict['delivered_date'].isoformat()
    
    # Insert into database
    await db.delivered.insert_one(delivered_dict)
    
    return delivered


@router.get("/", response_model=List[Delivered])
async def get_delivered_records(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by client name or contact name"),
    kam_user_id: Optional[str] = Query(None, description="Filter by KAM (Super User only)"),
    delivered_status: Optional[str] = Query(None, description="Filter by delivered status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get list of delivered records
    - KAMs see only their own delivered records
    - Super User sees all delivered records (can filter by KAM)
    """
    # Build query
    query = {"is_deleted": False}
    
    # Filter by delivered status
    if delivered_status:
        query["delivered_status"] = delivered_status
    
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
    
    # Get delivered records
    delivered_records = await db.delivered.find(query, {"_id": 0}).sort("delivered_date", -1).skip(skip).limit(limit).to_list(limit)
    
    # Convert datetime strings back to datetime objects
    for record in delivered_records:
        if isinstance(record.get('created_at'), str):
            record['created_at'] = datetime.fromisoformat(record['created_at'])
        if isinstance(record.get('updated_at'), str):
            record['updated_at'] = datetime.fromisoformat(record['updated_at'])
        if isinstance(record.get('delivered_date'), str):
            record['delivered_date'] = datetime.fromisoformat(record['delivered_date'])
    
    return [Delivered(**record) for record in delivered_records]


@router.get("/{delivered_id}", response_model=Delivered)
async def get_delivered(
    delivered_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get a specific delivered record by ID"""
    delivered_doc = await db.delivered.find_one(
        {"delivered_id": delivered_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not delivered_doc:
        raise HTTPException(status_code=404, detail="Delivered record not found")
    
    # Check access permissions
    if current_user.role == "KAM" and delivered_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own delivered records"
        )
    
    # Convert datetime strings
    if isinstance(delivered_doc.get('created_at'), str):
        delivered_doc['created_at'] = datetime.fromisoformat(delivered_doc['created_at'])
    if isinstance(delivered_doc.get('updated_at'), str):
        delivered_doc['updated_at'] = datetime.fromisoformat(delivered_doc['updated_at'])
    if isinstance(delivered_doc.get('delivered_date'), str):
        delivered_doc['delivered_date'] = datetime.fromisoformat(delivered_doc['delivered_date'])
    
    return Delivered(**delivered_doc)


@router.put("/{delivered_id}", response_model=Delivered)
async def update_delivered(
    delivered_id: str,
    delivered_data: DeliveredCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update a delivered record
    - KAMs can only update their own delivered records
    - Super User can update any delivered record
    """
    # Find delivered record
    delivered_doc = await db.delivered.find_one(
        {"delivered_id": delivered_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not delivered_doc:
        raise HTTPException(status_code=404, detail="Delivered record not found")
    
    # Check permissions
    if current_user.role == "KAM" and delivered_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own delivered records"
        )
    
    # If user is KAM, force kam_user_id to be their own ID
    if current_user.role == "KAM":
        delivered_data.kam_user_id = current_user.user_id
    
    # Update delivered record
    update_dict = delivered_data.model_dump()
    update_dict['updated_at'] = datetime.utcnow().isoformat()
    update_dict['updated_by'] = current_user.user_id
    update_dict['delivered_date'] = update_dict['delivered_date'].isoformat()
    
    await db.delivered.update_one(
        {"delivered_id": delivered_id},
        {"$set": update_dict}
    )
    
    # Fetch updated delivered record
    updated_delivered = await db.delivered.find_one(
        {"delivered_id": delivered_id},
        {"_id": 0}
    )
    
    # Convert datetime strings
    if isinstance(updated_delivered.get('created_at'), str):
        updated_delivered['created_at'] = datetime.fromisoformat(updated_delivered['created_at'])
    if isinstance(updated_delivered.get('updated_at'), str):
        updated_delivered['updated_at'] = datetime.fromisoformat(updated_delivered['updated_at'])
    if isinstance(updated_delivered.get('delivered_date'), str):
        updated_delivered['delivered_date'] = datetime.fromisoformat(updated_delivered['delivered_date'])
    
    return Delivered(**updated_delivered)


@router.delete("/{delivered_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_delivered(
    delivered_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Delete a delivered record (soft delete)
    - KAMs can only delete their own delivered records
    - Super User can delete any delivered record
    """
    # Find delivered record
    delivered_doc = await db.delivered.find_one(
        {"delivered_id": delivered_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not delivered_doc:
        raise HTTPException(status_code=404, detail="Delivered record not found")
    
    # Check permissions
    if current_user.role == "KAM" and delivered_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own delivered records"
        )
    
    # Soft delete
    await db.delivered.update_one(
        {"delivered_id": delivered_id},
        {
            "$set": {
                "is_deleted": True,
                "updated_at": datetime.utcnow().isoformat(),
                "updated_by": current_user.user_id
            }
        }
    )
    
    return None


@router.get("/stats/summary")
async def get_delivered_summary(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
    kam_user_id: Optional[str] = Query(None)
):
    """
    Get delivered summary statistics
    """
    # Build query
    query = {"is_deleted": False}
    
    # Role-based filtering
    if current_user.role == "KAM":
        query["kam_user_id"] = current_user.user_id
    elif current_user.role == "SuperUser" and kam_user_id:
        query["kam_user_id"] = kam_user_id
    
    # Get delivered records
    delivered_records = await db.delivered.find(query, {"_id": 0}).to_list(1000)
    
    # Calculate summary
    total_count = len(delivered_records)
    total_capacity_delivered = sum(d.get('capacity_req', 0) for d in delivered_records)
    total_revenue = sum(d.get('capacity_mrc', 0) for d in delivered_records)
    total_kpi = sum(d.get('kpi_score', 0) for d in delivered_records)
    
    return {
        "total_count": total_count,
        "total_capacity_delivered": total_capacity_delivered,
        "total_revenue": total_revenue,
        "total_kpi_achievement": total_kpi
    }
