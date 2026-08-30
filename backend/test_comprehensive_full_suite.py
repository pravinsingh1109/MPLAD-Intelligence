import sys
import os
import io
import csv
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import app

client = TestClient(app)

def run_comprehensive_test_suite():
    print("=" * 70)
    print("  MPLAD INTELLIGENCE (SIH26102) — COMPREHENSIVE END-TO-END SUITE")
    print("=" * 70)

    # ==================================================
    # SCENARIO 1: LOAD DEMO DATASET & FULL SUITE
    # ==================================================
    print("\n[SCENARIO 1] Demo Dataset Verification & Complete Intelligence Modules...")
    demo_resp = client.post("/api/workspaces/demo")
    assert demo_resp.status_code == 200, f"Demo loading failed: {demo_resp.text}"
    demo_ws = demo_resp.json()
    ws_id = demo_ws["id"]
    print(f"  [1.1] Demo Workspace Loaded: ID='{ws_id}', Total Works={demo_ws['total_sanctioned_works']}")

    # Command Center KPIs
    kpi_resp = client.get(f"/api/overview/kpis?workspace_id={ws_id}")
    assert kpi_resp.status_code == 200
    kpis = kpi_resp.json()
    assert kpis["total_sanctioned_works"] == 220
    print(f"  [1.2] Command Center KPIs: Monitored Works={kpis['total_sanctioned_works']}, Sanctioned Outlay=INR {kpis['total_sanctioned_amount_cr']:.2f} Cr, Anomalies={kpis['ml_anomaly_candidates_count']}")

    # Early Warnings
    ew_resp = client.get(f"/api/overview/early-warnings?workspace_id={ws_id}")
    assert ew_resp.status_code == 200
    ews = ew_resp.json()
    print(f"  [1.3] Early Warning Triggers: {ews['total_warnings']} active alerts")
    assert ews["total_warnings"] > 0

    # Risk Queue
    q_resp = client.get(f"/api/queue?workspace_id={ws_id}&page=1&page_size=10")
    assert q_resp.status_code == 200
    q_data = q_resp.json()
    assert len(q_data["items"]) == 10
    top_work = q_data["items"][0]
    top_work_id = top_work["work_id"]
    print(f"  [1.4] Risk Queue Top Candidate: ID='{top_work_id}', S_risk={top_work['risk_priority_score']:.1f}, Band='{top_work['severity_band']}'")

    # Project Intelligence & Forensic PDF
    intel_resp = client.get(f"/api/intelligence/{top_work_id}?workspace_id={ws_id}")
    assert intel_resp.status_code == 200
    intel_data = intel_resp.json()
    assert "explanation" in intel_data
    print(f"  [1.5] Project Intelligence: S_ml={intel_data['ml_anomaly_score']:.1f}, S_rule={intel_data['rule_score']:.1f}")

    proj_pdf_resp = client.get(f"/api/projects/{top_work_id}/pdf?workspace_id={ws_id}")
    assert proj_pdf_resp.status_code == 200
    assert proj_pdf_resp.headers["content-type"] == "application/pdf"
    print(f"  [1.6] Project PDF Dossier Exported: {len(proj_pdf_resp.content)} bytes")

    # Contractor Intel
    c_resp = client.get(f"/api/contractors?workspace_id={ws_id}")
    assert c_resp.status_code == 200
    c_data = c_resp.json()
    print(f"  [1.7] Contractor Intel: has_contractor_data={c_data['has_contractor_data']}, Msg='{c_data['message'][:45]}...'")

    # District & IDA Matrix
    mat_resp = client.get(f"/api/matrix/district-ida?workspace_id={ws_id}")
    assert mat_resp.status_code == 200
    mat_data = mat_resp.json()
    print(f"  [1.8] District & IDA Matrix: {mat_data['total_cells']} cross-tabulated cells across {len(mat_data['districts'])} districts")
    assert mat_data["total_cells"] > 0

    # Data Lineage
    lin_resp = client.get(f"/api/lineage/{top_work_id}?workspace_id={ws_id}")
    assert lin_resp.status_code == 200
    lin_data = lin_resp.json()
    assert len(lin_data["pipeline_stages"]) == 5
    print(f"  [1.9] Data Lineage Trace: {len(lin_data['pipeline_stages'])} pipeline stages verified")

    # Executive Command Report PDF
    exec_pdf_resp = client.get(f"/api/reports/executive/pdf?workspace_id={ws_id}")
    assert exec_pdf_resp.status_code == 200
    assert exec_pdf_resp.headers["content-type"] == "application/pdf"
    print(f"  [1.10] Executive Command Report PDF Exported: {len(exec_pdf_resp.content)} bytes")

    # ==================================================
    # SCENARIO 2: NEW DATASET UPLOAD & ANALYSIS
    # ==================================================
    print("\n[SCENARIO 2] New Workspace Creation & Custom Dataset Upload...")
    create_ws_resp = client.post("/api/workspaces", json={"name": "Custom Amritsar Audit", "description": "FY2024 Constituency Audit"})
    assert create_ws_resp.status_code in [200, 201], f"Create WS failed: {create_ws_resp.text}"
    custom_ws = create_ws_resp.json()
    custom_ws_id = custom_ws["id"]
    print(f"  [2.1] Custom Workspace Created: ID='{custom_ws_id}'")

    # Generate Synthetic Custom CSV
    csv_buf = io.StringIO()
    writer = csv.writer(csv_buf)
    writer.writerow(["Work Code", "Work Description", "Category", "Implementing Agency", "District", "Sanction Amount ( ₹ )", "Date of Sanction", "Work Status"])
    for i in range(1, 51):
        writer.writerow([
            f"WS/MP99999/2024-2025/{100000 + i}",
            f"Construction of community center block #{i} in Amritsar",
            "Public Infrastructure" if i % 2 == 0 else "Drinking Water",
            "MUNICIPAL CORP AMRITSAR" if i % 3 == 0 else "PWD AMRITSAR",
            "Amritsar",
            f"{500000 + i * 50000}",
            "15/05/2024",
            "In Progress" if i % 4 != 0 else "Completed"
        ])
    csv_bytes = csv_buf.getvalue().encode('utf-8')

    upload_resp = client.post(
        f"/api/workspaces/{custom_ws_id}/upload",
        files={"sanctioned_file": ("amritsar_sanctioned.csv", csv_bytes, "text/csv")}
    )
    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.text}"
    cleaning_summary = upload_resp.json()
    print(f"  [2.2] Ingestion & Cleaning Summary: Accepted={cleaning_summary['sanctioned_count']}, Imputed Dates={cleaning_summary['imputed_dates_count']}")
    assert cleaning_summary["sanctioned_count"] == 50

    # Run ML Analysis
    analyze_resp = client.post(f"/api/workspaces/{custom_ws_id}/analyze")
    assert analyze_resp.status_code == 200
    analysis_res = analyze_resp.json()
    print(f"  [2.3] Synchronous Analysis Executed: Monitored Works={analysis_res['total_scored']}, ML Anomalies={analysis_res['anomalies_count']}")
    assert analysis_res["total_scored"] == 50

    # ==================================================
    # SCENARIO 3: MULTI-WORKSPACE CONTEXT ISOLATION
    # ==================================================
    print("\n[SCENARIO 3] Multi-Workspace Isolation Verification...")
    kpi_custom = client.get(f"/api/overview/kpis?workspace_id={custom_ws_id}").json()
    kpi_demo = client.get(f"/api/overview/kpis?workspace_id={ws_id}").json()

    assert kpi_custom["total_sanctioned_works"] == 50
    assert kpi_demo["total_sanctioned_works"] == 220
    print(f"  [3.1] Custom Workspace Works: {kpi_custom['total_sanctioned_works']} | Demo Workspace Works: {kpi_demo['total_sanctioned_works']}")
    print("  [3.2] Zero cross-contamination verified between independent analysis sessions.")

    # ==================================================
    # SCENARIO 4: CLEAR DATASET RESET
    # ==================================================
    print("\n[SCENARIO 4] Resetting Dataset Records inside Workspace...")
    clear_resp = client.post(f"/api/workspaces/{custom_ws_id}/clear")
    assert clear_resp.status_code == 200
    kpi_cleared = client.get(f"/api/overview/kpis?workspace_id={custom_ws_id}").json()
    assert kpi_cleared["total_sanctioned_works"] == 0
    print(f"  [4.1] Workspace Dataset Cleared: Monitored Works={kpi_cleared['total_sanctioned_works']}")

    # Clean up custom workspace
    del_resp = client.delete(f"/api/workspaces/{custom_ws_id}")
    assert del_resp.status_code == 200
    print("  [4.2] Custom Workspace deleted cleanly.")

    # ==================================================
    # SCENARIO 5: INVALID DATASET HANDLING
    # ==================================================
    print("\n[SCENARIO 5] Invalid Dataset Ingestion Failure Verification...")
    temp_ws_resp = client.post("/api/workspaces", json={"name": "Temp Test WS"})
    temp_ws_id = temp_ws_resp.json()["id"]

    invalid_csv = b"random_col_1,random_col_2\nval1,val2\n"
    inv_upload_resp = client.post(
        f"/api/workspaces/{temp_ws_id}/upload",
        files={"sanctioned_file": ("invalid.csv", invalid_csv, "text/csv")}
    )
    assert inv_upload_resp.status_code == 400
    print(f"  [5.1] Invalid CSV correctly rejected with status 400: '{inv_upload_resp.json()['detail']}'")

    # Cleanup temp
    client.delete(f"/api/workspaces/{temp_ws_id}")

    # ==================================================
    # SCENARIO 6: MISSING OPTIONAL FIELDS HANDLING
    # ==================================================
    print("\n[SCENARIO 6] Missing Optional Fields Graceful Handling...")
    opt_ws_resp = client.post("/api/workspaces", json={"name": "Sparse Dataset WS"})
    opt_ws_id = opt_ws_resp.json()["id"]

    sparse_csv = io.StringIO()
    s_writer = csv.writer(sparse_csv)
    s_writer.writerow(["Work ID", "Sanctioned Amount", "Work Description"])
    for i in range(1, 11):
        s_writer.writerow([f"SPARSE-{i}", f"{100000 * i}", f"Sparse Work Order {i}"])

    sparse_upload = client.post(
        f"/api/workspaces/{opt_ws_id}/upload",
        files={"sanctioned_file": ("sparse.csv", sparse_csv.getvalue().encode('utf-8'), "text/csv")}
    )
    assert sparse_upload.status_code == 200
    sparse_analyze = client.post(f"/api/workspaces/{opt_ws_id}/analyze")
    assert sparse_analyze.status_code == 200
    print("  [6.1] Sparse dataset with missing optional columns analyzed successfully.")

    # Check contractor intelligence gracefully reports unavailability
    c_sparse = client.get(f"/api/contractors?workspace_id={opt_ws_id}").json()
    assert c_sparse["has_contractor_data"] is False
    print("  [6.2] Contractor intelligence gracefully reported unavailable state.")

    client.delete(f"/api/workspaces/{opt_ws_id}")

    print("\n" + "=" * 70)
    print("  ALL 6 COMPREHENSIVE E2E SCENARIOS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_comprehensive_test_suite()
