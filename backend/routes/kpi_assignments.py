"""
KPI Assignment routes (Super User only)
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import KPIAssignment, KPIAssignmentCreate, User
from dependencies import get_db, get_super_user, get_current_user
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/kpi-assignments", tags=["KPI Assignments"])


async def generate_serial_number(db, prefix: str = "KPI") -> str:
    """Generate serial number for KPI assignment"""
    year = datetime.utcnow().year
    
    # Get the last serial number for this year
    last_record = await db.kpi_assignments.find_one(
        {"serial_number": {"$regex": f"^{prefix}-{year}-"}},
        sort=[("serial_number", -1)]
    )
    
    if last_record:
        last_num = int(last_record['serial_number'].split('-')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    return f"{prefix}-{year}-{new_num:04d}"


@router.post("/", response_model=KPIAssignment, status_code=status.HTTP_201_CREATED)
async def create_kpi_assignment(
    assignment_data: KPIAssignmentCreate,
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Create a new KPI assignment (Super User only)
    - One assignment per KAM per month
    """
    # Validate that the KAM exists
    kam_user = await db.users.find_one({
        "user_id": assignment_data.kam_user_id,
        "role": "KAM",
        "status": "Active"
    })
    if not kam_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid KAM user specified"
        )
    
    # Check if assignment already exists for this KAM and month
    existing = await db.kpi_assignments.find_one({
        "kam_user_id": assignment_data.kam_user_id,
        "month": assignment_data.month,
        "is_deleted": False
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"KPI assignment already exists for this KAM in {assignment_data.month}. Please update the existing assignment instead."
        )
    
    # Generate serial number
    serial_number = await generate_serial_number(db, "KPI")
    
    # Create KPI assignment object
    assignment = KPIAssignment(
        **assignment_data.model_dump(),
        serial_number=serial_number,
        created_by=current_user.user_id,
        updated_by=current_user.user_id
    )
    
    # Convert to dict and serialize datetime fields
    assignment_dict = assignment.model_dump()
    assignment_dict['created_at'] = assignment_dict['created_at'].isoformat()
    assignment_dict['updated_at'] = assignment_dict['updated_at'].isoformat()
    
    # Insert into database
    await db.kpi_assignments.insert_one(assignment_dict)
    
    return assignment


@router.get("/", response_model=List[KPIAssignment])
async def get_kpi_assignments(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
    kam_user_id: Optional[str] = Query(None, description="Filter by KAM"),
    month: Optional[str] = Query(None, description="Filter by month (YYYY-MM)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get list of KPI assignments
    - KAMs see only their own assignments (read-only)
    - Super User sees all assignments
    """
    # Build query
    query = {"is_deleted": False}
    
    # Role-based filtering
    if current_user.role == "KAM":
        query["kam_user_id"] = current_user.user_id
    elif current_user.role == "SuperUser" and kam_user_id:
        query["kam_user_id"] = kam_user_id
    
    # Month filter
    if month:
        query["month"] = month
    
    # Get KPI assignments
    assignments = await db.kpi_assignments.find(query, {"_id": 0}).sort("month", -1).skip(skip).limit(limit).to_list(limit)
    
    # Convert datetime strings back to datetime objects
    for assignment in assignments:
        if isinstance(assignment.get('created_at'), str):
            assignment['created_at'] = datetime.fromisoformat(assignment['created_at'])
        if isinstance(assignment.get('updated_at'), str):
            assignment['updated_at'] = datetime.fromisoformat(assignment['updated_at'])
    
    return [KPIAssignment(**assignment) for assignment in assignments]


@router.get("/my-current", response_model=KPIAssignment)
async def get_my_current_kpi(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get current month KPI assignment for logged-in KAM
    """
    if current_user.role != "KAM":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This endpoint is for KAM users only"
        )
    
    # Get current month in YYYY-MM format
    current_month = datetime.utcnow().strftime("%Y-%m")
    
    # Find assignment
    assignment_doc = await db.kpi_assignments.find_one({
        "kam_user_id": current_user.user_id,
        "month": current_month,
        "is_deleted": False
    }, {"_id": 0})
    
    if not assignment_doc:
        raise HTTPException(
            status_code=404,
            detail=f"No KPI assignment found for current month ({current_month})"
        )
    
    # Convert datetime strings
    if isinstance(assignment_doc.get('created_at'), str):
        assignment_doc['created_at'] = datetime.fromisoformat(assignment_doc['created_at'])
    if isinstance(assignment_doc.get('updated_at'), str):
        assignment_doc['updated_at'] = datetime.fromisoformat(assignment_doc['updated_at'])
    
    return KPIAssignment(**assignment_doc)


@router.get("/{assignment_id}", response_model=KPIAssignment)
async def get_kpi_assignment(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get a specific KPI assignment by ID"""
    assignment_doc = await db.kpi_assignments.find_one(
        {"assignment_id": assignment_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not assignment_doc:
        raise HTTPException(status_code=404, detail="KPI assignment not found")
    
    # KAMs can only view their own assignments
    if current_user.role == "KAM" and assignment_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own KPI assignments"
        )
    
    # Convert datetime strings
    if isinstance(assignment_doc.get('created_at'), str):
        assignment_doc['created_at'] = datetime.fromisoformat(assignment_doc['created_at'])
    if isinstance(assignment_doc.get('updated_at'), str):
        assignment_doc['updated_at'] = datetime.fromisoformat(assignment_doc['updated_at'])
    
    return KPIAssignment(**assignment_doc)


@router.put("/{assignment_id}", response_model=KPIAssignment)
async def update_kpi_assignment(
    assignment_id: str,
    assignment_data: KPIAssignmentCreate,
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Update a KPI assignment (Super User only)
    """
    # Find assignment
    assignment_doc = await db.kpi_assignments.find_one(
        {"assignment_id": assignment_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not assignment_doc:
        raise HTTPException(status_code=404, detail="KPI assignment not found")
    
    # Check if trying to change KAM or month (not allowed)
    if (assignment_data.kam_user_id != assignment_doc['kam_user_id'] or 
        assignment_data.month != assignment_doc['month']):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change KAM or month. Please delete and create a new assignment instead."
        )
    
    # Update assignment
    update_dict = {
        "revenue_target": assignment_data.revenue_target,
        "capacity_target": assignment_data.capacity_target,
        "notes": assignment_data.notes,
        "updated_at": datetime.utcnow().isoformat(),
        "updated_by": current_user.user_id
    }
    
    await db.kpi_assignments.update_one(
        {"assignment_id": assignment_id},
        {"$set": update_dict}
    )
    
    # Fetch updated assignment
    updated_assignment = await db.kpi_assignments.find_one(
        {"assignment_id": assignment_id},
        {"_id": 0}
    )
    
    # Convert datetime strings
    if isinstance(updated_assignment.get('created_at'), str):
        updated_assignment['created_at'] = datetime.fromisoformat(updated_assignment['created_at'])
    if isinstance(updated_assignment.get('updated_at'), str):
        updated_assignment['updated_at'] = datetime.fromisoformat(updated_assignment['updated_at'])
    
    return KPIAssignment(**updated_assignment)


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_kpi_assignment(
    assignment_id: str,
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Delete a KPI assignment (Super User only, soft delete)
    """
    # Find assignment
    assignment_doc = await db.kpi_assignments.find_one(
        {"assignment_id": assignment_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not assignment_doc:
        raise HTTPException(status_code=404, detail="KPI assignment not found")
    
    # Soft delete
    await db.kpi_assignments.update_one(
        {"assignment_id": assignment_id},
        {
            "$set": {
                "is_deleted": True,
                "updated_at": datetime.utcnow().isoformat(),
                "updated_by": current_user.user_id
            }
        }
    )
    
    return None
