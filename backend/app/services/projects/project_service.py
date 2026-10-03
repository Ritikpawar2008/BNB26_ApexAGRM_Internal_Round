import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.entities import Project, Asset, Clip, Analysis, Export
from app.schemas.clip import ClipUpdateRequest

def generate_prefixed_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

class ProjectService:
    @staticmethod
    def create_project(db: Session, name: str) -> Project:
        project_id = generate_prefixed_id("proj")
        project = Project(
            id=project_id,
            name=name,
            status="idle"
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_project(db: Session, project_id: str) -> Optional[Project]:
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def get_all_projects(db: Session) -> List[Project]:
        return db.query(Project).order_by(Project.created_at.desc()).all()

    @staticmethod
    def create_asset(db: Session, project_id: str, file_info: dict) -> Asset:
        asset_id = generate_prefixed_id("asset")
        asset = Asset(
            id=asset_id,
            project_id=project_id,
            filename=file_info["filename"],
            storage_path=file_info["storage_path"],
            mime_type=file_info["mime_type"],
            file_size=file_info["file_size"],
            duration=file_info.get("duration", 0.0)
        )
        db.add(asset)
        
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project.status = "uploaded"
            
        db.commit()
        db.refresh(asset)
        return asset

    @staticmethod
    def get_asset_for_project(db: Session, project_id: str) -> Optional[Asset]:
        return db.query(Asset).filter(Asset.project_id == project_id).first()

    @staticmethod
    def save_analysis_and_clips(db: Session, project_id: str, summary: str, clip_recs: list) -> tuple[Analysis, List[Clip]]:
        # Remove existing clips for re-analysis
        db.query(Clip).filter(Clip.project_id == project_id).delete()
        
        analysis_id = str(uuid.uuid4())
        analysis = Analysis(
            id=analysis_id,
            project_id=project_id,
            summary=summary,
            status="completed"
        )
        db.add(analysis)

        clips = []
        for idx, rec in enumerate(clip_recs):
            clip_id = generate_prefixed_id("clip")
            relative_url = f"/storage/clips/{project_id}_{clip_id}.mp4"
            clip = Clip(
                id=clip_id,
                project_id=project_id,
                position=idx,
                start_time=rec.start_time,
                end_time=rec.end_time,
                title=rec.title,
                reason=rec.reason,
                hook=rec.hook,
                caption=rec.caption,
                confidence=rec.confidence,
                clip_path=relative_url,
                is_selected=True
            )
            db.add(clip)

            clips.append(clip)

        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project.status = "ready"

        db.commit()
        db.refresh(analysis)
        return analysis, clips

    @staticmethod
    def get_clips_for_project(db: Session, project_id: str, selected_only: bool = False) -> List[Clip]:
        query = db.query(Clip).filter(Clip.project_id == project_id)
        if selected_only:
            query = query.filter(Clip.is_selected == True)
        return query.order_by(Clip.position.asc()).all()

    @staticmethod
    def update_clips(db: Session, project_id: str, clip_updates: List[ClipUpdateRequest]) -> int:
        updated_count = 0
        for update in clip_updates:
            clip = db.query(Clip).filter(Clip.project_id == project_id, Clip.id == update.id).first()
            if clip:
                if update.position is not None:
                    clip.position = update.position
                if update.hook is not None:
                    clip.hook = update.hook
                if update.caption is not None:
                    clip.caption = update.caption
                if update.is_selected is not None:
                    clip.is_selected = update.is_selected
                updated_count += 1
        db.commit()
        return updated_count

    @staticmethod
    def create_export(db: Session, project_id: str, export_format: str, export_path: str, total_duration: float) -> Export:
        export_id = generate_prefixed_id("exp")
        export = Export(
            id=export_id,
            project_id=project_id,
            export_path=export_path,
            format=export_format,
            total_duration=total_duration,
            status="ready"
        )
        db.add(export)
        
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project.status = "completed"
            
        db.commit()
        db.refresh(export)
        return export

