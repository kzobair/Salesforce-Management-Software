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
    - If delivered_status is 'Yes', automatically creates a delivered record with KPI score
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
    
    # If delivered_status is 'Yes', create delivered record with KPI score
    if pipeline_data.delivered_status == "Yes":
        kpi_score = 10.0  # Default score per delivery
        pipeline_doc_for_delivered = {**pipeline_dict, 'pipeline_id': pipeline.pipeline_id}
        await create_delivered_from_pipeline(db, pipeline_doc_for_delivered, current_user.user_id, kpi_score)
    
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


async def generate_delivered_serial_number(db, prefix: str = "DEL") -> str:
    """Generate serial number for delivered"""
    year = datetime.utcnow().year
    
    # Get all records with proper serial number format for this year
    cursor = db.delivered.find(
        {"serial_number": {"$regex": f"^{prefix}-{year}-\\d+$"}},
        sort=[("serial_number", -1)]
    )
    
    # Find the highest valid number
    max_num = 0
    async for record in cursor:
        try:
            num_str = record['serial_number'].split('-')[-1]
            num = int(num_str)
            if num > max_num:
                max_num = num
        except (ValueError, IndexError):
            continue
    
    return f"{prefix}-{year}-{max_num + 1:04d}"


async def create_delivered_from_pipeline(db, pipeline_doc: dict, current_user_id: str, kpi_score: float = 10.0):
    """
    Create a delivered record from a pipeline when delivered_status is set to Yes
    """
    import uuid
    
    # Check if delivered record already exists for this pipeline
    existing = await db.delivered.find_one({
        "pipeline_id": pipeline_doc['pipeline_id'],
        "is_deleted": False
    })
    
    if existing:
        # Update existing delivered record's KPI score
        await db.delivered.update_one(
            {"delivered_id": existing['delivered_id']},
            {"$set": {"kpi_score": kpi_score, "updated_at": datetime.utcnow().isoformat()}}
        )
        return existing['delivered_id']
    
    # Generate serial number
    serial_number = await generate_delivered_serial_number(db, "DEL")
    
    # Create delivered record
    delivered_doc = {
        "delivered_id": str(uuid.uuid4()),
        "serial_number": serial_number,
        "client_name": pipeline_doc['client_name'],
        "client_address": pipeline_doc['client_address'],
        "contact_name": pipeline_doc['contact_name'],
        "contact_number": pipeline_doc['contact_number'],
        "capacity_req": pipeline_doc['capacity_req'],
        "capacity_unit": pipeline_doc.get('capacity_unit', 'Mbps'),
        "capacity_mrc": pipeline_doc['capacity_mrc'],
        "capacity_mrc_currency": pipeline_doc.get('capacity_mrc_currency', 'BDT'),
        "capacity_otc": pipeline_doc.get('capacity_otc', 0),
        "capacity_otc_currency": pipeline_doc.get('capacity_otc_currency', 'BDT'),
        "other_cap_req": pipeline_doc.get('other_cap_req', 0),
        "other_cap_unit": pipeline_doc.get('other_cap_unit', 'Mbps'),
        "other_cap_mrc": pipeline_doc.get('other_cap_mrc', 0),
        "other_cap_mrc_currency": pipeline_doc.get('other_cap_mrc_currency', 'BDT'),
        "other_cap_otc": pipeline_doc.get('other_cap_otc', 0),
        "other_cap_otc_currency": pipeline_doc.get('other_cap_otc_currency', 'BDT'),
        "kam_user_id": pipeline_doc['kam_user_id'],
        "pipeline_id": pipeline_doc['pipeline_id'],
        "kpi_score": kpi_score,
        "delivered_date": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "created_by": current_user_id,
        "updated_by": current_user_id,
        "is_deleted": False
    }
    
    await db.delivered.insert_one(delivered_doc)
    return delivered_doc['delivered_id']


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
    - When delivered_status is set to 'Yes', automatically creates a delivered record with KPI score
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
    
    # Check if delivered_status is changing to 'Yes'
    old_delivered_status = pipeline_doc.get('delivered_status', 'Pending')
    new_delivered_status = pipeline_data.delivered_status
    
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
    
    # If delivered_status changed to 'Yes', create/update delivered record with KPI score
    if new_delivered_status == "Yes":
        # Get KPI score from KPI assignment (default to 10 if not assigned)
        current_month = datetime.utcnow().strftime("%Y-%m")
        kpi_assignment = await db.kpi_assignments.find_one({
            "kam_user_id": pipeline_data.kam_user_id,
            "month": current_month,
            "is_deleted": False
        })
        
        # Calculate KPI score based on MRC value (or use a fixed score per delivery)
        # Default: 10 points per delivery, or proportional to target
        kpi_score = 10.0  # Default score per delivery
        if kpi_assignment and kpi_assignment.get('kpi_score_target'):
            # Each delivery contributes a portion towards the target
            kpi_score = 10.0  # Fixed score per delivery
        
        # Create delivered record with pipeline data
        pipeline_doc_updated = {**pipeline_doc, **update_dict, 'pipeline_id': pipeline_id}
        await create_delivered_from_pipeline(db, pipeline_doc_updated, current_user.user_id, kpi_score)
    
    # If delivered_status changed FROM 'Yes' to something else, soft-delete the delivered record
    elif old_delivered_status == "Yes" and new_delivered_status != "Yes":
        await db.delivered.update_one(
            {"pipeline_id": pipeline_id, "is_deleted": False},
            {"$set": {
                "is_deleted": True,
                "updated_at": datetime.utcnow().isoformat(),
                "updated_by": current_user.user_id
            }}
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
