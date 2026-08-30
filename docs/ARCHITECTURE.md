# Technical Architecture & Multi-Tier Specification (ARCHITECTURE.md)
*SIH26102 · AI-Powered MPLADS Monitoring, Anomaly Detection & Investigation Platform*

---

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (React 18 + Vite)                   │
│  - Floating Master Container (24px frame radius, Satin Dark #171a24)   │
│  - Grouped Capsule Sidebar (Workspace, Intelligence Core, Governance)   │
│  - TopBar Context Capsule (Live API Heartbeat & Active Switcher)        │
│  - Pages: Command Center, Queue, Dossier, Contractors, Matrix, Lineage  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │  REST API (JSON / Multipart / PDF)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER (FastAPI + Python 3)                 │
│  ├── Contextual API Routers (/api/overview, /api/queue, /api/matrix...) │
│  ├── Canonical Schema Normalizer (Multi-format CSV Header Ingestion)   │
│  ├── Pure Python Isolation Forest ML Engine (100 Trees, 6D Vectors)    │
│  ├── Statutory Rule Evaluation Engine (MoSPI & CAG Compliance Checks)   │
│  └── ReportLab PDF Forensic Dossier Generator                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │  SQLAlchemy ORM
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (SQLite 3)                          │
│  - Workspaces (Strict Multi-tenant Dataset Isolation)                   │
│  - SanctionedWorks, RecommendedWorks, CompletedWorks                    │
│  - MlScoredWorks (Features, ML Scores, Rule Signals, Explanations)      │
│  - InvestigationCases & InvestigationNotes                              │
│  - AuditLogs (Immutable Relational Action Ledger)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive REST API Specifications

All endpoints strictly require the `workspace_id` parameter (either via query parameter `?workspace_id=...` or path parameter `/{workspace_id}/...`) to guarantee 100% data isolation.

### 2.1 Workspace & Lifecycle Management
- `GET /api/workspaces` — List all registered analysis workspaces with cached KPI metrics.
- `POST /api/workspaces` — Create a new analysis workspace session.
- `GET /api/workspaces/demo` — Load or reset the official Ludhiana FY2024-25 baseline demo dataset.
- `DELETE /api/workspaces/{id}` — Cascade delete a workspace and all associated records.
- `POST /api/workspaces/{id}/clear-dataset` — Reset dataset records while preserving workspace container.

### 2.2 Ingestion & Analysis
- `POST /api/workspaces/{id}/upload-dataset` — Multipart upload of Sanctioned, Recommended, and Completed CSVs; executes canonical normalization and returns data quality summary.
- `POST /api/workspaces/{id}/run-analysis` — Synchronously executes 6D feature extraction, Isolation Forest scoring, and rule evaluation.

### 2.3 Command Center & Overview
- `GET /api/overview/kpis?workspace_id=...` — Returns total works, sanctioned outlay, anomaly count, and risk breakdown.
- `GET /api/overview/ida-distribution?workspace_id=...` — Returns dynamic implementing agency work counts, outlay, and percentages.
- `GET /api/overview/early-warnings?workspace_id=...` — Returns proactive alert lists for delayed sanctions and disbursement bottlenecks.

### 2.4 Investigation Queue & Project Intelligence
- `GET /api/queue?workspace_id=...&page=...&category=...&severity=...&search=...` — Filtered, paginated risk queue.
- `GET /api/intelligence/{id}?workspace_id=...` — Deep single-project forensic dossier, 60/40 formula breakdown, and 6D evidence matrix.
- `POST /api/investigation/{id}/action` — Records case status transitions (`MARK_FOR_FIELD_VERIFICATION`, `REQUEST_NODAL_AGENCY_AUDIT`, `CLEAR_AFTER_REVIEW`, `UNDER_REVIEW`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`, `DISMISSED`) with mandatory justification.
- `GET /api/investigation/{id}/notes?workspace_id=...` — Retrieves investigation case notes.
- `POST /api/investigation/{id}/notes` — Appends an officer field observation note.

### 2.5 Specialized Intelligence Modules
- `GET /api/contractors?workspace_id=...` — Aggregates works by contractor entity with portfolio metrics, delay rates, and anomaly density.
- `GET /api/matrix/district-ida?workspace_id=...` — Cross-tabulated District $\times$ Implementing Agency concentration matrix.
- `GET /api/lineage/{work_id}?workspace_id=...` — Returns full traceability log (Raw CSV fields $\rightarrow$ Canonical aliases $\rightarrow$ Imputed values $\rightarrow$ 6D features $\rightarrow$ Model attribution).

### 2.6 Audit Ledger & PDF Dossiers
- `GET /api/audit-logs?workspace_id=...&page=...&work_id=...&action_type=...` — Immutable audit trail log.
- `POST /api/audit-logs` — Logs an administrative event.
- `GET /api/reports/project/{id}/pdf?workspace_id=...` — Generates a downloadable binary PDF dossier.
- `GET /api/reports/executive/pdf?workspace_id=...` — Generates an Executive Command Summary PDF report.

---

## 3. Database Schema & Relational Integrity

### Entities:
1. `workspaces`: `(id [PK], name, description, status, is_demo, created_at, updated_at, kpi_metrics...)`
2. `sanctioned_works`: `(id [PK], workspace_id [FK], work_id, title, category, ida, district, mp_name, constituency, state, sanctioned_amount, sanctioned_amount_lakhs, sanct_date, status)`
3. `recommended_works`: `(id [PK], workspace_id [FK], work_id, title, recommended_amount, recommended_amount_lakhs, rec_date, district)`
4. `completed_works`: `(id [PK], workspace_id [FK], work_id_matched, title, disbursed_amount, disbursed_amount_lakhs, completion_date, district)`
5. `ml_scored_works`: `(id [PK], workspace_id [FK], work_id, title, category, ida, district, mp_name, features [JSON], ml_anomaly_score, rule_score, risk_priority_score, severity_band, is_ml_anomaly, rule_signals [JSON], explanation [JSON])`
6. `investigation_cases`: `(id [PK], workspace_id [FK], work_id, current_status, assigned_officer, created_at, updated_at)`
7. `investigation_notes`: `(id [PK], workspace_id [FK], work_id, officer_name, note_text, timestamp)`
8. `audit_logs`: `(id [PK], workspace_id [FK], work_id, action_type, previous_status, new_status, actor, details, timestamp)`
