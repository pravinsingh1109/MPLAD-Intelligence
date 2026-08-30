import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(url, method="GET", body=None):
    headers = {"Content-Type": "application/json"}
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
        return resp.status, json.loads(content)

print("==================================================")
print("  FULL REACT -> FASTAPI -> SQLITE INTEGRATION TEST")
print("==================================================")

# 1. Clear initial audit logs
make_request(f"{BASE_URL}/audit-logs", method="DELETE")

status, logs_start = make_request(f"{BASE_URL}/audit-logs")
print(f"1. Audit Logs Initialized Clean: {logs_start['total']} events")

# 2. Perform Investigation Status Change on Page 4
work_id = "WS/MP18157/2024-2025/163249"
status, action_res = make_request(
    f"{BASE_URL}/projects/{urllib.parse.quote(work_id, safe='')}/investigation-action",
    method="POST",
    body={"action": "MARK_FOR_FIELD_VERIFICATION", "actor": "State Nodal Officer", "details": "Physical verification team dispatched"}
)
print(f"2. Page 4 Investigation Status Updated: {action_res['previous_status']} -> {action_res['new_status']}")

# 3. Check Page 6 Audit Logs (Must be EXACTLY 1 event)
status, logs_after_action = make_request(f"{BASE_URL}/audit-logs")
print(f"3. Page 6 Audit Logs Query: Total = {logs_after_action['total']} (Expected: 1)")
assert logs_after_action['total'] == 1, f"Expected 1 audit event, got {logs_after_action['total']}"
event1 = logs_after_action['items'][0]
print(f"   • Event #1: [{event1['work_id']}] {event1['action_type']} | Timestamp: {event1['timestamp']}")

# 4. Save Investigation Note on Page 4
status, note_res = make_request(
    f"{BASE_URL}/projects/{urllib.parse.quote(work_id, safe='')}/notes",
    method="POST",
    body={"note_text": "Site measurements confirmed with Assistant Engineer.", "officer_name": "State Nodal Officer"}
)
print(f"4. Page 4 Investigation Note Saved: ID #{note_res['id']} ('{note_res['note_text']}')")

# 5. Check Page 6 Audit Logs (Must be EXACTLY 2 events)
status, logs_after_note = make_request(f"{BASE_URL}/audit-logs")
print(f"5. Page 6 Audit Logs Query: Total = {logs_after_note['total']} (Expected: 2)")
assert logs_after_note['total'] == 2, f"Expected 2 audit events, got {logs_after_note['total']}"
event2 = logs_after_note['items'][0]
print(f"   • Event #2: [{event2['work_id']}] {event2['action_type']} | Text: '{event2['details']}'")

print("\n==================================================")
print("  END-TO-END INTEGRATION TEST PASSED 100% PERFECTLY ")
print("==================================================")
