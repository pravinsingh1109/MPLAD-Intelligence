# Product Requirements Document (PRD.md)
*SIH26102 · AI-Powered MPLADS Monitoring, Anomaly Detection & Investigation Platform*

---

## 1. Product Overview & Strategic Vision

**MPLAD Intelligence (SIH26102)** is an institutional-grade, AI-assisted monitoring, anomaly detection, investigative triage, and audit-readiness platform designed for the **Members of Parliament Local Area Development Scheme (MPLADS)**.

### The Complete Intelligence Lifecycle
The platform transforms raw constituency progress reports into an end-to-end operational intelligence pipeline:

```
DATA INGESTION
     │
     ▼
DATA QUALITY & VALIDATION
     │
     ▼
AI/ML ANOMALY DETECTION
     │
     ▼
RISK PRIORITIZATION (S_risk = 0.60 × S_ml + 0.40 × S_rule)
     │
     ▼
OPERATIONAL INVESTIGATION QUEUE
     │
     ▼
FORENSIC CASE INTELLIGENCE & EVIDENCE
     │
     ▼
SPECIALIZED INTELLIGENCE MODULES
(Contractor Intel · District & IDA Matrix · Data Lineage)
     │
     ▼
OFFICIAL REPORTING (PDF & CSV DOSSIERS)
     │
     ▼
IMMUTABLE AUDIT TRAIL LEDGER
```

---

## 2. Feature Inventory & Capability Audit

| Feature Module | Status | Purpose | Target User | Data Dependency | Backend API | UI Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **National Command Center** | `KEEP & ENHANCE` | Macro oversight, live KPI metrics, direct on-chart label analytics, top anomaly queue preview. | Central & State Nodal Officers | Sanctioned & Scored Works | `GET /api/overview/kpis`, `GET /api/overview/ida-distribution` | `/dashboard` |
| **Investigation Queue** | `KEEP & ENHANCE` | Triage high-risk candidates with official case statuses (`NEW`, `UNDER_REVIEW`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`, `DISMISSED`). | District Magistrates, Auditors | Scored Works & Case Records | `GET /api/queue` | `/queue` |
| **Project Intelligence Dossier** | `KEEP & ENHANCE` | Deep single-project forensic dossier, 60/40 formula breakdown, 6D evidence matrix, action workspace, field notes. | Field Auditors, Nodal Officers | Full Project Metadata, Explanations | `GET /api/intelligence/{id}`, `POST /api/investigation/{id}/action` | `/project/{id}` |
| **Contractor Intelligence** | `RESTORE & ENHANCE` | Portfolio risk analysis, contractor concentration, delay rates, anomaly density, financial exposure. | State Vigilance, CAG Auditors | Contractor Name / ID | `GET /api/contractors` | `/contractors` |
| **District & IDA Matrix** | `RESTORE & ENHANCE` | Cross-tabulated District × Agency concentration, anomaly density, financial outlay exposure, drill-downs. | State Planning Dept, DAs | District & IDA Fields | `GET /api/matrix/district-ida` | `/district-matrix` |
| **Traceable Data Lineage** | `RESTORE & ENHANCE` | Full pipeline traceability: Source CSV $\rightarrow$ Raw Record $\rightarrow$ Cleaning $\rightarrow$ 6D Features $\rightarrow$ ML Model $\rightarrow$ Composite Score. | Compliance Auditors, DMs | Normalization Logs & Feature Vectors | `GET /api/lineage/{work_id}` | `/data-lineage` |
| **Audit Trail Ledger** | `KEEP & ENHANCE` | Immutable relational log of all administrative actions, status transitions, notes, dataset uploads, and PDF downloads. | Oversight Authorities | AuditLog Entity | `GET /api/audit-logs`, `POST /api/audit-logs` | `/audit-log` |
| **Data Quality Summary** | `ENHANCE` | Quantified ingestion audit: accepted vs rejected records, duplicate works, normalized currency, imputed dates. | Data Engineers, Nodal Officers | Normalization Pipeline | `POST /api/workspaces/{id}/upload-dataset` | `/new-analysis` (Step 2) |
| **PDF Dossier & Multi-Format Reports** | `KEEP & ENHANCE` | Generate official downloadable PDF reports (Work Dossier, Investigation Case Report, Executive Command Summary). | Official Inquiries, DMs | Verified Workspace Analytics State | `GET /api/reports/project/{id}/pdf`, `GET /api/reports/executive/pdf` | Header & Intelligence Views |
| **Workspaces & Dataset Management** | `KEEP & ENHANCE` | Multi-dataset isolation, custom session creation, canonical normalization, explicit workspace context, dataset reset, cascade deletion. | All Users | Workspaces Entity | `GET/POST /api/workspaces` | `/workspaces` |
| **Statutory Evidence & Research Intel** | `NEW` | Authoritative statutory references, MoSPI guidelines, CAG performance audit findings, CVC guidelines. | Auditors & Legal Officers | Domain Knowledge Repository | `GET /api/evidence/references` | Integrated in Dossier |
| **Early Warning System** | `NEW` | Proactive risk alerts for projects nearing the 75-day statutory limit, disbursement lags, and emerging agency clustering. | District Magistrates | Temporal Features & Baselines | `GET /api/overview/early-warnings` | `/dashboard` |

---

## 3. Core Information Architecture & 10 Decision Anchors

The entire platform is architected to answer 10 essential operational questions at a glance:
1. **Active Context:** Which constituency or financial year dataset is currently active? *(TopBar Capsule)*
2. **Scheme Health:** What is the macro recommendation-to-sanction match rate and total outlay? *(Notice Banner & Secondary Strip)*
3. **Total Scope:** How many work orders and how much financial outlay are being monitored? *(KPI Card 1 & 2)*
4. **Outlier Count:** How many works violate multivariate statistical baselines? *(KPI Card 3: ML Anomalies)*
5. **High Priority Triage:** How many cases require immediate administrative review or field inspection? *(KPI Card 4: High Risk Priority)*
6. **Risk Distribution:** What proportion of works fall into Critical, High, Medium, and Normal bands? *(Donut Chart with non-hover direct percentages)*
7. **Agency Allocation:** Which Implementing Agency (IDA) holds work concentration? *(Bar Chart with direct `<LabelList />` count & percentage)*
8. **Action Queue:** What are the top 10 ranked projects requiring immediate inspection? *(Preview Queue Table)*
9. **Explainability & Attribution:** Why was a specific project flagged? *(Formula Card $S_{\text{risk}} = 0.60 \times S_{\text{ml}} + 0.40 \times S_{\text{rule}}$ + 6D Evidence Matrix)*
10. **Governance & Actions:** What is the investigation history and audit timeline? *(Investigation Workspace & Audit Trail)*

---

## 4. Detailed Module Specifications

### 4.1 Module 1: National Command Center (`/dashboard`)
- **Macro Metric Cards:** Monitored Works, Sanctioned Outlay (₹ Cr), ML Anomaly Candidates ($S_{\text{ml}} \ge 70$), High Risk Priority Cases ($S_{\text{risk}} \ge 60$).
- **Direct Label Analytics:**
  - *Risk Priority Distribution (Donut):* On-slice percentage for readable slices ($\ge 7\%$) and aligned legend grid displaying `Count (Percentage%)`.
  - *Implementing Agency Concentration (Horizontal Bar):* Direct `<LabelList />` rendering `${count} (${percentage}%)` with X-axis domain headroom.
- **Interactive Drill-Downs:** Clicking KPI tiles or chart segments routes directly to filtered `/queue` views.
- **Early Warning Alert Strip:** Highlights projects nearing the 75-day AS statutory deadline or showing disbursement stagnation.

### 4.2 Module 2: Investigation Queue (`/queue`)
- **Ranked Candidate Table:** High-density table sorted descending by $S_{\text{risk}}$.
- **Formal Status Lifecycle:** `NEW` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `ESCALATED` $\rightarrow$ `RESOLVED` $\rightarrow$ `DISMISSED`.
- **Filters:** Text search (Work ID, Title, IDA, District), Category, Severity Band, Status, Delay Range.

### 4.3 Module 3: Project Intelligence & Forensic Dossier (`/project/:id`)
- **Master Header:** Title, Work ID, Agency, District, Outlay, and **`[ Download PDF Report ]`** button.
- **Risk Score Attribution Card:**
  - Composite Risk Metric: `${sRisk.toFixed(1)} / 100` with severity badge.
  - Formula Presentation: Clean typography `S_risk = 0.60 × S_ml + 0.40 × S_rule`.
  - 2 Component Breakdown Cards: $S_{\text{ml}}$ (60% weight) and $S_{\text{rule}}$ (40% weight).
- **Multivariate Feature Evidence Matrix:** 6 dimensions benchmarked against active dataset baselines.
- **Statutory Rule Signals:** Detailed listing of all triggered MoSPI compliance rules.
- **Forensic Administrative Chronology:** Milestone timeline (`AS Issued`, `IDA Assigned`, `Disbursed`, `Completed`).
- **Operator Investigation Workspace:** Authorized status transitions with mandatory reason justification (min 15 chars) and audit logging.
- **Investigation Notes:** Append-only field observation notes.

### 4.4 Module 4: Contractor Intelligence (`/contractors`)
- **Contractor Aggregation Matrix:** Aggregates works by contractor entity when contractor data is present.
- **Key Metrics:** Total Sanctioned Value (₹ Lakhs), Works Count, Delayed Works Count, ML Anomaly Rate (%), Average Risk Score.
- **Graceful Degradation:** If contractor data is not available in the uploaded CSV, displays:
  `"Contractor intelligence unavailable for this dataset because contractor identifiers are not present."`

### 4.5 Module 5: District & IDA Matrix (`/district-matrix`)
- **Cross-Tabulated Matrix:** District × Implementing Agency grid.
- **Key Metrics:** Sanctioned works, sanctioned amount, completed works, delayed works, anomaly count, agency concentration share (%).
- **Interactive Filtering:** Clicking any agency or district filters the queue to inspect associated projects.

### 4.6 Module 6: Traceable Data Lineage (`/data-lineage`)
- **Pipeline Stage Visualizer:**
  `Source File` $\rightarrow$ `Raw Record` $\rightarrow$ `Validation` $\rightarrow$ `Canonical Normalization` $\rightarrow$ `Cleaning & Imputation` $\rightarrow$ `Feature Extraction (6D)` $\rightarrow$ `ML & Rule Scoring` $\rightarrow$ `Composite Score` $\rightarrow$ `Investigation Case`.
- **Searchable Work Traceability:** Query any Work ID to inspect its exact original CSV row, mapped canonical fields, imputed values, and model input vector.

### 4.7 Module 7: Official Audit Trail Ledger (`/audit-log`)
- **Relational Event Logging:** Records all workspace creations, dataset uploads, validation actions, ML scorings, status changes, officer notes, and PDF exports.
- **Filters:** Work ID, Action Type, Actor, Rows per page.

### 4.8 Module 8: Workspaces & Dataset Ingestion Wizard (`/workspaces`, `/new-analysis`)
- **Workspace Isolation:** Completely isolated SQLite dataset namespaces with zero cross-contamination.
- **Canonical Schema Normalizer:** Ingests standard and alias column headers automatically.
- **4-Step Wizard:** Upload $\rightarrow$ Validation & Canonical Summary $\rightarrow$ Synchronous ML Scoring $\rightarrow$ Analysis Briefing.

---

## 5. Traceability Matrix

| Feature | PRD Requirement | UI Location | Backend API | Database Entity | Implementation Phase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Command Center** | FR-1 | `/dashboard` | `GET /api/overview/kpis`, `GET /api/overview/ida-distribution` | `Workspace`, `MlScoredWork` | Phase 7 |
| **Investigation Queue** | FR-2 | `/queue` | `GET /api/queue` | `MlScoredWork`, `InvestigationCase` | Phase 8 |
| **Project Intelligence** | FR-3 | `/project/:id` | `GET /api/intelligence/{id}` | `MlScoredWork`, `InvestigationNote` | Phase 8 |
| **Contractor Intel** | FR-4 | `/contractors` | `GET /api/contractors` | `MlScoredWork` | Phase 9 |
| **District & IDA Matrix**| FR-5 | `/district-matrix`| `GET /api/matrix/district-ida` | `SanctionedWork`, `MlScoredWork` | Phase 10 |
| **Data Lineage** | FR-6 | `/data-lineage` | `GET /api/lineage/{work_id}` | `SanctionedWork`, `MlScoredWork` | Phase 11 |
| **Audit Trail** | FR-7 | `/audit-log` | `GET /api/audit-logs` | `AuditLog` | Phase 11 |
| **PDF Reporting** | FR-8 | Multiple Views | `GET /api/reports/project/{id}/pdf` | Report Generator Subsystem | Phase 13 |
| **Ingestion Wizard** | FR-9 | `/new-analysis` | `POST /api/workspaces/{id}/upload-dataset` | `Workspace`, `SanctionedWork` | Phase 4, 5, 6 |
