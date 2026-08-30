import os
import json
import urllib.request
import urllib.parse

BASE_URL = "http://127.0.0.1:8000"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')

def post_json(path, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def post_multipart(path, files):
    boundary = '----WebKitFormBoundarySampleTest123'
    body = bytearray()
    for field_name, file_path_or_content in files.items():
        if isinstance(file_path_or_content, tuple):
            filename, content_str = file_path_or_content
            file_bytes = content_str.encode('utf-8')
        else:
            filename = os.path.basename(file_path_or_content)
            with open(file_path_or_content, 'rb') as f:
                file_bytes = f.read()

        body.extend(f'--{boundary}\r\n'.encode('utf-8'))
        body.extend(f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode('utf-8'))
        body.extend(b'Content-Type: text/csv\r\n\r\n')
        body.extend(file_bytes)
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

def test_upload_and_schema_validation():
    print("==================================================")
    print("  TESTING CANONICAL SCHEMA & UPLOAD WORKFLOW       ")
    print("==================================================")

    # 1. Test Intentionally Invalid CSV Rejection
    print("\n[Test 1] Uploading Intentionally Invalid CSV (Missing Work ID & Amount)...")
    st, ws_inv = post_json("/api/workspaces", {"name": "Invalid Schema Test WS"})
    inv_id = ws_inv["id"]
    
    invalid_csv_content = "Name,Age,City,Remarks\nJohn Doe,45,Mumbai,Test\nJane Smith,32,Delhi,Test"
    try:
        post_multipart(f"/api/workspaces/{inv_id}/upload", {
            "sanctioned_file": ("invalid_sample.csv", invalid_csv_content)
        })
        print("  [FAIL] Invalid CSV was not rejected!")
        assert False
    except urllib.error.HTTPError as e:
        err_body = json.loads(e.read().decode('utf-8'))
        print(f"  -> [OK] Correctly rejected with HTTP {e.code}")
        print(f"  -> Error Message:\n{err_body.get('detail')}")
        assert "Missing Required Columns:" in err_body.get("detail", "")
        assert "Detected Columns in File:" in err_body.get("detail", "")

    # 2. Test Uploading mplad_sample_500.csv
    sample_500_path = os.path.join(DATA_DIR, 'mplad_sample_500.csv')
    assert os.path.exists(sample_500_path), f"File not found: {sample_500_path}"

    print(f"\n[Test 2] Uploading '{sample_500_path}' (500 records sample)...")
    st, ws_500 = post_json("/api/workspaces", {"name": "Sample 500 National Test"})
    ws_500_id = ws_500["id"]

    st, clean_res = post_multipart(f"/api/workspaces/{ws_500_id}/upload", {
        "sanctioned_file": sample_500_path
    })
    print(f"  -> Upload Response: Status={clean_res['status']}, Sanctioned={clean_res['sanctioned_count']}, Auto-Completed={clean_res['completed_count']}")
    assert clean_res["sanctioned_count"] >= 500
    assert clean_res["status"] == "CLEANED"
    assert len(clean_res["normalized_columns"]) >= 5
    print("  -> Canonical Columns Matched:")
    for col in clean_res["normalized_columns"]:
        print(f"     • {col['label']} -> '{col['matched_column']}'")

    # 3. Test Running ML Pipeline on Sample 500
    print(f"\n[Test 3] Executing Pure Python ML Scoring on 500 records...")
    st, ml_res = post_json(f"/api/workspaces/{ws_500_id}/analyze", {})
    print(f"  -> ML Complete! Total Scored={ml_res['total_scored']}, Anomalies={ml_res['anomalies_count']}, Critical={ml_res['critical_count']}, High={ml_res['high_count']}")
    assert ml_res["total_scored"] >= 500
    assert ml_res["status"] == "ACTIVE"

    # 4. Verify Overview KPIs for Sample 500
    print(f"\n[Test 4] Verifying KPIs for Sample 500 Workspace...")
    st, kpis_500 = get(f"/api/overview/kpis?workspace_id={ws_500_id}")
    print(f"  -> Total Sanctioned Works: {kpis_500['total_sanctioned_works']}, Outlay: INR {kpis_500['total_sanctioned_amount_cr']} Cr")
    assert kpis_500["total_sanctioned_works"] >= 500

    # 5. Verify Risk Queue for Sample 500
    print(f"\n[Test 5] Querying Risk Queue for Sample 500 Workspace...")
    st, queue_500 = get(f"/api/projects/risk-queue?workspace_id={ws_500_id}&page=1&page_size=3")
    print(f"  -> Top Anomaly in 500 Dataset: {queue_500['items'][0]['id']} (S_risk = {queue_500['items'][0]['risk_priority_score']})")

    # 6. Verify Demo Workspace Still 100% Intact
    print(f"\n[Test 6] Verifying Demo Workspace Regression...")
    st, demo_kpis = get("/api/overview/kpis?workspace_id=demo-ludhiana")
    assert demo_kpis["total_sanctioned_works"] == 220
    print("  -> Demo Workspace intact with 220 works.")

    print("\n==================================================")
    print("  ALL CANONICAL SCHEMA & NORMALIZATION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_upload_and_schema_validation()
