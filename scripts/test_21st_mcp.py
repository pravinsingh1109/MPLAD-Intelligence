import urllib.request
import json
import os

url = "https://21st.dev/api/mcp"
api_key = os.environ.get("API_KEY_21ST", "")

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
}
if api_key:
    headers["x-api-key"] = api_key

# 1. Send MCP initialize request
init_payload = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {
            "name": "antigravity-client",
            "version": "1.0.0"
        }
    }
}

try:
    req = urllib.request.Request(url, data=json.dumps(init_payload).encode('utf-8'), headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        print("HTTP Status:", resp.status)
        print("Response Headers:", dict(resp.headers))
        content = resp.read().decode('utf-8')
        print("Response Body:", content[:500])
except Exception as e:
    print("Initialize error:", e)

# 2. Send tools/list request
tools_payload = {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
}

try:
    req = urllib.request.Request(url, data=json.dumps(tools_payload).encode('utf-8'), headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        print("\nTools/List HTTP Status:", resp.status)
        content = resp.read().decode('utf-8')
        print("Tools/List Body:", content[:1000])
except Exception as e:
    print("\nTools/List error:", e)
