import json
import urllib.request
import urllib.parse

BASE_URL = "http://127.0.0.1:8000"

def get_json(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def test_ida_distribution_endpoint():
    print("==================================================")
    print("  TESTING DYNAMIC IDA DISTRIBUTION & CHARTS       ")
    print("==================================================")

    # 1. Test Demo Workspace IDA Distribution
    print("\n[Test 1] Querying IDA Distribution for Demo Workspace (demo-ludhiana)...")
    st, data = get_json("/api/overview/ida-distribution?workspace_id=demo-ludhiana")
    print(f"  -> Total Works: {data['total_works']}, Agencies Found: {len(data['items'])}")
    assert st == 200
    assert data["total_works"] == 220
    assert len(data["items"]) > 0
    top = data["items"][0]
    print(f"  -> Top Agency: '{top['name']}' with {top['count']} works ({top['percentage']}%)")
    assert top["percentage"] > 80.0 # DC Ludhiana is primary (~93.6%)
    
    # 2. Check all items calculate percentages that sum up to 100%
    total_pct = sum(item["percentage"] for item in data["items"])
    print(f"  -> Cumulative Percentage of Top Agencies: {total_pct:.1f}%")
    assert 95.0 <= total_pct <= 100.5

    # 3. Test missing workspace_id returns 400
    print("\n[Test 2] Verifying strict workspace_id enforcement...")
    try:
        get_json("/api/overview/ida-distribution")
        assert False, "Should have failed with 400/422"
    except urllib.error.HTTPError as e:
        print(f"  -> [PASS] Correctly rejected with HTTP {e.code}")

    print("\n==================================================")
    print("  ALL IDA DISTRIBUTION & CHART API TESTS PASSED!   ")
    print("==================================================")

if __name__ == "__main__":
    test_ida_distribution_endpoint()
