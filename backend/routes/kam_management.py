"""
KAM Profile and Ranking routes (Super User only)
"""
from fastapi import APIRouter, HTTPException, status, Depends
from models import User
from dependencies import get_db, get_super_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/kam", tags=["KAM Management"])


@router.get("/profiles")
async def get_all_kam_profiles(
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Get all KAM profiles with their statistics (Super User only)
    """
    # Get all active KAMs
    kams = await db.users.find(
        {"role": "KAM", "status": "Active"},
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    
    profiles = []
    
    for kam in kams:
        kam_id = kam['user_id']
        
        # Get statistics for this KAM
        meetings_count = await db.meetings.count_documents({"kam_user_id": kam_id, "is_deleted": False})
        pipelines_count = await db.pipelines.count_documents({"kam_user_id": kam_id, "is_deleted": False, "confirmation_status": "Confirmed"})
        delivered_count = await db.delivered.count_documents({"kam_user_id": kam_id, "is_deleted": False})
        
        # Get total KPI score
        delivered_records = await db.delivered.find(
            {"kam_user_id": kam_id, "is_deleted": False},
            {"_id": 0}
        ).to_list(1000)
        
        total_kpi_score = sum(d.get('kpi_score', 0) for d in delivered_records)
        total_revenue = sum(d.get('capacity_mrc', 0) for d in delivered_records)
        
        # Get current month KPI assignment
        current_month = datetime.utcnow().strftime("%Y-%m")
        kpi_assignment = await db.kpi_assignments.find_one(
            {"kam_user_id": kam_id, "month": current_month, "is_deleted": False},
            {"_id": 0}
        )
        
        profile = {
            "user_id": kam['user_id'],
            "name": kam['name'],
            "email": kam['email'],
            "mobile": kam.get('mobile'),
            "total_meetings": meetings_count,
            "total_pipelines": pipelines_count,
            "total_delivered": delivered_count,
            "total_kpi_score": total_kpi_score,
            "total_revenue": total_revenue,
            "current_month_target": kpi_assignment.get('kpi_score_target') if kpi_assignment else 0,
            "current_month_achieved": total_kpi_score,
            "achievement_percentage": round((total_kpi_score / kpi_assignment.get('kpi_score_target', 1)) * 100, 2) if kpi_assignment else 0
        }
        
        profiles.append(profile)
    
    return profiles


@router.get("/profile/{kam_user_id}")
async def get_kam_profile(
    kam_user_id: str,
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Get detailed profile for a specific KAM (Super User only)
    """
    # Get KAM user
    kam = await db.users.find_one(
        {"user_id": kam_user_id, "role": "KAM"},
        {"_id": 0, "password_hash": 0}
    )
    
    if not kam:
        raise HTTPException(status_code=404, detail="KAM not found")
    
    # Get all meetings
    meetings = await db.meetings.find(
        {"kam_user_id": kam_user_id, "is_deleted": False},
        {"_id": 0}
    ).to_list(1000)
    
    # Get all pipelines
    pipelines = await db.pipelines.find(
        {"kam_user_id": kam_user_id, "is_deleted": False},
        {"_id": 0}
    ).to_list(1000)
    
    # Get all delivered
    delivered = await db.delivered.find(
        {"kam_user_id": kam_user_id, "is_deleted": False},
        {"_id": 0}
    ).to_list(1000)
    
    # Get KPI assignments
    kpi_assignments = await db.kpi_assignments.find(
        {"kam_user_id": kam_user_id, "is_deleted": False},
        {"_id": 0}
    ).sort("month", -1).to_list(100)
    
    # Calculate statistics
    total_kpi_score = sum(d.get('kpi_score', 0) for d in delivered)
    total_revenue = sum(d.get('capacity_mrc', 0) for d in delivered)
    total_capacity = sum(d.get('capacity_req', 0) for d in delivered)
    
    # Convert datetime strings
    for meeting in meetings:
        if isinstance(meeting.get('created_at'), str):
            meeting['created_at'] = datetime.fromisoformat(meeting['created_at'])
        if isinstance(meeting.get('updated_at'), str):
            meeting['updated_at'] = datetime.fromisoformat(meeting['updated_at'])
    
    for pipeline in pipelines:
        if isinstance(pipeline.get('created_at'), str):
            pipeline['created_at'] = datetime.fromisoformat(pipeline['created_at'])
        if isinstance(pipeline.get('updated_at'), str):
            pipeline['updated_at'] = datetime.fromisoformat(pipeline['updated_at'])
        if pipeline.get('confirmation_date') and isinstance(pipeline.get('confirmation_date'), str):
            pipeline['confirmation_date'] = datetime.fromisoformat(pipeline['confirmation_date'])
    
    for d in delivered:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
        if isinstance(d.get('updated_at'), str):
            d['updated_at'] = datetime.fromisoformat(d['updated_at'])
        if isinstance(d.get('delivered_date'), str):
            d['delivered_date'] = datetime.fromisoformat(d['delivered_date'])
    
    for kpi in kpi_assignments:
        if isinstance(kpi.get('created_at'), str):
            kpi['created_at'] = datetime.fromisoformat(kpi['created_at'])
        if isinstance(kpi.get('updated_at'), str):
            kpi['updated_at'] = datetime.fromisoformat(kpi['updated_at'])
    
    # Convert datetime back for user
    if isinstance(kam.get('created_at'), str):
        kam['created_at'] = datetime.fromisoformat(kam['created_at'])
    if isinstance(kam.get('updated_at'), str):
        kam['updated_at'] = datetime.fromisoformat(kam['updated_at'])
    if kam.get('last_login_at') and isinstance(kam.get('last_login_at'), str):
        kam['last_login_at'] = datetime.fromisoformat(kam['last_login_at'])
    
    return {
        "kam_info": kam,
        "statistics": {
            "total_meetings": len(meetings),
            "total_pipelines": len(pipelines),
            "total_delivered": len(delivered),
            "total_kpi_score": total_kpi_score,
            "total_revenue": total_revenue,
            "total_capacity": total_capacity
        },
        "meetings": meetings,
        "pipelines": pipelines,
        "delivered": delivered,
        "kpi_assignments": kpi_assignments
    }


@router.get("/rankings")
async def get_kam_rankings(
    current_user: User = Depends(get_super_user),
    db = Depends(get_db)
):
    """
    Get KAM rankings based on KPI score (Super User only)
    """
    # Get all active KAMs
    kams = await db.users.find(
        {"role": "KAM", "status": "Active"},
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    
    rankings = []
    
    for kam in kams:
        kam_id = kam['user_id']
        
        # Get delivered records to calculate KPI score
        delivered_records = await db.delivered.find(
            {"kam_user_id": kam_id, "is_deleted": False},
            {"_id": 0}
        ).to_list(1000)
        
        total_kpi_score = sum(d.get('kpi_score', 0) for d in delivered_records)
        total_revenue = sum(d.get('capacity_mrc', 0) for d in delivered_records)
        total_delivered = len(delivered_records)
        
        # Get current month target
        current_month = datetime.utcnow().strftime("%Y-%m")
        kpi_assignment = await db.kpi_assignments.find_one(
            {"kam_user_id": kam_id, "month": current_month, "is_deleted": False},
            {"_id": 0}
        )
        
        target = kpi_assignment.get('kpi_score_target', 0) if kpi_assignment else 0
        achievement_percentage = round((total_kpi_score / target * 100), 2) if target > 0 else 0
        
        rankings.append({
            "rank": 0,  # Will be calculated after sorting
            "user_id": kam['user_id'],
            "name": kam['name'],
            "email": kam['email'],
            "total_kpi_score": total_kpi_score,
            "total_revenue": total_revenue,
            "total_delivered": total_delivered,
            "current_month_target": target,
            "achievement_percentage": achievement_percentage
        })
    
    # Sort by KPI score (descending)
    rankings.sort(key=lambda x: x['total_kpi_score'], reverse=True)
    
    # Assign ranks
    for idx, ranking in enumerate(rankings):
        ranking['rank'] = idx + 1
    
    return rankings
