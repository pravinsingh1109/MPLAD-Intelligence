# PRD.md — MPLAD Intelligence: Frontend Product Requirements Document
**Project:** SIH26102 · **MP Constituency:** Ludhiana (07), Punjab  
**MP:** AMRINDER SINGH RAJA WARRING · **Backend Version:** 1.0.0  
**Dataset:** 220 Sanctioned Works | 242 Recommended Works | 59 Completed Works  
**Document Type:** Frontend-Only Rebuild PRD (Backend fully implemented & live)

---

## 1. Executive Summary

**MPLAD Intelligence** is an institutional-grade AI decision-support platform for monitoring MPLADS (Members of Parliament Local Area Development Scheme) projects in the Ludhiana constituency. The backend is fully operational: a FastAPI server backed by a SQLite database (7 tables, 220 ML-scored works) is running and exposing a complete REST API.

**This document governs the frontend rebuild** — a React-based institutional command center that connects exclusively to the live backend API. All KPIs, risk scores, anomaly signals, and investigation actions must be fetched from the backend. No mock data or hardcoded values are permitted in the rebuilt frontend.

**Core Purpose:** Allow government officers to:
1. Monitor all 220 MPLADS works in Ludhiana via live KPIs
2. Identify and investigate anomalous/high-risk projects using ML scores
3. Take auditable administrative actions (field verification, audits, clearance)
4. Track all officer interactions via an immutable audit log

---

## 2. Live Backend Contract

The backend is **already running** and must not be modified. All frontend data must come from these endpoints.

### Base URL
```
http://localhost:8000
```
CORS is configured for `http://localhost:3000` and `http://localhost:5173`.

---

### 2.1 API Endpoint Inventory

#### `GET /api/health`
Service heartbeat. Frontend should poll this on load.
```json
{ "status": "ok", "database": "connected" }
```

---

#### `GET /api/overview/kpis`
Returns all KPI metrics for the Dashboard page.
```json
{
  "total_sanctioned_works": 220,
  "total_sanctioned_amount_cr": 8.5187,
  "total_recommended_works": 242,
  "total_recommended_amount_cr": 9.32,
  "total_completed_works": 59,
  "total_disbursed_amount_cr": 1.84,
  "ml_anomaly_candidates_count": 7,
  "critical_risk_count": 0,
  "high_risk_count": 4,
  "medium_risk_count": 13,
  "normal_risk_count": 203
}
```

---

#### `GET /api/projects/risk-queue`
Paginated, filterable list of all 220 ML-scored works. **Primary data source for Page 2.**

**Query Parameters:**
| Param | Type | Default | Options |
|---|---|---|---|
| `page` | int | 1 | >= 1 |
| `page_size` | int | 50 | 1–500 |
| `category` | string | `ALL` | `ALL`, `Normal/Others`, `Roads & Bridges`, `Education & Schools`, `Health & Sanitation`, `Drinking Water` |
| `severity` | string | `ALL` | `ALL`, `CRITICAL`, `HIGH`, `MEDIUM`, `NORMAL`, `ML_ANOMALY` |
| `search` | string | — | Matches on Work ID, title, IDA, district |

**Response Shape (per item):**
```json
{
  "id": "WS/MP18157/2024-2025/163249",
  "sr_no": "35",
  "title": "Public Lift, Lawyers Chamber Complex, Ward no-01, Jagraon, Distt. Ludhiana",
  "category": "Normal/Others",
  "ida": "LUDHIANA(DEPUTY COMMISSIONER LUDHIANA_IDA)",
  "district": "Ludhiana",
  "mp_name": "AMRINDER SINGH RAJA WARRING",
  "constituency": "LUDHIANA",
  "state": "Punjab",
  "sanctioned_amount_lakhs": 25.0,
  "recommended_amount_lakhs": 25.0,
  "sanction_delay_days": 28,
  "is_recommendation_date_imputed": false,
  "status": "Sanction",
  "is_completed": false,
  "disbursed_amount_lakhs": 0.0,
  "features": {
    "sanction_delay_days": 28,
    "log_sanction_amount": 14.7318,
    "category_cost_zscore": 6.7472,
    "ida_concentration_pct": 93.64,
    "is_completed_flag": 0,
    "disbursed_variance_pct": 0.0
  },
  "ml_anomaly_score": 92.4,
  "rule_score": 35.0,
  "risk_priority_score": 69.4,
  "severity_band": "HIGH RISK PRIORITY",
  "is_ml_anomaly": true,
  "rule_signals": ["Category Cost Outlier: Z-Score +6.75 in 'Normal/Others'"],
  "explanation": {
    "is_ml_anomaly": true,
    "ml_anomaly_score": 92.4,
    "rule_score": 35.0,
    "risk_priority_score": 69.4,
    "severity_band": "HIGH RISK PRIORITY",
    "weights_applied": { "w_ml": 0.60, "w_rule": 0.40 },
    "score_attribution": {
      "ml_contribution": 55.4,
      "rule_contribution": 14.0,
      "total_risk_score": 69.4
    },
    "executive_summary": "Project #WS/... is classified as HIGH RISK PRIORITY (S_risk = 69.4/100)...",
    "feature_evidence_matrix": [
      {
        "feature_name": "Sanction Delay",
        "observed_value": "28 Days",
        "dataset_benchmark": "Dataset Mean: 75.4 Days (Median: 54 Days)",
        "evaluation": "Within Mean Baseline",
        "severity": "NORMAL"
      }
    ],
    "rule_signals": ["Category Cost Outlier: Z-Score +6.75 in 'Normal/Others'"]
  }
}
```

**Pagination envelope:**
```json
{ "items": [...], "page": 1, "page_size": 50, "total": 220, "total_pages": 5 }
```

---

#### `GET /api/projects/{work_id}/intelligence`
Full ML-scored record with enriched explanation for a single project. Same shape as a risk-queue item. Used for **Page 3 (Project Intelligence)**.

> **Note:** `work_id` contains slashes — must be URL-encoded: `WS%2FMP18157%2F2024-2025%2F163249`

---

#### `GET /api/projects/{work_id}/investigation`
Returns the current investigation case status for a project.
```json
{
  "work_id": "WS/MP18157/2024-2025/163249",
  "current_status": "UNDER REVIEW",
  "created_at": "2026-08-26T01:58:12",
  "updated_at": "2026-08-26T01:58:12"
}
```

---

#### `POST /api/projects/{work_id}/investigation-action`
Triggers an official administrative action. Mutates `investigation_cases` and creates an `audit_log` entry.

**Request Body:**
```json
{
  "action": "MARK_FOR_FIELD_VERIFICATION",
  "details": "Dispatching CAG audit team for physical verification.",
  "actor": "State Nodal Officer (Punjab)"
}
```

**Allowed `action` values:**
| Action Key | Result Status |
|---|---|
| `MARK_FOR_FIELD_VERIFICATION` | `MARKED FOR FIELD VERIFICATION` |
| `REQUEST_NODAL_AGENCY_AUDIT` | `REQUEST NODAL AGENCY AUDIT` |
| `CLEAR_AFTER_REVIEW` | `CLEARED AFTER REVIEW` |

**Response:**
```json
{
  "work_id": "WS/...",
  "previous_status": "UNDER REVIEW",
  "new_status": "MARKED FOR FIELD VERIFICATION",
  "action": "MARK_FOR_FIELD_VERIFICATION",
  "timestamp": "2026-08-28T18:00:00"
}
```

---

#### `GET /api/projects/{work_id}/notes`
Returns all investigation notes for a project (newest first).
```json
[
  {
    "id": 1,
    "work_id": "WS/MP18157/2024-2025/163249",
    "officer_name": "State Nodal Officer",
    "note_text": "Initial field visit scheduled for 01-Sep-2026.",
    "timestamp": "2026-08-28T12:00:00"
  }
]
```

---

#### `POST /api/projects/{work_id}/notes`
Appends a new investigation note. Creates audit log entry automatically.

**Request Body:**
```json
{
  "note_text": "Physical site inspection confirms foundation is incomplete.",
  "officer_name": "Dist. Authority Officer - Ludhiana"
}
```

---

#### `GET /api/audit-logs`
Paginated audit log of all system and officer actions.

**Query Parameters:** `page`, `page_size`, `work_id` (filter), `action_type` (partial match filter)

**Response per item:**
```json
{
  "id": 101,
  "work_id": "WS/MP18157/2024-2025/163249",
  "action_type": "VERIFICATION STATUS: MARKED FOR FIELD VERIFICATION",
  "previous_status": "UNDER REVIEW",
  "new_status": "MARKED FOR FIELD VERIFICATION",
  "actor": "State Nodal Officer (Punjab)",
  "details": "Official status transitioned from UNDER REVIEW to MARKED FOR FIELD VERIFICATION",
  "timestamp": "2026-08-28T10:14:00"
}
```

---

#### `DELETE /api/audit-logs`
Dev/demo utility. Clears all audit log entries.

---

## 3. Data Entities & Domain Model

### 3.1 MlScoredWork — Core Entity (220 records)

| Field | Type | Description |
|---|---|---|
| `id` | string | Work ID format: `WS/MP18157/2024-2025/XXXXXX` |
| `title` | string | Full official work description title |
| `category` | string | Scheme category (see 3.4) |
| `ida` | string | Implementing District Authority name |
| `district` | string | Ludhiana (primary) + cross-district |
| `sanctioned_amount_lakhs` | float | Amount in Lakhs (INR) |
| `recommended_amount_lakhs` | float | MP's recommended amount in Lakhs |
| `sanction_delay_days` | int | Days between recommendation & sanction |
| `status` | string | Current scheme status (see 3.5) |
| `is_completed` | bool | Completion record matched |
| `disbursed_amount_lakhs` | float | Actual disbursement (0 if pending) |
| `ml_anomaly_score` | float | Isolation Forest score 0–100 |
| `rule_score` | float | Deterministic rule engine score 0–100 |
| `risk_priority_score` | float | Composite: `0.60 x S_ml + 0.40 x S_rule` |
| `severity_band` | string | See 3.3 |
| `is_ml_anomaly` | bool | `true` if `S_ml >= 70.0` |
| `rule_signals` | string[] | Human-readable rule violations |
| `explanation` | object | Enriched intelligence payload |
| `features` | object | 6-dimensional feature vector |

### 3.2 InvestigationCase — Per-Project Status

| Status | Description |
|---|---|
| `UNDER REVIEW` | Default state — awaiting officer action |
| `MARKED FOR FIELD VERIFICATION` | Field dispatch initiated |
| `REQUEST NODAL AGENCY AUDIT` | Formal nodal audit requested |
| `CLEARED AFTER REVIEW` | Officer reviewed and cleared |

### 3.3 Severity Bands

| Band Label | Score Range | Color |
|---|---|---|
| `CRITICAL RISK PRIORITY` | 80–100 | Red `#DC2626` |
| `HIGH RISK PRIORITY` | 60–79 | Amber `#EAB308` |
| `MEDIUM RISK PRIORITY` | 40–59 | Yellow dim |
| `NORMAL RISK` | 0–39 | Green `#238636` |

### 3.4 Work Categories (filter values)
- `Normal/Others` — 185 works (84.1%)
- `Roads & Bridges` — 18 works (8.2%)
- `Education & Schools` — 9 works (4.1%)
- `Health & Sanitation` — 5 works (2.3%)
- `Drinking Water` — 3 works (1.4%)

### 3.5 Work Status Values
- `Sanction Issued` (104 works, 47.3%)
- `Physical Inspection` (51 works, 23.2%)
- `Vendor Identification` (33 works, 15.0%)
- `Work Partially Completed` (22 works, 10.0%)
- `Work Completed` (9 works, 4.1%)
- `Time Estimation` (1 work, 0.5%)

### 3.6 Feature Evidence Matrix (6 Features)

| Feature Name | Key | Benchmark |
|---|---|---|
| Sanction Delay | `sanction_delay_days` | Mean: 75.4d, Median: 54d |
| Category Cost Z-Score | `category_cost_zscore` | Normal range: ±2.0 SD |
| IDA Agency Concentration | `ida_concentration_pct` | DC Ludhiana baseline: 93.6% |
| Sanctioned Amount | `sanctioned_amount_lakhs` | Category mean: Rs.3.23 Lakhs |
| Completion Status | `is_completed_flag` | District rate: 26.8% (59/220) |
| Disbursement Variance | `disbursed_variance_pct` | Expected: 0.0% |

---

## 4. Page-by-Page Functional Requirements

### Page 1 — National Command Center (Dashboard)
**Route:** `/` or `/dashboard`
**API Calls:** `GET /api/health`, `GET /api/overview/kpis`, `GET /api/projects/risk-queue?page_size=10`

#### FR-1.1: API Health Indicator
- On load, call `GET /api/health`
- Show a persistent topbar badge: `Backend Connected` (green) or `Backend Offline` (red)

#### FR-1.2: KPI Cards Strip (4 primary + 4 secondary)
Fetch from `GET /api/overview/kpis`.

Primary 4 cards:
| Card | Value Key | Label | Format |
|---|---|---|---|
| Total Sanctioned Works | `total_sanctioned_works` | "Monitored Works" | Integer `220` |
| Total Sanctioned Amount | `total_sanctioned_amount_cr` | "Sanctioned Value" | `Rs.8.52 Cr` |
| ML Anomaly Candidates | `ml_anomaly_candidates_count` | "ML Anomalies Detected" | Integer `7` |
| High-Risk Works | `high_risk_count` | "High Risk Priority" | Integer with red badge |

Secondary metrics (smaller cards or sub-metrics):
- Total Recommended Works (242) and Amount (Rs.9.32 Cr)
- Total Completed Works (59) and Disbursed Amount (Rs.1.84 Cr)
- Critical Risk Count (0), Medium Risk Count (13), Normal Risk Count (203)

#### FR-1.3: Risk Distribution Chart
Bar or donut chart using KPI data:
- Critical (0), High (4), Medium (13), Normal (203)

#### FR-1.4: IDA Agency Distribution Chart
Static from audited data (no API endpoint):
```
Ludhiana DC IDA: 206 works, 93.64%, Rs.7.89 Cr  [HIGH risk label]
Sri Muktsar Sahib IDA: 11 works, 5.0%, Rs.0.52 Cr  [NORMAL]
Others: 3 works, 1.36%  [LOW]
```

#### FR-1.5: Priority Review Queue Table (Top 10)
Fetch `GET /api/projects/risk-queue?page=1&page_size=10`
Columns: Work ID, Title (truncated), IDA, Risk Score Badge, Severity Band, Status. Clickable rows.

#### FR-1.6: Dataset Notice Banner
> Data Verified: 220 Sanctioned Works | 242 Recommended Works | 59 Completed Works
> Source: MPLADS Government CSV Feeds · ML Engine: Isolation Forest · Audit: 2026-v2.1

---

### Page 2 — Risk & Investigation Queue
**Route:** `/queue`
**API Calls:** `GET /api/projects/risk-queue` (paginated, with filters)

#### FR-2.1: Filter Toolbar
| Control | API Param | Values |
|---|---|---|
| Category Dropdown | `category` | ALL, Normal/Others, Roads & Bridges, Education & Schools, Health & Sanitation, Drinking Water |
| Severity Dropdown | `severity` | ALL, CRITICAL, HIGH, MEDIUM, NORMAL, ML_ANOMALY |
| Search Input | `search` | Free text (debounced 300ms) |
| Page Size | `page_size` | 15, 25, 50, 100 |

#### FR-2.2: High-Density Data Table
| Column | Source Field | Notes |
|---|---|---|
| `#` | Row rank | Absolute (not page-relative) |
| `WORK ID` | `id` | Monospace font |
| `WORK TITLE & IDA` | `title`, `ida` | Title bold + IDA muted |
| `CATEGORY` | `category` | Tag badge |
| `RISK SCORE` | `risk_priority_score` | Color pill: Red/Yellow/Green |
| `ML SCORE` | `ml_anomaly_score` | Secondary, muted |
| `DELAY` | `sanction_delay_days` | Red if > 75d |
| `STATUS` | `status` | Official scheme status |
| `SIGNALS` | `rule_signals[0]` | First signal, truncated |
| `ACTION` | — | "View" button |

#### FR-2.3: Pagination Controls
Page X of Y, prev/next, total count.

#### FR-2.4: Row Click
Clicking any row navigates to `/project/{encoded_work_id}`.

#### FR-2.5: ML Anomaly Rows
Rows where `is_ml_anomaly === true` have a left border highlight or background tint.

---

### Page 3 — Project Intelligence View
**Route:** `/project/:workId`
**API Calls:**
- `GET /api/projects/{work_id}/intelligence`
- `GET /api/projects/{work_id}/investigation`
- `GET /api/projects/{work_id}/notes`

#### FR-3.1: Project Header
- Severity band badge (color-coded) + Work ID in monospace
- Full work title (large heading)
- Meta row: District · IDA · Status
- Risk Priority Score prominently: `69.4 / 100`

#### FR-3.2: Score Breakdown Panel
From `explanation.score_attribution`:
- ML Score: `S_ml = 92.4` (weight 60%) → contribution 55.4
- Rule Score: `S_rule = 35.0` (weight 40%) → contribution 14.0
- Total: `S_risk = 69.4 / 100`

#### FR-3.3: Executive Summary
Render `explanation.executive_summary` as a styled text block.

#### FR-3.4: Feature Evidence Matrix
Render 6 features from `explanation.feature_evidence_matrix`:
| Column | Field |
|---|---|
| Feature Name | `feature_name` |
| Observed Value | `observed_value` |
| Dataset Benchmark | `dataset_benchmark` |
| Evaluation | `evaluation` |
| Severity Tag | `severity` (NORMAL/MEDIUM/HIGH/CRITICAL) |

#### FR-3.5: Rule Signals Panel
Each item in `explanation.rule_signals` as an alert card. If empty: "No statutory rule violations detected."

#### FR-3.6: Project Metadata Panel
Key-value layout: Work Category, Sanctioned Amount, Recommended Amount, Sanction Delay, Is Completed, Disbursed Amount, Is ML Anomaly, Constituency, State.

#### FR-3.7: Forensic Chronology (Derived Timeline)
Construct from available fields — no dedicated endpoint:
1. MP Recommendation — `recommended_amount_lakhs`
2. Administrative Sanction — `sanction_delay_days` days after
3. IDA Assignment — `ida`
4. Disbursement (if `disbursed_amount_lakhs > 0`)
5. Completion (if `is_completed === true`)

#### FR-3.8: Investigation Status Panel
From `GET /api/projects/{work_id}/investigation`:
- Current status badge
- Created at / Updated at timestamps

#### FR-3.9: Action Buttons (3 actions)
| Button | Action Payload | Modal Required |
|---|---|---|
| "Mark for Field Verification" | `MARK_FOR_FIELD_VERIFICATION` | Yes |
| "Request Nodal Agency Audit" | `REQUEST_NODAL_AGENCY_AUDIT` | Yes |
| "Clear After Review" | `CLEAR_AFTER_REVIEW` | Yes |

Confirmation modal must include:
- Description text
- Mandatory details field (min 15 characters)
- Officer name field (default: "State Nodal Officer")
- Cancel / Confirm buttons

On success: refresh investigation status panel.

#### FR-3.10: Investigation Notes Panel
- Display notes from `GET /api/projects/{work_id}/notes` (newest first)
- Textarea + "Add Note" button → `POST /api/projects/{work_id}/notes`
- Fields: officer name, timestamp, note text
- Refresh on successful post

---

### Page 4 — Audit Log
**Route:** `/audit-log`
**API Calls:** `GET /api/audit-logs`

#### FR-4.1: Audit Log Table
Columns: `ID`, `Timestamp`, `Work ID` (clickable), `Action Type`, `Previous Status`, `New Status`, `Actor`, `Details`

#### FR-4.2: Filter Controls
- Filter by Work ID (text input)
- Filter by Action Type (partial match)
- 25 per page default

#### FR-4.3: Read-Only Label
Clear label: "IMMUTABLE AUDIT TRAIL — Read Only"

---

## 5. Navigation Architecture

```
/dashboard        → Page 1: Command Center
/queue            → Page 2: Risk & Investigation Queue
/project/:workId  → Page 3: Project Intelligence View
/audit-log        → Page 4: Audit Log
```

---

## 6. Global Application Requirements

### FR-G.1: Application Shell
- Persistent left sidebar (240px wide)
- Top navigation bar (56px height)
- Main content area to the right

### FR-G.2: Top Bar Contents
- App name: "MPLAD Intelligence" + SIH26102 badge
- Constituency: "LUDHIANA (07) · Punjab"
- Backend health indicator badge
- MP: "AMRINDER SINGH RAJA WARRING"

### FR-G.3: Sidebar Links
- Overview / Command Center
- Risk & Investigation Queue
- Project Intelligence (grayed if none selected)
- Audit Log

### FR-G.4: Loading States
Skeleton/spinner while fetching API.

### FR-G.5: Error States
Inline error card with message + retry button.

### FR-G.6: URL Encoding
Work IDs like `WS/MP18157/2024-2025/163249` must be encoded as `WS%2FMP18157%2F2024-2025%2F163249` in all API calls and routes.

---

## 7. Non-Functional Requirements

| NFR | Requirement |
|---|---|
| Performance | Dashboard loads < 2s; loading states shown immediately on navigation |
| Framework | React 18, React Router v6, Axios or fetch |
| Charts | Recharts or Chart.js |
| State | React Context or Zustand (lightweight) |
| No Mock Data | All work records must come from live API; no hardcoded project arrays |
| Institutional Framing | AI scores labeled "AI/ML Signal", not "Fraud Score" |
| Auditability | All investigation actions call backend POST — no local-only state |

---

## 8. MoSCoW Prioritization

### MUST HAVE (MVP)
- Page 1: Dashboard with live KPIs
- Page 2: Filterable risk queue table with pagination
- Page 3: Project intelligence with ML data, feature matrix, action buttons, notes
- Page 4: Audit log table
- App shell (sidebar + topbar)
- Error + loading states
- Confirmation modals for investigation actions

### SHOULD HAVE
- Risk distribution chart on dashboard
- IDA distribution chart on dashboard
- Score breakdown visual on Page 3
- Forensic chronology timeline on Page 3
- ML anomaly row highlighting in queue

### NICE TO HAVE
- Debounced search in queue
- Animated risk score gauge on Page 3
- Toast notifications for successful actions

### OUT OF SCOPE
- Geo-risk map (no API endpoint)
- Contractor network graph (no API endpoint)
- Project comparison tool (no API endpoint)
- User authentication (backend has no auth)
- CSV/PDF export (no API endpoint)
- District analytics scatter plot (no API endpoint)

---

## 9. Acceptance Criteria

| ID | Feature | Criteria |
|---|---|---|
| AC-01 | API Health | Backend health status appears in top bar within 2s of load |
| AC-02 | Dashboard KPIs | All 11 KPI fields from `/api/overview/kpis` displayed correctly |
| AC-03 | Queue Filtering | `severity=HIGH` filter calls API with that param and shows only HIGH records |
| AC-04 | Queue Pagination | Page 2 fetches `?page=2` and displays correct records |
| AC-05 | Intelligence View | Row click navigates to `/project/{encoded_id}` and loads all data |
| AC-06 | Feature Matrix | All 6 features from `feature_evidence_matrix` rendered with severity tags |
| AC-07 | Rule Signals | `rule_signals` rendered; empty state shows "No violations detected" |
| AC-08 | Investigation Action | Action button opens modal; submit calls POST; success refreshes status |
| AC-09 | Notes | Adding note calls POST; new note appears at top of notes list |
| AC-10 | Audit Log | Table fetches and paginates; clicking work ID navigates to that project |
| AC-11 | URL Encoding | Work IDs with slashes properly encoded in API calls and routes |
| AC-12 | No Mock Data | No project data hardcoded; all records from live API |
