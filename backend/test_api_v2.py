import urllib.request
import json
import urllib.parse

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def post_json(path, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def test_api():
    print("Testing /api/health...")
    status, data = get("/api/health")
    print(f"Health: {status}, {data}")
    assert data["status"] == "ok"

    print("\nTesting /api/workspaces...")
    status, data = get("/api/workspaces")
    print(f"Workspaces: {status}, Total: {data['total']}")
    assert data["total"] >= 1
    demo_ws = data["items"][0]
    ws_id = demo_ws["id"]
    print(f"Demo Workspace ID: {ws_id}")

    print(f"\nTesting /api/overview/kpis?workspace_id={ws_id}...")
    status, data = get(f"/api/overview/kpis?workspace_id={ws_id}")
    print(f"KPIs: {status}, Total Sanctioned: {data['total_sanctioned_works']}, Anomalies: {data['ml_anomaly_candidates_count']}")
    assert data["total_sanctioned_works"] == 220

    print(f"\nTesting /api/projects/risk-queue?workspace_id={ws_id}&page=1&page_size=5...")
    status, data = get(f"/api/projects/risk-queue?workspace_id={ws_id}&page=1&page_size=5")
    print(f"Risk Queue: {status}, Total: {data['total']}, Items: {len(data['items'])}")
    assert len(data["items"]) == 5
    top_work = data["items"][0]
    work_id = top_work["id"]
    print(f"Top Work ID: {work_id}, S_risk: {top_work['risk_priority_score']}")

    print(f"\nTesting /api/projects/{urllib.parse.quote(work_id)}/intelligence?workspace_id={ws_id}...")
    status, data = get(f"/api/projects/{urllib.parse.quote(work_id)}/intelligence?workspace_id={ws_id}")
    print(f"Intelligence: {status}, Title: {data['title'][:40]}...")

    print(f"\nTesting missing workspace_id error handling on /api/overview/kpis...")
    try:
        get("/api/overview/kpis")
        print("[FAIL] Should have failed with missing workspace_id")
    except urllib.error.HTTPError as e:
        print(f"[OK] Correctly rejected with status {e.code}")

    print("\nALL BACKEND API TESTS PASSED!")

if __name__ == "__main__":
    test_api()
