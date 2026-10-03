import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_full_project_workflow():
    # 1. Create project
    res = client.post("/api/projects", json={"name": "Test AI Project"})
    assert res.status_code == 201
    json_data = res.json()
    assert json_data["success"] is True
    project_id = json_data["data"]["id"]
    assert project_id.startswith("proj_")
    assert json_data["data"]["name"] == "Test AI Project"

    # 2. Upload video asset
    file_content = b"fake video content for testing"
    files = {"file": ("test_video.mp4", file_content, "video/mp4")}
    res_upload = client.post(f"/api/projects/{project_id}/upload", files=files)
    assert res_upload.status_code == 200
    upload_data = res_upload.json()
    assert upload_data["success"] is True
    assert upload_data["data"]["filename"] == "test_video.mp4"
    assert upload_data["data"]["status"] == "uploaded"

    # 3. Trigger analysis
    res_analyze = client.post(f"/api/projects/{project_id}/analyze")
    assert res_analyze.status_code == 200
    analyze_data = res_analyze.json()
    assert analyze_data["success"] is True
    assert analyze_data["data"]["status"] == "ready"
    assert analyze_data["data"]["clips_count"] > 0

    # 4. Get project detail
    res_detail = client.get(f"/api/projects/{project_id}")
    assert res_detail.status_code == 200
    detail_data = res_detail.json()
    assert detail_data["success"] is True
    assert detail_data["data"]["asset"]["filename"] == "test_video.mp4"
    assert len(detail_data["data"]["clips"]) > 0

    # 5. Update clips
    clip_id = detail_data["data"]["clips"][0]["id"]
    res_clips = client.post(f"/api/projects/{project_id}/clips", json={
        "clips": [
            {
                "id": clip_id,
                "hook": "Updated Test Hook",
                "caption": "Updated Test Caption",
                "is_selected": True
            }
        ]
    })
    assert res_clips.status_code == 200
    assert res_clips.json()["data"]["updated_count"] == 1

    # 6. Export video
    res_export = client.post(f"/api/projects/{project_id}/export", json={"format": "9:16"})
    assert res_export.status_code == 200
    export_data = res_export.json()
    assert export_data["success"] is True
    assert export_data["data"]["export_id"].startswith("exp_")
    assert "download_url" in export_data["data"]

