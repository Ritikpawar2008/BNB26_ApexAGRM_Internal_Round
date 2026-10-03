import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import SessionLocal
from app.services.projects.project_service import ProjectService
from app.services.activity.activity_service import ActivityService

client = TestClient(app)

def test_activity_statuses_and_ordering():
    db = SessionLocal()
    try:
        # Create a test project
        project = ProjectService.create_project(db, name="Test Activity Project")
        pid = project.id

        # Record activities with all 4 statuses
        act1 = ActivityService.record(
            db, project_id=pid, type="test_in_progress", status="in_progress",
            title="Task Started", description="Processing item...", metadata={"step": 1}
        )
        time.sleep(0.05)

        act2 = ActivityService.record(
            db, project_id=pid, type="test_warning", status="warning",
            title="Resource Warning", description="High memory usage", metadata={"memory_mb": 512}
        )
        time.sleep(0.05)

        act3 = ActivityService.record(
            db, project_id=pid, type="test_failed", status="failed",
            title="Task Failed", description="Network timeout occurred", metadata={"error_code": "ETIMEDOUT"}
        )
        time.sleep(0.05)

        act4 = ActivityService.record(
            db, project_id=pid, type="test_completed", status="completed",
            title="Task Finished", description="Finished with success", metadata={"total_items": 10}
        )

        # Retrieve activities
        activities = ActivityService.get_activities(db, pid)
        assert len(activities) == 4

        # Verify newest first (chronological order)
        assert activities[0].id == act4.id
        assert activities[1].id == act3.id
        assert activities[2].id == act2.id
        assert activities[3].id == act1.id

        # Verify all 4 statuses present
        statuses = {a.status for a in activities}
        assert statuses == {"completed", "in_progress", "warning", "failed"}
    finally:
        db.close()

def test_activity_endpoint_and_lifecycle_hooks():
    # 1. Create project
    res_proj = client.post("/api/projects", json={"name": "Lifecycle Activity Test"})
    assert res_proj.status_code == 201
    pid = res_proj.json()["data"]["id"]

    # 2. Upload video asset
    file_content = b"sample video content for activity test"
    files = {"file": ("activity_test.mp4", file_content, "video/mp4")}
    res_upload = client.post(f"/api/projects/{pid}/upload", files=files)
    assert res_upload.status_code == 200

    # 3. Analyze project
    res_analyze = client.post(f"/api/projects/{pid}/analyze")
    assert res_analyze.status_code == 200

    # 4. Export project
    res_export = client.post(f"/api/projects/{pid}/export", json={"format": "9:16"})
    assert res_export.status_code == 200

    # 5. Get activity list endpoint
    res_act = client.get(f"/api/projects/{pid}/activity")
    assert res_act.status_code == 200
    json_body = res_act.json()
    assert json_body["success"] is True
    
    activity_items = json_body["data"]["activities"]
    assert len(activity_items) >= 4

    # Verify structure of items
    first_item = activity_items[0]
    assert "id" in first_item
    assert "type" in first_item
    assert "status" in first_item
    assert "title" in first_item
    assert "description" in first_item
    assert "timestamp" in first_item
    assert "metadata" in first_item

    # Verify types captured across lifecycle
    types_recorded = [item["type"] for item in activity_items]
    assert "export_completed" in types_recorded
    assert "analysis_completed" in types_recorded
    assert "analysis_started" in types_recorded
    assert "video_uploaded" in types_recorded
