"""
Dashboard routes for summary and analytics
"""
from fastapi import APIRouter, Depends, Query
from models import User
from dependencies import get_db, get_current_user
from typing import Optional
from datetime import datetime
from dateutil.relativedelta import relativedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_month_dates(month_str: str):
    """Get start and end dates for a given month (YYYY-MM format)"""
    year, month = map(int, month_str.split('-'))
    start_date = datetime(year, month, 1)
    # Get first day of next month
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    return start_date, end_date


@router.get("/monthly-summary")
async def get_monthly_summary(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
    kam_user_id: Optional[str] = Query(None, description="Filter by KAM (Super User only)")
):
    """
    Get 2-month summary (current and previous month)
    Returns aggregated data for meetings, pipelines, delivered
    """
    now = datetime.utcnow()
    current_month = now.strftime("%Y-%m")
    prev_month = (now - relativedelta(months=1)).strftime("%Y-%m")
    
    # Build base query
    base_query = {"is_deleted": False}
    if current_user.role == "KAM":
        base_query["kam_user_id"] = current_user.user_id
    elif current_user.role == "SuperUser" and kam_user_id:
        base_query["kam_user_id"] = kam_user_id
    
    async def get_month_stats(month_str: str):
        """Get stats for a specific month"""
        start_date, end_date = get_month_dates(month_str)
        
        # Meetings count
        meeting_query = {**base_query}
        meetings = await db.meetings.find({
            **meeting_query,
            "$expr": {
                "$and": [
                    {"$gte": [{"$dateFromString": {"dateString": "$created_at"}}, start_date.isoformat()]},
                    {"$lt": [{"$dateFromString": {"dateString": "$created_at"}}, end_date.isoformat()]}
                ]
            }
        }).to_list(1000)
        meetings_count = len(meetings)
        
        # Pipelines (confirmed)
        pipeline_query = {**base_query, "confirmation_status": "Confirmed"}
        pipelines = await db.pipelines.find({
            **pipeline_query,
            "$expr": {
                "$and": [
                    {"$gte": [{"$dateFromString": {"dateString": "$confirmation_date"}}, start_date.isoformat()]},
                    {"$lt": [{"$dateFromString": {"dateString": "$confirmation_date"}}, end_date.isoformat()]}
                ]
            }
        }).to_list(1000)
        pipeline_count = len(pipelines)
        pipeline_mrc = sum(p.get('capacity_mrc', 0) for p in pipelines)
        pipeline_otc = sum(p.get('capacity_otc', 0) for p in pipelines)
        
        # Delivered
        delivered_query = {**base_query}
        delivered = await db.delivered.find({
            **delivered_query,
            "$expr": {
                "$and": [
                    {"$gte": [{"$dateFromString": {"dateString": "$delivered_date"}}, start_date.isoformat()]},
                    {"$lt": [{"$dateFromString": {"dateString": "$delivered_date"}}, end_date.isoformat()]}
                ]
            }
        }).to_list(1000)
        delivered_count = len(delivered)
        delivered_mrc = sum(d.get('capacity_mrc', 0) for d in delivered)
        delivered_kpi = sum(d.get('kpi_score', 0) for d in delivered)
        
        return {
            "month": month_str,
            "meetings_count": meetings_count,
            "pipeline_count": pipeline_count,
            "pipeline_mrc": pipeline_mrc,
            "pipeline_otc": pipeline_otc,
            "delivered_count": delivered_count,
            "delivered_mrc": delivered_mrc,
            "delivered_kpi": delivered_kpi
        }
    
    # Get stats for both months
    current_stats = await get_month_stats(current_month)
    previous_stats = await get_month_stats(prev_month)
    
    return {
        "current_month": current_stats,
        "previous_month": previous_stats
    }


@router.get("/total-summary")
async def get_total_summary(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
    kam_user_id: Optional[str] = Query(None, description="Filter by KAM (Super User only)")
):
    """
    Get overall summary statistics
    """
    # Build base query
    base_query = {"is_deleted": False}
    if current_user.role == "KAM":
        base_query["kam_user_id"] = current_user.user_id
    elif current_user.role == "SuperUser" and kam_user_id:
        base_query["kam_user_id"] = kam_user_id
    
    # Meetings count
    meetings_count = await db.meetings.count_documents(base_query)
    
    # Pipelines (confirmed)
    pipeline_query = {**base_query, "confirmation_status": "Confirmed"}
    pipelines = await db.pipelines.find(pipeline_query, {"_id": 0}).to_list(1000)
    pipeline_count = len(pipelines)
    pipeline_mrc = sum(p.get('capacity_mrc', 0) for p in pipelines)
    
    # Delivered
    delivered = await db.delivered.find(base_query, {"_id": 0}).to_list(1000)
    delivered_count = len(delivered)
    delivered_mrc = sum(d.get('capacity_mrc', 0) for d in delivered)
    delivered_kpi = sum(d.get('kpi_score', 0) for d in delivered)
    
    return {
        "meetings_count": meetings_count,
        "pipeline_count": pipeline_count,
        "pipeline_mrc": pipeline_mrc,
        "delivered_count": delivered_count,
        "delivered_mrc": delivered_mrc,
        "delivered_kpi": delivered_kpi
    }
