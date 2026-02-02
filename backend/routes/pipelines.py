"""
Pipeline routes for confirmed sales opportunities
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from models import Pipeline, PipelineCreate, User
from dependencies import get_db, get_current_user
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/pipelines", tags=["Pipeline"])


async def generate_serial_number(db, prefix: str = "PIPE") -> str:
    """Generate serial number for pipeline"""
    year = datetime.utcnow().year
    
    # Get the last serial number for this year
    last_record = await db.pipelines.find_one(
        {"serial_number": {"$regex": f"^{prefix}-{year}-"}},
        sort=[("serial_number", -1)]
    )
    
    if last_record:
        last_num = int(last_record['serial_number'].split('-')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    return f"{prefix}-{year}-{new_num:04d}"


@router.post("/", response_model=Pipeline, status_code=status.HTTP_201_CREATED)
async def create_pipeline(
    pipeline_data: PipelineCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Create a new pipeline record
    - KAMs can only create for themselves
    - Super User can create for any KAM
    """
    # If user is KAM, force kam_user_id to be their own ID
    if current_user.role == "KAM":
        pipeline_data.kam_user_id = current_user.user_id
    else:
        # Super User can specify any KAM
        kam_user = await db.users.find_one({
            "user_id": pipeline_data.kam_user_id,
            "role": "KAM",
            "status": "Active"
        })
        if not kam_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid KAM user specified"
            )
    
    # Validate confirmation status and date
    if pipeline_data.confirmation_status == "Confirmed" and not pipeline_data.confirmation_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation date is required when status is Confirmed"
        )
    
    # Generate serial number
    serial_number = await generate_serial_number(db, "PIPE")
    
    # Create pipeline object
    pipeline = Pipeline(
        **pipeline_data.model_dump(),
        serial_number=serial_number,
        created_by=current_user.user_id,
        updated_by=current_user.user_id
    )
    
    # Convert to dict and serialize datetime fields
    pipeline_dict = pipeline.model_dump()
    pipeline_dict['created_at'] = pipeline_dict['created_at'].isoformat()
    pipeline_dict['updated_at'] = pipeline_dict['updated_at'].isoformat()
    if pipeline_dict.get('confirmation_date'):
        pipeline_dict['confirmation_date'] = pipeline_dict['confirmation_date'].isoformat()
    
    # Insert into database
    await db.pipelines.insert_one(pipeline_dict)
    
    return pipeline


@router.get("/", response_model=List[Pipeline])
async def get_pipelines(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by client name or contact name"),
    kam_user_id: Optional[str] = Query(None, description="Filter by KAM (Super User only)"),
    confirmation_status: Optional[str] = Query("Confirmed", description="Filter by confirmation status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get list of pipelines
    - By default, only shows Confirmed pipelines (as per SRS requirement)
    - KAMs see only their own pipelines
    - Super User sees all pipelines (can filter by KAM)
    """
    # Build query
    query = {"is_deleted": False}
    
    # Filter by confirmation status (default: Confirmed only)
    if confirmation_status:
        query["confirmation_status"] = confirmation_status
    
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
    
    # Get pipelines
    pipelines = await db.pipelines.find(query, {"_id": 0}).sort("confirmation_date", -1).skip(skip).limit(limit).to_list(limit)
    
    # Convert datetime strings back to datetime objects
    for pipeline in pipelines:
        if isinstance(pipeline.get('created_at'), str):
            pipeline['created_at'] = datetime.fromisoformat(pipeline['created_at'])
        if isinstance(pipeline.get('updated_at'), str):
            pipeline['updated_at'] = datetime.fromisoformat(pipeline['updated_at'])
        if pipeline.get('confirmation_date') and isinstance(pipeline.get('confirmation_date'), str):
            pipeline['confirmation_date'] = datetime.fromisoformat(pipeline['confirmation_date'])
    
    return [Pipeline(**pipeline) for pipeline in pipelines]


@router.get("/{pipeline_id}", response_model=Pipeline)
async def get_pipeline(
    pipeline_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get a specific pipeline by ID"""
    pipeline_doc = await db.pipelines.find_one(
        {"pipeline_id": pipeline_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not pipeline_doc:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Check access permissions
    if current_user.role == "KAM" and pipeline_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own pipelines"
        )
    
    # Convert datetime strings
    if isinstance(pipeline_doc.get('created_at'), str):
        pipeline_doc['created_at'] = datetime.fromisoformat(pipeline_doc['created_at'])
    if isinstance(pipeline_doc.get('updated_at'), str):
        pipeline_doc['updated_at'] = datetime.fromisoformat(pipeline_doc['updated_at'])
    if pipeline_doc.get('confirmation_date') and isinstance(pipeline_doc.get('confirmation_date'), str):
        pipeline_doc['confirmation_date'] = datetime.fromisoformat(pipeline_doc['confirmation_date'])
    
    return Pipeline(**pipeline_doc)


@router.put("/{pipeline_id}", response_model=Pipeline)
async def update_pipeline(
    pipeline_id: str,
    pipeline_data: PipelineCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update a pipeline
    - KAMs can only update their own pipelines
    - Super User can update any pipeline
    """
    # Find pipeline
    pipeline_doc = await db.pipelines.find_one(
        {"pipeline_id": pipeline_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not pipeline_doc:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Check permissions
    if current_user.role == "KAM" and pipeline_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own pipelines"
        )
    
    # Validate confirmation status and date
    if pipeline_data.confirmation_status == "Confirmed" and not pipeline_data.confirmation_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation date is required when status is Confirmed"
        )
    
    # If user is KAM, force kam_user_id to be their own ID
    if current_user.role == "KAM":
        pipeline_data.kam_user_id = current_user.user_id
    
    # Update pipeline
    update_dict = pipeline_data.model_dump()
    update_dict['updated_at'] = datetime.utcnow().isoformat()
    update_dict['updated_by'] = current_user.user_id
    if update_dict.get('confirmation_date'):
        update_dict['confirmation_date'] = update_dict['confirmation_date'].isoformat()
    
    await db.pipelines.update_one(
        {"pipeline_id": pipeline_id},
        {"$set": update_dict}
    )
    
    # Fetch updated pipeline
    updated_pipeline = await db.pipelines.find_one(
        {"pipeline_id": pipeline_id},
        {"_id": 0}
    )
    
    # Convert datetime strings
    if isinstance(updated_pipeline.get('created_at'), str):
        updated_pipeline['created_at'] = datetime.fromisoformat(updated_pipeline['created_at'])
    if isinstance(updated_pipeline.get('updated_at'), str):
        updated_pipeline['updated_at'] = datetime.fromisoformat(updated_pipeline['updated_at'])
    if updated_pipeline.get('confirmation_date') and isinstance(updated_pipeline.get('confirmation_date'), str):
        updated_pipeline['confirmation_date'] = datetime.fromisoformat(updated_pipeline['confirmation_date'])
    
    return Pipeline(**updated_pipeline)


@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pipeline(
    pipeline_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Delete a pipeline (soft delete)
    - KAMs can only delete their own pipelines
    - Super User can delete any pipeline
    """
    # Find pipeline
    pipeline_doc = await db.pipelines.find_one(
        {"pipeline_id": pipeline_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not pipeline_doc:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Check permissions
    if current_user.role == "KAM" and pipeline_doc['kam_user_id'] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own pipelines"
        )
    
    # Soft delete
    await db.pipelines.update_one(
        {"pipeline_id": pipeline_id},
        {
            "$set": {
                "is_deleted": True,
                "updated_at": datetime.utcnow().isoformat(),
                "updated_by": current_user.user_id
            }
        }
    )
    
    return None


@router.get("/delivered-pipelines", response_model=List[Pipeline])
async def get_delivered_pipelines(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get list of pipelines marked as delivered (Yes status)
    These can be converted to delivered records
    """
    # Build query
    query = {"is_deleted": False, "delivered_status": "Yes"}
    
    # Role-based filtering
    if current_user.role == "KAM":
        query["kam_user_id"] = current_user.user_id
    
    # Get pipelines
    pipelines = await db.pipelines.find(query, {"_id": 0}).sort("confirmation_date", -1).to_list(1000)
    
    # Convert datetime strings back to datetime objects
    for pipeline in pipelines:
        if isinstance(pipeline.get('created_at'), str):
            pipeline['created_at'] = datetime.fromisoformat(pipeline['created_at'])
        if isinstance(pipeline.get('updated_at'), str):
            pipeline['updated_at'] = datetime.fromisoformat(pipeline['updated_at'])
        if pipeline.get('confirmation_date') and isinstance(pipeline.get('confirmation_date'), str):
            pipeline['confirmation_date'] = datetime.fromisoformat(pipeline['confirmation_date'])
    
    return [Pipeline(**pipeline) for pipeline in pipelines]


@router.get("/stats/summary")
async def get_pipeline_summary(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
    kam_user_id: Optional[str] = Query(None)
):
    """
    Get pipeline summary statistics (total count and total value)
    """
    # Build query
    query = {"is_deleted": False, "confirmation_status": "Confirmed"}
    
    # Role-based filtering
    if current_user.role == "KAM":
        query["kam_user_id"] = current_user.user_id
    elif current_user.role == "SuperUser" and kam_user_id:
        query["kam_user_id"] = kam_user_id
    
    # Get pipelines
    pipelines = await db.pipelines.find(query, {"_id": 0}).to_list(1000)
    
    # Calculate summary
    total_count = len(pipelines)
    total_capacity_req = sum(p.get('capacity_req', 0) for p in pipelines)
    total_capacity_mrc = sum(p.get('capacity_mrc', 0) for p in pipelines)
    total_other_capacity_req = sum(p.get('other_cap_req', 0) for p in pipelines)
    total_other_capacity_mrc = sum(p.get('other_cap_mrc', 0) for p in pipelines)
    
    return {
        "total_count": total_count,
        "total_capacity_requirement": total_capacity_req,
        "total_capacity_mrc": total_capacity_mrc,
        "total_other_capacity_requirement": total_other_capacity_req,
        "total_other_capacity_mrc": total_other_capacity_mrc
    }
