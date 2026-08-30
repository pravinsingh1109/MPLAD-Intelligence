import os
import json
import urllib.request
import urllib.parse
import mimetypes

BASE_URL = "http://127.0.0.1:8000"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def post_json(path, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def delete_req(path):
    req = urllib.request.Request(f"{BASE_URL}{path}", method="DELETE")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def post_multipart(path, files):
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = bytearray()
    for field_name, file_path in files.items():
        if not file_path or not os.path.exists(file_path):
            continue
        filename = os.path.basename(file_path)
        body.extend(f'--{boundary}\r\n'.encode('utf-8'))
        body.extend(f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode('utf-8'))
        body.extend(b'Content-Type: text/csv\r\n\r\n')
        with open(file_path, 'rb') as f:
            body.extend(f.read())
        body.extend(b'\r\n')
    body.extend(f'--{boundary}--\r\n'.encode('utf-8'))

    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=bytes(body),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def run_end_to_end_test():
    print("==================================================")
    print("  MPLAD INTELLIGENCE -- END-TO-END WORKFLOW TEST  ")
    print("==================================================")

    # 1. Health check
    print("\n[Step 1] Health check...")
    st, data = get("/api/health")
    assert data["status"] == "ok"
    print(f"  -> Health OK (DB Connected, Active Workspaces: {data['active_workspaces_count']})")

    # 2. Seed / Reset Demo Workspace
    print("\n[Step 2] Testing Demo Workspace Loading (/api/workspaces/demo)...")
    st, demo_ws = post_json("/api/workspaces/demo", {})
    demo_id = demo_ws["id"]
    print(f"  -> Demo Workspace Ready: '{demo_ws['name']}' ({demo_id})")
    assert demo_ws["total_sanctioned_works"] == 220
    assert demo_ws["ml_anomaly_candidates_count"] == 7

    # 3. Query Demo Overview KPIs
    print(f"\n[Step 3] Querying KPIs for '{demo_id}'...")
    st, kpis = get(f"/api/overview/kpis?workspace_id={demo_id}")
    print(f"  -> Total Sanctioned: {kpis['total_sanctioned_works']}, Sanction Amount: INR {kpis['total_sanctioned_amount_cr']} Cr")
    assert kpis["total_sanctioned_works"] == 220
    assert kpis["critical_risk_count"] + kpis["high_risk_count"] > 0

    # 4. Query Risk Queue for Demo Workspace
    print(f"\n[Step 4] Querying Risk Queue for '{demo_id}'...")
    st, queue = get(f"/api/projects/risk-queue?workspace_id={demo_id}&page=1&page_size=5")
    assert len(queue["items"]) == 5
    top_project = queue["items"][0]
    work_id = top_project["id"]
    print(f"  -> Top Priority Project: {work_id} (S_risk = {top_project['risk_priority_score']})")

    # 5. Case Action and Investigation Notes
    print(f"\n[Step 5] Posting Action & Note on {work_id}...")
    encoded_id = urllib.parse.quote(work_id)
    st, action_res = post_json(f"/api/projects/{encoded_id}/investigation-action?workspace_id={demo_id}", {
        "action": "MARK_FOR_FIELD_VERIFICATION",
        "actor": "District Magistrate Audit Officer",
        "details": "Flagged for immediate on-site structural audit."
    })
    assert action_res["new_status"] == "MARKED FOR FIELD VERIFICATION"

    st, note_res = post_json(f"/api/projects/{encoded_id}/notes?workspace_id={demo_id}", {
        "note_text": "Field verification dispatched with executive engineer.",
        "officer_name": "District Magistrate Audit Officer"
    })
    assert note_res["id"] is not None

    st, audit_logs = get(f"/api/audit-logs?workspace_id={demo_id}")
    assert audit_logs["total"] >= 2
    print(f"  -> Case transitioned to '{action_res['new_status']}' and logged in audit trail.")

    # 6. Create New Custom Workspace
    print("\n[Step 6] Creating New Custom Workspace...")
    st, new_ws = post_json("/api/workspaces", {
        "name": "E2E Punjab Custom Test Session",
        "description": "Test dataset uploaded to verify dynamic ingestion and ML scoring"
    })
    custom_ws_id = new_ws["id"]
    print(f"  -> Created Custom Workspace: {new_ws['name']} ({custom_ws_id}), Status: {new_ws['status']}")

    # 7. Upload Raw CSVs to Custom Workspace
    print(f"\n[Step 7] Uploading CSV feeds to '{custom_ws_id}'...")
    sanct_file = os.path.join(DATA_DIR, 'sanctioned_works.csv')
    rec_file = os.path.join(DATA_DIR, 'recommended_works.csv')
    comp_file = os.path.join(DATA_DIR, 'completed_works.csv')

    st, clean_summary = post_multipart(f"/api/workspaces/{custom_ws_id}/upload", {
        "sanctioned_file": sanct_file,
        "recommended_file": rec_file,
        "completed_file": comp_file
    })
    print(f"  -> Upload & Clean Result: Sanctioned={clean_summary['sanctioned_count']}, Recommended={clean_summary['recommended_count']}, Completed={clean_summary['completed_count']}")
    assert clean_summary["sanctioned_count"] == 220
    assert clean_summary["status"] == "CLEANED"

    # 8. Execute ML Risk Analysis Synchronously
    print(f"\n[Step 8] Triggering Synchronous ML Risk Analysis on '{custom_ws_id}'...")
    st, ml_summary = post_json(f"/api/workspaces/{custom_ws_id}/analyze", {})
    print(f"  -> ML Scoring Complete! Total Scored: {ml_summary['total_scored']}, Anomalies: {ml_summary['anomalies_count']}, Critical: {ml_summary['critical_count']}")
    assert ml_summary["total_scored"] == 220
    assert ml_summary["status"] == "ACTIVE"

    # 9. Verify Custom Workspace KPIs
    print(f"\n[Step 9] Verifying KPIs in Custom Workspace '{custom_ws_id}'...")
    st, custom_kpis = get(f"/api/overview/kpis?workspace_id={custom_ws_id}")
    assert custom_kpis["total_sanctioned_works"] == 220
    print(f"  -> Custom Workspace KPIs Verified: INR {custom_kpis['total_sanctioned_amount_cr']} Cr")

    # 10. Test Clear Dataset
    print(f"\n[Step 10] Testing Clear Dataset on '{custom_ws_id}'...")
    st, clear_res = post_json(f"/api/workspaces/{custom_ws_id}/clear", {})
    assert clear_res["status"] == "cleared"
    st, cleared_kpis = get(f"/api/overview/kpis?workspace_id={custom_ws_id}")
    assert cleared_kpis["total_sanctioned_works"] == 0
    print(f"  -> Dataset Cleared: Total Sanctioned = {cleared_kpis['total_sanctioned_works']}")

    # 11. Test Delete Workspace (Cascade Deletion)
    print(f"\n[Step 11] Testing Cascade Delete on '{custom_ws_id}'...")
    st, del_res = delete_req(f"/api/workspaces/{custom_ws_id}")
    assert del_res["status"] == "deleted"
    print(f"  -> Workspace '{custom_ws_id}' successfully deleted.")

    # 12. Verify Demo Workspace Still Intact
    print(f"\n[Step 12] Verifying Demo Workspace '{demo_id}' context isolation...")
    st, final_demo_kpis = get(f"/api/overview/kpis?workspace_id={demo_id}")
    assert final_demo_kpis["total_sanctioned_works"] == 220
    print(f"  -> Demo Workspace 100% Intact ({final_demo_kpis['total_sanctioned_works']} works).")

    print("\n==================================================")
    print("  ALL 12 END-TO-END INTEGRATION TESTS PASSED!      ")
    print("==================================================")

if __name__ == "__main__":
    run_end_to_end_test()
