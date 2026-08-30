import json
import os
import re
import urllib.request
import urllib.parse

BASE_URL = "http://127.0.0.1:8000"

def get_json(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def get_binary(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        headers = {k.lower(): v for k, v in resp.headers.items()}
        return resp.status, resp.read(), headers

def test_pdf_and_formula_audit():
    print("==================================================")
    print("  TESTING PDF GENERATION & GLOBAL MATH AUDIT       ")
    print("==================================================")

    # 1. Test Project Intelligence PDF Export on Demo Workspace (Critical / High Risk)
    work_id_high = "WS/MP18157/2024-2025/163249"
    encoded_id_high = urllib.parse.quote(work_id_high, safe='')
    print(f"\n[Test 1] Downloading PDF for High/Critical Project: {work_id_high}...")
    
    st, pdf_bytes, headers = get_binary(f"/api/projects/{encoded_id_high}/pdf?workspace_id=demo-ludhiana")
    print(f"  -> HTTP Status: {st}, Size: {len(pdf_bytes)} bytes")
    print(f"  -> Content-Type: {headers.get('content-type')}")
    print(f"  -> Content-Disposition: {headers.get('content-disposition')}")
    
    assert st == 200
    assert pdf_bytes.startswith(b'%PDF-')
    assert len(pdf_bytes) > 5000
    assert "MPLADS_Intelligence_Report" in headers.get('content-disposition', '')
    print("  -> [PASS] PDF generated with valid binary structure.")

    # 2. Test Project Intelligence PDF Export on Normal Risk Project
    work_id_norm = "WS/MP18157/2025-2026/267152"
    encoded_id_norm = urllib.parse.quote(work_id_norm, safe='')
    print(f"\n[Test 2] Downloading PDF for Normal-Risk Project: {work_id_norm}...")
    
    st, pdf_bytes_norm, headers_norm = get_binary(f"/api/projects/{encoded_id_norm}/pdf?workspace_id=demo-ludhiana")
    print(f"  -> HTTP Status: {st}, Size: {len(pdf_bytes_norm)} bytes")
    assert st == 200
    assert pdf_bytes_norm.startswith(b'%PDF-')
    assert len(pdf_bytes_norm) > 4000
    print("  -> [PASS] Normal-Risk Project PDF generated successfully.")

    # 3. Test Global Math / LaTeX audit across API responses
    print("\n[Test 3] Auditing API Payloads for Raw LaTeX / Malformed Math Strings...")
    latex_patterns = [
        re.compile(r'\$[^$]+\$'),
        re.compile(r'\\cdot'),
        re.compile(r'\\times'),
        re.compile(r'S_\{[a-z]+\}'),
        re.compile(r'\\_'),
    ]

    # Check Project Intelligence
    st, intel_data = get_json(f"/api/projects/{encoded_id_high}/intelligence?workspace_id=demo-ludhiana")
    explanation = intel_data.get("explanation", {})
    summary_text = explanation.get("executive_summary", "")
    print(f"  -> Executive Summary narrative:\n     \"{summary_text}\"")

    for pat in latex_patterns:
        match = pat.search(summary_text)
        if match:
            print(f"  -> [FAIL] Found LaTeX pattern '{match.group(0)}' in executive summary!")
            assert False

    # Check Risk Queue items
    st, queue_data = get_json("/api/projects/risk-queue?workspace_id=demo-ludhiana&page=1&page_size=20")
    for item in queue_data.get("items", []):
        exp = item.get("explanation", {})
        narr = exp.get("executive_summary", "")
        for pat in latex_patterns:
            assert not pat.search(narr), f"LaTeX found in narrative: {pat}"

    print("  -> [PASS] Zero raw LaTeX strings detected across API response payloads.")

    # 4. Verify Demo Dataset and ML Scores remain 100% Identical
    print("\n[Test 4] Verifying ML Scores & Severity Band Invariance...")
    assert intel_data["risk_priority_score"] == 69.4
    assert intel_data["ml_anomaly_score"] == 92.4
    assert intel_data["rule_score"] == 35.0
    assert intel_data["severity_band"] == "HIGH RISK PRIORITY"
    print("  -> [PASS] Risk calculation & score attribution completely unaltered.")

    print("\n==================================================")
    print("  ALL PDF & GLOBAL MATH AUDIT TESTS PASSED!        ")
    print("==================================================")

if __name__ == "__main__":
    test_pdf_and_formula_audit()
