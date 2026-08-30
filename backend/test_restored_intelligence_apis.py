import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import app

client = TestClient(app)

def test_restored_intelligence():
    print("=" * 50)
    print("  TESTING RESTORED INTELLIGENCE APIS")
    print("=" * 50)

    # 1. Load Demo Workspace
    print("\n[Test 1] Loading Demo Workspace...")
    resp = client.post("/api/workspaces/demo")
    assert resp.status_code == 200, f"Failed with {resp.status_code}: {resp.text}"
    demo_ws = resp.json()
    ws_id = demo_ws["id"]
    print(f"  -> Demo workspace ready: {ws_id}")

    # 2. Test Early Warnings API
    print("\n[Test 2] Testing /api/overview/early-warnings...")
    ew_resp = client.get(f"/api/overview/early-warnings?workspace_id={ws_id}")
    assert ew_resp.status_code == 200
    ew_data = ew_resp.json()
    print(f"  -> Total early warning signals: {ew_data['total_warnings']}")
    assert "warnings" in ew_data
    print("  -> [PASS] Early warnings API returned valid signals.")

    # 3. Test Contractors Intelligence API
    print("\n[Test 3] Testing /api/contractors (graceful degradation if absent)...")
    c_resp = client.get(f"/api/contractors?workspace_id={ws_id}")
    assert c_resp.status_code == 200
    c_data = c_resp.json()
    print(f"  -> Has contractor data: {c_data.get('has_contractor_data')}")
    print(f"  -> Message: {c_data.get('message')}")
    assert "contractors" in c_data
    print("  -> [PASS] Contractor Intel returned compliant payload.")

    # 4. Test District & IDA Matrix API
    print("\n[Test 4] Testing /api/matrix/district-ida...")
    mat_resp = client.get(f"/api/matrix/district-ida?workspace_id={ws_id}")
    assert mat_resp.status_code == 200
    mat_data = mat_resp.json()
    print(f"  -> Total cross-tabulated cells: {mat_data['total_cells']}")
    print(f"  -> Districts: {mat_data['districts']}, IDAs: {mat_data['idas']}")
    assert len(mat_data["matrix"]) > 0
    print("  -> [PASS] District & IDA matrix populated successfully.")

    # 5. Test Data Lineage API
    print("\n[Test 5] Testing /api/lineage/{work_id}...")
    sample_work_id = "WS/MP18157/2024-2025/163249"
    lin_resp = client.get(f"/api/lineage/{sample_work_id}?workspace_id={ws_id}")
    assert lin_resp.status_code == 200
    lin_data = lin_resp.json()
    assert lin_data["work_id"] == sample_work_id
    assert len(lin_data["pipeline_stages"]) == 5
    print(f"  -> Lineage stages verified: {len(lin_data['pipeline_stages'])} stages")
    print(f"  -> Raw sanctioned title: '{lin_data['source_data']['raw_sanctioned_row']['title'][:40]}...'")
    print("  -> [PASS] Data Lineage traceability verified.")

    # 6. Test Executive Command Summary PDF
    print("\n[Test 6] Testing /api/reports/executive/pdf...")
    exec_pdf_resp = client.get(f"/api/reports/executive/pdf?workspace_id={ws_id}")
    assert exec_pdf_resp.status_code == 200
    assert exec_pdf_resp.headers["content-type"] == "application/pdf"
    assert len(exec_pdf_resp.content) > 1000
    print(f"  -> Executive PDF generated: {len(exec_pdf_resp.content)} bytes")
    print("  -> [PASS] Executive PDF report downloaded successfully.")

    print("\n" + "=" * 50)
    print("  ALL RESTORED INTELLIGENCE APIS PASSED 100%!")
    print("=" * 50)

if __name__ == "__main__":
    test_restored_intelligence()
