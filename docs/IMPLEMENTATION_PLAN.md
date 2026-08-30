# Implementation Plan (IMPLEMENTATION_PLAN.md)
*SIH26102 · AI-Powered MPLADS Monitoring, Anomaly Detection & Investigation Platform*

---

## 1. Engineering Roadmap & Phase Breakdown

```
[ Phase 0: Deep Codebase & Domain Audit ] ────► COMPLETED
[ Phase 1: Markdown Documentation Synchronization ] ──► COMPLETED
[ Phase 2: Backend REST APIs & Specialized Analytics ] ──► READY FOR EXECUTION
[ Phase 3: Contractor Intelligence Backend & UI ] ──────► READY FOR EXECUTION
[ Phase 4: District & IDA Matrix Module ] ──────────────► READY FOR EXECUTION
[ Phase 5: Traceable Data Lineage & Pipeline Drawer ] ──► READY FOR EXECUTION
[ Phase 6: Early Warning System & Alerts Strip ] ───────► READY FOR EXECUTION
[ Phase 7: Investigation Case Lifecycle & Assignment ] ─► READY FOR EXECUTION
[ Phase 8: Multi-Format Reporting & PDF Generator ] ────► READY FOR EXECUTION
[ Phase 9: Frontend Navigation & Shell Integration ] ───► READY FOR EXECUTION
[ Phase 10: End-to-End Regression & Scenario QA ] ──────► READY FOR EXECUTION
```

---

## 2. Phase-by-Phase Technical Specifications

### Phase 2: Backend REST APIs & Specialized Analytics
- **Objective:** Implement missing specialized intelligence endpoints in `backend/main.py`.
- **Endpoints to Implement:**
  - `GET /api/contractors?workspace_id=...` — Group works by contractor, compute portfolio metrics, financial exposure, delay rate, and anomaly count. Handle cases where contractor data is missing gracefully.
  - `GET /api/matrix/district-ida?workspace_id=...` — Cross-tabulate works by District $\times$ IDA, computing sanctioned counts, outlay, completion rates, delayed works, and anomaly density.
  - `GET /api/lineage/{work_id}?workspace_id=...` — Return full pipeline traceability for a given project (Raw CSV fields $\rightarrow$ Canonical aliases $\rightarrow$ Imputed values $\rightarrow$ 6D features $\rightarrow$ Model attribution).
  - `GET /api/overview/early-warnings?workspace_id=...` — Return proactive alert lists (Approaching 75-day sanction limit, disbursement lag, excessive agency concentration).
  - `GET /api/reports/executive/pdf?workspace_id=...` — Generate Executive Command Summary PDF.
- **Verification:** Unit tests in `backend/test_specialized_apis.py`.

### Phase 3: Contractor Intelligence Module (Frontend)
- **Objective:** Create `/contractors` page (`frontend/src/pages/ContractorsPage.jsx`) and supporting components (`frontend/src/components/contractors/`).
- **Capabilities:** Contractor portfolio table, financial outlay charts, anomaly rate indicators, drill-down into associated projects, and informative empty state when contractor data is absent.

### Phase 4: District & IDA Matrix Module (Frontend)
- **Objective:** Create `/district-matrix` page (`frontend/src/pages/DistrictMatrixPage.jsx`) and matrix grid components.
- **Capabilities:** Interactive District $\times$ Implementing Agency grid with color-coded risk density, concentration bars, and queue filter links.

### Phase 5: Traceable Data Lineage (Frontend)
- **Objective:** Create `/data-lineage` page (`frontend/src/pages/DataLineagePage.jsx`) and Project Detail drawer.
- **Capabilities:** Visual pipeline stage diagram and searchable work lineage inspector showing source values, canonical mappings, transformations, and feature vector attribution.

### Phase 6: Early Warning System & Alerts
- **Objective:** Integrate Early Warning alert strip into the Command Center (`DashboardPage.jsx`).
- **Capabilities:** High-priority cards for statutory deadline warnings, stalled disbursements, and agency clustering.

### Phase 7: Investigation Case Lifecycle & Assignment
- **Objective:** Enhance `InvestigationWorkspace.jsx` and `InvestigationCase` model to support full status lifecycle:
  `NEW`, `UNDER_REVIEW`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`, `DISMISSED`.
- **Capabilities:** Assignee input, formal transition buttons, mandatory reason modal, and audit log generation.

### Phase 8: Multi-Format Reporting & PDF Dossiers
- **Objective:** Expand `backend/pdf_generator.py` to generate both:
  1. Individual Work Forensic Dossier PDF (`/api/reports/project/{id}/pdf`)
  2. Executive Command Summary PDF (`/api/reports/executive/pdf`)
- **Capabilities:** Official headers, tables, risk scores, statutory rules, evidence, and officer sign-off lines.

### Phase 9: Navigation & Global Shell Integration
- **Objective:** Update `Sidebar.jsx` and `App.jsx` to include all restored modules:
  - `Command Center` (`/dashboard`)
  - `Investigation Queue` (`/queue`)
  - `Contractor Intel` (`/contractors`)
  - `District & IDA Matrix` (`/district-matrix`)
  - `Data Lineage` (`/data-lineage`)
  - `Audit Trail` (`/audit-log`)
  - `Workspaces Hub` (`/workspaces`)
  - `New Analysis` (`/new-analysis`)

### Phase 10: End-to-End Regression & Scenario QA
- **Objective:** Execute full 6-scenario automated test suite verifying context isolation, demo datasets, custom uploads, contractor graceful degradation, PDF generation, and zero regressions.

---

## 3. Traceability Matrix

| Requirement | PRD Section | Design Section | Architecture Section | Implementation Phase |
| :--- | :--- | :--- | :--- | :--- |
| **Command Center & Early Warnings** | 4.1 | 4.1 | 2.3 | Phase 2, 6, 9 |
| **Investigation Queue & Lifecycle** | 4.2 | 4.2 | 2.4 | Phase 7, 9 |
| **Project Forensic Dossier** | 4.3 | 4.3 | 2.4 | Phase 7, 8 |
| **Contractor Intelligence** | 4.4 | 4.4 | 2.5 | Phase 2, 3, 9 |
| **District & IDA Matrix** | 4.5 | 4.5 | 2.5 | Phase 2, 4, 9 |
| **Traceable Data Lineage** | 4.6 | 4.6 | 2.5 | Phase 2, 5, 9 |
| **Audit Trail Ledger** | 4.7 | 4.7 | 2.6 | Phase 2, 9 |
| **Multi-Format PDF Dossiers** | 4.8 | 4.8 | 2.6 | Phase 2, 8 |
| **Ingestion Wizard & Workspaces** | 4.9 | 4.9 | 2.1, 2.2 | Phase 2, 9 |
