import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import Activity
from app.schemas.activity import ActivityItem

def generate_activity_id() -> str:
    return f"act_{uuid.uuid4().hex[:8]}"

class ActivityService:
    @staticmethod
    def record(
        db: Session,
        project_id: str,
        type: str,
        status: str,
        title: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Activity:
        meta_info_str = json.dumps(metadata) if metadata is not None else None
        activity = Activity(
            id=generate_activity_id(),
            project_id=project_id,
            type=type,
            status=status,
            title=title,
            description=description,
            meta_info=meta_info_str,
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def get_activities(db: Session, project_id: str) -> List[Activity]:
        return (
            db.query(Activity)
            .filter(Activity.project_id == project_id)
            .order_by(Activity.created_at.desc())
            .all()
        )

    @staticmethod
    def to_item(activity: Activity) -> ActivityItem:
        parsed_meta = None
        if activity.meta_info:
            try:
                parsed_meta = json.loads(activity.meta_info)
            except Exception:
                parsed_meta = None

        timestamp_str = (
            activity.created_at.strftime("%Y-%m-%dT%H:%M:%SZ")
            if activity.created_at
            else datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        )

        return ActivityItem(
            id=activity.id,
            type=activity.type,
            status=activity.status,
            title=activity.title,
            description=activity.description,
            timestamp=timestamp_str,
            metadata=parsed_meta
        )
