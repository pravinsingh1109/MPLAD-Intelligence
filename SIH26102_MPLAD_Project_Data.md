# SIH26102 — MPLAD Intelligence: Project Data & Technical Specification
**Single Source of Truth for SIH 2026 Presentation**

---

## 1. Project Identity

| Field | Value | Source Verification |
| :--- | :--- | :--- |
| **Problem Statement ID** | SIH26102 | `PRD.md`, `README.md`, `backend/init_db.py` |
| **Problem Statement Category** | Smart Automation / Software | `SIH26102_MPLAD_Project_Data_Extraction_Spec.md` |
| **Official Product Name** | **MPLAD Intelligence** | `frontend/src/components/shell/Sidebar.jsx`, `README.md` |
| **Project Subtitle / Tagline** | *AI-Driven Decision Support & Anomaly Audit Platform for MPLADS* | `frontend/src/components/shell/Sidebar.jsx`, `PRD.md` |
| **Target Pilot Scope** | Ludhiana Constituency (07), Punjab (Hon'ble MP Amrinder Singh Raja Warring) | `data/sanctioned_works.csv`, `backend/init_db.py` |
| **Active Demo Context** | `Demo: Ludhiana FY2024-25` (`demo-ludhiana`) | `backend/init_db.py`, `frontend/src/context/AppContext.jsx` |
| **Team Name** | `NOT FOUND IN CURRENT PROJECT` | Repository metadata |
| **Team ID** | `NOT FOUND IN CURRENT PROJECT` | Repository metadata |
| **Institution Name** | `NOT FOUND IN CURRENT PROJECT` | Repository metadata |

---

## 2. Problem Understanding

MPLADS (Members of Parliament Local Area Development Scheme) is a Central Sector Scheme administered by the Ministry of Statistics and Programme Implementation (MoSPI), Government of India. Under this scheme, ₹5.00 Crore is allocated annually per MP in two ₹2.50 Cr tranches via the Single Nodal Agency (SNA) / Public Financial Management System (PFMS).

Empirical analysis of the live dataset and CAG audit documentation identifies 6 critical operational bottlenecks:

1. **Severe Administrative Processing Latency:**
   * *Statutory Benchmark:* MoSPI Guidelines Rule 3.19 mandates Administrative Sanction (AS) issuance within **75 days** of MP recommendation.
   * *Observed Reality:* Mean sanction delay in the pilot dataset is **75.4 days** (median 54 days; maximum reaching **356 days**). **29 works (13.2%)** suffered severe delays exceeding 120 days.
2. **Implementing Agency (IDA) Workload Concentration:**
   * *Observed Reality:* A single implementing agency (`Deputy Commissioner Ludhiana IDA`) was assigned **206 out of 220 sanctioned works (93.64% scheme concentration)** representing **₹7.89 Cr (92.6%)** of total sanctioned outlays, creating structural execution bottlenecks.
3. **Multivariate Cost & Allocation Anomalies:**
   * *Observed Reality:* Standard deviation checks reveal extreme high-value capital outliers (e.g. Work `WS/MP18157/2024-2025/163249` with Category Cost Z-score of **+6.75 SD** in `Normal/Others`).
4. **Data Fragmentation Across Isolated Lifecycles:**
   * *Observed Reality:* Recommendations (`recommended_works.csv`, 242 rows), Sanctions (`sanctioned_works.csv`, 220 rows), and Disbursements (`completed_works.csv`, 59 rows) exist in unlinked tabular silos with inconsistent date formats and naming variations.
5. **Lack of Explainability in Traditional Audits:**
   * *Observed Reality:* Manual quarterly reviews fail to explain *why* specific works are delayed or whether high allocations correlate with execution velocity.
6. **Absence of Tamper-Evident Audit Trails:**
   * *Observed Reality:* Administrative reviews and case escalations historically lack immutable digital logging of officer interventions.

---

## 3. Current Scenario vs. Proposed Solution

| Operational Dimension | Current Manual / Traditional Scenario | Proposed MPLAD Intelligence Solution |
| :--- | :--- | :--- |
| **Data Ingestion** | Disparate CSV/Excel spreadsheets processed manually across offices | Centralized multi-workspace pipeline with automated MoSPI canonical schema mapping |
| **Anomaly Detection** | Retrospective sample checks (typically 5–10% sample after project completion) | Pure Python Isolation Forest ML model analyzing 100% of works across a 6D feature space |
| **Statutory Compliance** | Manual calculation of sanction delays and threshold adherence | Automated deterministic rule engine enforcing 75d/120d/180d delay limits, Z-scores, and disbursement matching |
| **Risk Scoring** | Subjective officer discretion without mathematical weighting | Hybrid Explainable Composite Risk Score: $S_{\text{risk}} = 0.60 \times S_{\text{ml}} + 0.40 \times S_{\text{rule}}$ |
| **Investigation Workflow** | Informal email/paper-based dispatching of audit teams | 3-stage authorized digital action hub (*Field Verification*, *Nodal Audit*, *Clearance*) with automated status mutation |
| **Lineage & Auditability** | Unverifiable manual spreadsheets without provenance | 5-stage cryptographic transformation pipeline with immutable timestamped action audit trail |
| **Executive Reporting** | Static quarterly tabular circulars | Real-time command center, cross-tabulated District-IDA spatial matrix, and one-click PDF dossiers |

---

## 4. Proposed Solution Capabilities

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      MPLAD INTELLIGENCE ARCHITECTURE                      │
├───────────────────────────────────────────────────────────────────────────┤
│  [WORKSPACE HUB]  →  [INGESTION & CANONICAL MAP]  →  [6D FEATURE SPACE]   │
│         │                          │                          │           │
│  [COMMAND CENTER] ←  [COMPOSITE RISK SCORING]    ←  [ISOLATION FOREST]   │
│         │                          │                          │           │
│  [RISK QUEUE (220)]→ [PROJECT INTELLIGENCE DOSSIER]→ [AUDIT & LINEAGE]    │
└───────────────────────────────────────────────────────────────────────────┘
```

### Implemented Core Modules

1. **Workspaces & Dataset Hub (`/workspaces`):**
   * Multi-workspace tenant isolation enabling simultaneous management of baseline datasets (`Demo: Ludhiana FY2024-25`) and custom user uploads.
2. **New Analysis Wizard (`/new-analysis`):**
   * 4-step interactive pipeline (*Workspace Setup* → *Feed Upload* → *Canonical Validation* → *ML Execution*) supporting CSV drag-and-drop.
3. **National Command Center (`/dashboard`):**
   * Live high-level executive KPI telemetry, scheme completion radial widgets, category cost outlay bars, and proactive early warning trigger cards.
4. **Risk & Investigation Queue (`/queue`):**
   * Paginated, full-text searchable, multi-tier filtered table (Category, Severity Band) managing all 220 monitored works.
5. **Project Intelligence Deep-Dive (`/project/:workId`):**
   * Granular dossier featuring 6-tier decision panels: Master Header, Risk Attribution Breakdown, Executive AI Narrative, Statutory Signals, 6D Feature Evidence Matrix, Forensic Chronology, Operator Investigation Workspace, and Investigation Notes Feed.
6. **District & Implementing Agency Matrix (`/district-matrix`):**
   * Cross-tabulated geographic and agency concentration grid highlighting localized anomaly density, expenditure share, and completion velocity.
7. **Contractor Intelligence Portal (`/contractors`):**
   * Aggregates executing contractor portfolios, total awarded value, completion rates, and delay exposure (*DEMO / DERIVED for demo dataset; gracefully reports unavailable for raw feeds lacking contractor columns*).
8. **Traceable Data Lineage (`/data-lineage`):**
   * Visualizes 5-stage transformation pipeline from raw ingestion to composite score with verified state checkmarks and raw attribute mapping.
9. **Governance & Audit Trail Log (`/audit-log`):**
   * Immutable, filterable chronology of all administrative actions, schema validation runs, and officer notes.

---

## 5. End-to-End Solution Flow

```
[ Step 1: Ingestion ]
User uploads CSV data feeds (Sanctioned, Recommended, Completed)
         │
         ▼
[ Step 2: Canonical Normalization & Schema Validation ]
`normalizer.py` matches raw headers against MoSPI aliases; validates mandatory columns (Work ID, Amount)
         │
         ▼
[ Step 3: Feature Engineering (6 Dimensions) ]
`ml_engine.py` constructs standardized 6D vector: [Delay, Log Amount, Cost Z-Score, Agency Share, Completion Flag, Disbursed Variance]
         │
         ▼
[ Step 4: Machine Learning Isolation Forest ]
100 unpruned Isolation Trees compute average path length $h(x)$ and anomaly intensity $S_{\text{ml}} \in [0, 100]$
         │
         ▼
[ Step 5: Deterministic Statutory Rule Engine ]
Evaluates MoSPI delay thresholds (>90d, >120d, >180d), category cost Z-scores (>1.5, >2.5), and allocation magnitude → $S_{\text{rule}} \in [0, 100]$
         │
         ▼
[ Step 6: Composite Risk Index Formulation ]
Computes $S_{\text{risk}} = 0.60 \times S_{\text{ml}} + 0.40 \times S_{\text{rule}}$; classifies into CRITICAL, HIGH, MEDIUM, or NORMAL band
         │
         ▼
[ Step 7: Decision Support & Investigation ]
Officers filter priority works in Queue, review 6D evidence in Project Intelligence, and issue formal verification orders
         │
         ▼
[ Step 8: Lineage Sealing & Audit Logging ]
Every action recorded in `audit_logs` table; official PDF dossiers exported with cryptographic integrity
```

---

## 6. Dataset & Data Sources Inventory

| Dataset / File | Path | Status | Records | Outlay | Key Ingested Fields | Consumers |
| :--- | :--- | :--- | ---:| ---:| :--- | :--- |
| **Sanctioned Works Report** | `data/sanctioned_works.csv` | **MANDATORY** | 220 | ₹8.52 Cr | `Work`, `Work Description`, `Work Category`, `Implementing Agency`, `District`, `Sanction Amount ( ₹ )`, `Sanction Date`, `Work Status` | Ingestion Pipeline, ML Scorer, Command Center, Queue |
| **Recommended Works Proposals** | `data/recommended_works.csv` | **OPTIONAL** | 242 | ₹9.32 Cr | `Sr. No.`, `RECOMMENDED WORK`, `RECOMMENDED AMOUNT ( ₹ )`, `RECOMMENDATION DATE`, `DISTRICT` | Date Imputation Engine, Sanction Delay Calculator |
| **Completed Works & Disbursements** | `data/completed_works.csv` | **OPTIONAL** | 59 | ₹1.84 Cr | `Sr. No.`, `Work Description`, `Amount Disbursed ( ₹ )`, `Completion Date`, `District` | Completion Verifier, Disbursement Variance Feature |
| **Pre-Scored Baseline Export** | `data/ml_scored_works.json` | **SYSTEM ARTIFACT** | 220 | ₹8.52 Cr | Complete pre-computed 6D feature dictionaries, anomaly scores, rule explanations | DB Seed Script (`init_db.py`) |
| **Sample Scalability Test Feed** | `data/mplad_sample_500.csv` | **TEST FEED** | 500 | ~₹22.5 Cr | Synthesized 500-record dataset for throughput and multi-tenant testing | Batch Test Scripts |

---

## 7. Key Empirical Numbers & Baseline Metrics

*All values verified against `data/sanctioned_works.csv`, `backend/init_db.py`, and `backend/mplads.db`.*

### High-Level Summary Metrics

| Metric Description | Exact Value | Source Verification |
| :--- | ---:| :--- |
| **Total Monitored Works** | **220** | `sanctioned_works.csv`, `Workspace.total_sanctioned_works` |
| **Total Sanctioned Outlay** | **₹8,51,87,000 (₹8.52 Cr)** | Sum of `sanctioned_amount` across 220 records |
| **Total MP Recommendations Ingested** | **242 Works (₹9.32 Cr)** | `recommended_works.csv` |
| **Total Completed Works in Feed** | **59 Works (₹1.84 Cr)** | `completed_works.csv` |
| **Mean Sanction Processing Delay** | **75.4 Days** (Median: 54d, Max: 356d) | `ml_engine.py` statistical baseline |
| **ML Anomaly Candidates ($S_{\text{ml}} \ge 70.0$)** | **7 Works (3.2%)** | `ml_scored_works` table (`is_ml_anomaly == True`) |
| **Active Proactive Early Warning Triggers** | **3 Active Triggers** | `GET /api/overview/early-warnings` |
| **Districts Covered** | **5 Districts** (Ludhiana primary: 216 works) | `district-ida` matrix aggregation |
| **Implementing Agencies (IDAs)** | **5 Agencies** (DC Ludhiana primary: 206 works) | `district-ida` matrix aggregation |

---

### Risk Band Distribution ($S_{\text{risk}}$)

| Severity Band | Risk Threshold | Work Count | % Share | Total Outlay | Empirical Meaning |
| :--- | :--- | ---:| ---:| ---:| :--- |
| **CRITICAL RISK PRIORITY** | $S_{\text{risk}} \ge 75.0$ | **0** | 0.0% | ₹0.00 Cr | Immediate escalation required (no works in pilot met $\ge 75.0$) |
| **HIGH RISK PRIORITY** | $60.0 \le S_{\text{risk}} < 75.0$ | **4** | 1.8% | ₹0.75 Cr | Top candidate works requiring formal field verification |
| **MEDIUM RISK PRIORITY** | $40.0 \le S_{\text{risk}} < 60.0$ | **13** | 5.9% | ₹0.88 Cr | Moderate delay or single category cost deviation |
| **NORMAL RISK** | $S_{\text{risk}} < 40.0$ | **203** | 92.3% | ₹6.89 Cr | Standard statutory compliance within operational bounds |
| **TOTAL** | — | **220** | **100.0%** | **₹8.52 Cr** | **Full Monitored Constituency Portfolio** |

---

### Implementing Agency (IDA) Concentration

| Implementing Agency | Works | Work Share | Sanctioned Outlay | Outlay Share | Anomaly Count |
| :--- | ---:| ---:| ---:| ---:| ---:|
| **Ludhiana (Deputy Commissioner IDA)** | 206 | **93.6%** | ₹7,89,17,000 | **92.6%** | 7 |
| **Sri Muktsar Sahib (DC IDA)** | 11 | **5.0%** | ₹51,70,000 | **6.1%** | 0 |
| **Jalandhar (DC IDA)** | 1 | **0.5%** | ₹5,00,000 | **0.6%** | 0 |
| **Ferozepur (DC IDA)** | 1 | **0.5%** | ₹3,00,000 | **0.4%** | 0 |
| **Fazilka (DC IDA)** | 1 | **0.5%** | ₹3,00,000 | **0.4%** | 0 |

---

### Official Scheme Status Breakdown

| Official Work Status in Feed | Count | Share (%) | Outlay (₹ Lakhs) |
| :--- | ---:| ---:| ---:|
| **Sanction Issued** | 104 | 47.3% | ₹412.50 |
| **Physical Inspection** | 51 | 23.2% | ₹198.20 |
| **Vendor Identification** | 33 | 15.0% | ₹124.67 |
| **Work Partially Completed** | 22 | 10.0% | ₹84.50 |
| **Work Completed** | 9 | 4.1% | ₹29.00 |
| **Time Estimation** | 1 | 0.5% | ₹3.00 |

---

## 8. Risk Engine & Machine Learning Specification

### 8.1 Composite Risk Formula

$$\Large S_{\text{risk}} = 0.60 \times S_{\text{ml}} + 0.40 \times S_{\text{rule}}$$

* **ML Weight ($w_{\text{ml}}$):** `0.60` (60%)
* **Rule Weight ($w_{\text{rule}}$):** `0.40` (40%)
* **Score Bounds:** $S_{\text{risk}} \in [0.0, 100.0]$

---

### 8.2 6-Dimensional Feature Space ($\mathbf{x}_i$)

Implemented in `backend/ml_engine.py` (lines 182–213):

1. **$x_1$ — `sanction_delay_days` (Continuous):**
   * $\text{Delay} = \text{Date}_{\text{Sanction}} - \text{Date}_{\text{Recommendation}}$ (fallback to empirical mean 75.35 days if recommendation date missing).
2. **$x_2$ — `log_sanction_amount` (Continuous):**
   * $\ln(1.0 + \text{Sanctioned Amount in INR})$. Normalizes wide monetary skews ($₹50\text{k}$ to $₹25\text{Lakhs}$).
3. **$x_3$ — `category_cost_zscore` (Continuous):**
   * $Z_{\text{cost}} = \frac{\text{Amount} - \mu_{\text{category}}}{\sigma_{\text{category}}}$. Measures project cost deviation relative to its specific sector.
4. **$x_4$ — `ida_concentration_pct` (Continuous):**
   * Percentage share of total constituency works assigned to this specific implementing agency ($0.0\%\text{--}100.0\%$).
5. **$x_5$ — `is_completed_flag` (Binary):**
   * `1.0` if matched in completed progress feed; `0.0` otherwise.
6. **$x_6$ — `disbursed_variance_pct` (Continuous):**
   * $|1.0 - (\text{Disbursed Amount} / \text{Sanctioned Amount})| \times 100.0$. Measures financial release deviation.

---

### 8.3 Machine Learning Algorithm: Pure Python Isolation Forest

* **Algorithm:** Unsupervised Isolation Forest (`IsolationForestModel` in `backend/ml_engine.py`).
* **Implementation Details:**
  * *Estimators ($n_{\text{trees}}$):* 100 unpruned Isolation Trees.
  * *Subsample Size ($\psi$):* $\min(256, n_{\text{samples}})$.
  * *Tree Height Limit:* $h_{\max} = \lceil \log_2(\psi) \rceil = 8$.
  * *Average Path Length Correction Factor:*
    $$c(n) = 2 \left( \ln(n - 1) + 0.5772156649 \right) - \frac{2(n - 1)}{n}$$
  * *Raw Anomaly Score:*
    $$s(x, n) = 2^{-\frac{\mathbb{E}(h(x))}{c(n)}}$$
  * *Normalized Score ($S_{\text{ml}}$):*
    $$S_{\text{ml}} = \left( \frac{s(x) - s_{\min}}{s_{\max} - s_{\min}} \right) \times 100.0$$
* **Anomaly Decision Threshold:** $S_{\text{ml}} \ge 70.0$ classifies record as `is_ml_anomaly = True`.

---

### 8.4 Deterministic Statutory Rule Engine ($S_{\text{rule}}$)

Accumulates penalty points up to a capped maximum of 100.0:

| Rule ID | Violation Description | Trigger Condition | Penalty Points |
| :--- | :--- | :--- | ---:|
| **R1.1** | Critical Administrative Delay | $\text{Delay} > 180\text{ Days}$ | **+40 pts** |
| **R1.2** | Severe Administrative Delay | $120 < \text{Delay} \le 180\text{ Days}$ | **+25 pts** |
| **R1.3** | Statutory Breach Delay | $90 < \text{Delay} \le 120\text{ Days}$ | **+10 pts** |
| **R2.1** | Extreme Category Cost Outlier | $Z_{\text{cost}} > +2.50\text{ SD}$ in Category | **+35 pts** |
| **R2.2** | Moderate Category Cost Outlier | $1.50 < Z_{\text{cost}} \le +2.50\text{ SD}$ | **+20 pts** |
| **R3.1** | Mega Project Allocation | $\text{Sanction Amount} \ge ₹1.50\text{ Cr}$ | **+25 pts** |
| **R3.2** | High Value Project Allocation | $₹50\text{ Lakhs} \le \text{Amount} < ₹1.50\text{ Cr}$ | **+15 pts** |
| **R4.1** | Duplicate Title Cluster Match | Exact lowercase title appears $>1$ times in feed | **+15 pts** |
| **R5.1** | Disbursed Variance Deviation | Disbursed amount variance $> 20.0\%$ | **+20 pts** |

---

## 9. Top Project Risk Candidates (Pilot Dataset Deep-Dive)

*Real empirical examples extracted from `backend/mplads.db`:*

| Work ID | Title / Description | Category | Sanction (₹) | $S_{\text{ml}}$ | $S_{\text{rule}}$ | $S_{\text{risk}}$ | Severity Band | Key Evidence |
| :--- | :--- | :--- | ---:| ---:| ---:| ---:| :--- | :--- |
| `WS/MP18157/2024-2025/163249` | Public Lift, Lawyers Chamber Complex, Jagraon | Normal/Others | ₹25.0 L | **92.4** | 35.0 | **69.4** | **HIGH RISK PRIORITY** | $Z_{\text{cost}} = +6.75\text{ SD}$, Agency share 93.6%, Anomaly Candidate |
| `WS/MP18157/2024-2025/163250` | Special Repairs of Library, Court Complex, Jagraon | Normal/Others | ₹25.0 L | **91.8** | 35.0 | **69.1** | **HIGH RISK PRIORITY** | $Z_{\text{cost}} = +6.75\text{ SD}$, Repeat title match cluster, Anomaly Candidate |
| `WS/MP18157/2024-2025/163251` | Construction of Bar Room, Court Complex, Jagraon | Normal/Others | ₹25.0 L | **90.6** | 35.0 | **68.4** | **HIGH RISK PRIORITY** | $Z_{\text{cost}} = +6.75\text{ SD}$, Single location cluster exposure |
| `WS/MP18157/2024-2025/169462` | Providing & Fixing 2 Nos Escalators at Railway Station | Normal/Others | ₹0.30 L | **88.2** | 35.0 | **66.9** | **HIGH RISK PRIORITY** | Severe delay (>180d imputed), Agency concentration |

---

## 10. Data Lineage & Provenance Architecture

The data lineage module (`/data-lineage` and `GET /api/lineage/{work_id}`) tracks every project across **5 distinct transformation stages**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      5-STAGE DATA LINEAGE PIPELINE                     │
├────────────────────────────────────────────────────────────────────────┤
│ Stage 1: CSV Ingestion & Canonical Schema Mapping                      │
│   → Validates raw headers; maps to canonical `work_id`                 │
│ Stage 2: Data Cleaning & Monetary Normalization                        │
│   → Standardizes INR currency strings to Lakhs; cleans dates           │
│ Stage 3: 6-Dimensional Multivariate Feature Extraction                 │
│   → Calculates Z-scores, log transforms, and concentration ratios       │
│ Stage 4: AI/ML Isolation Forest & Statutory Rule Scoring               │
│   → Runs 100 iTrees for $S_{\text{ml}}$ and rules for $S_{\text{rule}}$ │
│ Stage 5: Composite Risk Index Formulation & Decision Triage            │
│   → Applies $0.60/0.40$ weights; assigns severity band & dossier       │
└────────────────────────────────────────────────────────────────────────┘
```

### Forensic Metadata Sealed per Work Record:
* **Canonical Identifier:** e.g. `WS/MP18157/2024-2025/163249`
* **Source Feed Trace:** Matched against `sanctioned_works.csv` (Row #35), `recommended_works.csv` (Matched), `completed_works.csv` (Unmatched).
* **Cryptographic Provenance Hash:** 64-character SHA-256 state seal (e.g. `7F3A982CB104...`).
* **Traceability Guarantee:** 100% deterministic recalculation from raw CSV inputs.

---

## 11. Governance & Audit Trail Specification

Implemented in `backend/models.py` (`AuditLog` table) and exposed via `/audit-log`:

| Action / Event Type | Actor Role | Trigger Context | State Transition |
| :--- | :--- | :--- | :--- |
| `DATASET_INGESTION` | System Ingestion Engine | User uploads CSV files via `/new-analysis` | `RAW` → `INGESTION_COMPLETED` |
| `SCHEMA_VALIDATION` | MoSPI Canonical Validator | Header mapping against canonical dictionary | `INGESTION_COMPLETED` → `CANONICAL_CONFORMANT` |
| `CANONICAL_NORMALIZATION`| Data Governance Pipeline | Currency and date normalization run | `CANONICAL_CONFORMANT` → `NORMALIZED` |
| `FEATURE_GENERATION` | Feature Engineering Engine | 6D vector computation | `NORMALIZED` → `FEATURES_EXTRACTED` |
| `ML_ANOMALY_DETECTION` | Isolation Forest Model v2.1 | Isolation Forest tree scoring | `FEATURES_EXTRACTED` → `ANOMALY_FLAGGED` |
| `STATUTORY_RULE_EVAL` | Statutory Rule Engine | Deterministic threshold evaluation | `ANOMALY_FLAGGED` → `RULES_EVALUATED` |
| `RISK_PRIORITIZATION` | Risk Scoring Matrix | Composite $S_{\text{risk}}$ formulation | `RULES_EVALUATED` → `RISK_SCORED` |
| `NODAL_VERIFICATION_REQ` | State Nodal Officer | Officer clicks "Start Formal Verification" | `UNDER REVIEW` → `MARKED FOR FIELD VERIFICATION` |
| `FIELD_INSPECTION_ORDERED`| District Monitoring Cell | Officer clicks "Request Nodal Agency Audit" | `UNDER REVIEW` → `REQUEST NODAL AGENCY AUDIT` |
| `CLEAR_AFTER_REVIEW` | State Nodal Officer | Officer clicks "Clear Project After Review" | `UNDER REVIEW` → `CLEARED AFTER REVIEW` |
| `INVESTIGATION_NOTE_ADDED`| State Nodal Officer | Officer submits rich text field note | Unchanged (Appends to note stream) |

---

## 12. Contractor Intelligence Module

* **Status:** `DEMO / DERIVED` for baseline demo dataset; `DATA UNAVAILABLE` for raw CSV uploads without contractor columns.
* **Mechanism:**
  * In the pilot dataset, raw MoSPI CSV exports do not provide direct vendor columns.
  * For the Ludhiana demo workspace, `backend/init_db.py` derives realistic executing bodies (e.g. *Northern Railway & Infra Engineering Ltd*, *PWSSB Ludhiana*, *PSPCL Civil*, *GLADA Projects Div*, *DRDA Ludhiana Works*).
  * For user-uploaded custom CSVs, if no vendor column is detected, the UI gracefully renders:  
    `"Contractor intelligence unavailable for this dataset because contractor identifiers are not present in the uploaded data feeds."`

---

## 13. Technology Stack & Architecture

### Full-Stack Architecture Table

| Architectural Layer | Technology / Library | Version | Verified Source File |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.8` | `frontend/package.json` |
| **DOM Renderer** | React DOM | `^19.2.8` | `frontend/package.json` |
| **Client-Side Routing** | React Router DOM | `^7.18.3` | `frontend/package.json`, `frontend/src/App.jsx` |
| **Data Visualizations** | Recharts (Responsive SVG Charts) | `^3.10.1` | `frontend/package.json` |
| **Iconography** | Lucide React | `^1.35.0` | `frontend/package.json` |
| **Build & Dev Tooling** | Vite | `^8.2.2` | `frontend/package.json`, `vite.config.js` |
| **Frontend Linter** | Oxlint | `^1.79.0` | `frontend/package.json` |
| **Styling Engine** | Vanilla CSS Tokens + Dual Themes | Custom CSS Variables | `frontend/src/index.css` |
| **Backend REST API** | FastAPI | `>=0.100.0` | `backend/requirements.txt`, `backend/main.py` |
| **ASGI Web Server** | Uvicorn | `>=0.22.0` | `backend/requirements.txt` |
| **ORM & Persistence** | SQLAlchemy | `>=2.0.0` | `backend/requirements.txt`, `backend/models.py` |
| **Relational Database** | SQLite 3 | Embedded | `backend/database.py`, `backend/mplads.db` |
| **Data Validation** | Pydantic v2 | `>=2.0.0` | `backend/requirements.txt`, `backend/schemas.py` |
| **Machine Learning Engine** | Pure Python Isolation Forest | Built-in (Standard Library) | `backend/ml_engine.py` (zero external C-dep) |
| **Document Generation** | Pure Python Binary PDF Engine | Built-in Canvas Drawing | `backend/pdf_generator.py` |

---

## 14. Implementation Status Matrix

| Major System Capability | Implementation Classification | Codebase Evidence |
| :--- | :--- | :--- |
| **Multi-Workspace Isolation** | **IMPLEMENTED** | `models.py` (`Workspace`), `main.py` (`/api/workspaces`) |
| **CSV Ingestion & Canonical Mapping** | **IMPLEMENTED** | `normalizer.py`, `main.py` (`/api/workspaces/{id}/upload`) |
| **Pure Python Isolation Forest ML** | **IMPLEMENTED** | `ml_engine.py` (`IsolationForestModel`) |
| **Deterministic Statutory Rule Engine**| **IMPLEMENTED** | `ml_engine.py` (`run_ml_pipeline`) |
| **Explainable Composite Risk Scoring** | **IMPLEMENTED** | `ml_engine.py` ($S_{\text{risk}} = 0.60 S_{\text{ml}} + 0.40 S_{\text{rule}}$) |
| **National Command Center Dashboard** | **IMPLEMENTED** | `frontend/src/pages/DashboardPage.jsx` |
| **Risk & Investigation Queue** | **IMPLEMENTED** | `frontend/src/pages/QueuePage.jsx` |
| **Project Intelligence Deep Dossier** | **IMPLEMENTED** | `frontend/src/pages/IntelligencePage.jsx` |
| **District & IDA Concentration Matrix**| **IMPLEMENTED** | `frontend/src/pages/DistrictMatrixPage.jsx` |
| **Traceable 5-Stage Data Lineage** | **IMPLEMENTED** | `frontend/src/pages/DataLineagePage.jsx`, `main.py` (`/api/lineage`) |
| **Immutable Action Audit Trail Log** | **IMPLEMENTED** | `frontend/src/pages/AuditLogPage.jsx`, `models.py` (`AuditLog`) |
| **Dual Theme System (Light / Dark)** | **IMPLEMENTED** | `frontend/src/index.css` (`:root` / `[data-theme="light"]`) |
| **PDF Dossier & Executive Export** | **IMPLEMENTED** | `backend/pdf_generator.py`, `main.py` (`/api/projects/{id}/pdf`) |
| **Contractor Intelligence Portal** | **DEMO / DERIVED** | Derived for demo; gracefully reported unavailable on raw feeds |
| **Live e-SAKSHI Direct API Scraper** | **PLANNED / NOT IMPLEMENTED** | Relies on official CSV export feeds; direct portal sync planned |
| **GeoJSON GIS Boundary Map Overlay** | **PLANNED / NOT IMPLEMENTED** | Tabular spatial matrix implemented; vector GIS shapefiles planned |

---

## 15. Feasibility, Strengths & Genuine Limitations

### 15.1 Technical Strengths & Feasibility
1. **Zero External Heavyweight ML Dependencies:**
   * The Isolation Forest is implemented in pure Python (`math`, `random`), eliminating binary compilation issues (C++/Fortran) and allowing seamless deployment in low-resource government cloud/air-gapped servers.
2. **Deterministic & Repeatable Scoring:**
   * Seeded pseudo-random initialization (`random_state=42`) ensures that running analysis on identical data produces 100% bit-identical anomaly scores.
3. **Resilient Schema Normalization:**
   * Alias dictionary in `normalizer.py` matches over 50 variations of column headers across historical MoSPI and state portal exports.

### 15.2 Genuine Implementation Limitations
1. **Source Data Quality & Missing Recommendation Dates:**
   * In raw government exports, recommendation dates are frequently omitted or marked `NA`. The system addresses this via statistical mean baseline imputation (**75.35 days**), but explicit metadata tags (`is_recommendation_date_imputed = true`) are required to prevent false audit assertions.
2. **Contractor Identity Omission in Public Feeds:**
   * Standard public e-SAKSHI citizen reports do not mandate contractor registration identifiers in general scheme downloads, limiting contractor network analytics unless specialized tender feeds are uploaded.
3. **Human Decision-Support Boundary:**
   * The system is explicitly an **AI Decision-Support System**, not an automated prosecution tool. Scores triage works for priority inspection by authorized human officers.

---

## 16. Research & Policy References

1. **Ministry of Statistics and Programme Implementation (MoSPI):**
   * *Guidelines on Members of Parliament Local Area Development Scheme (MPLADS)*, Government of India, Revised April 2023. *(Rule 3.19: 75-Day Sanction Issuance Mandate).*
2. **MoSPI:**
   * *e-SAKSHI Portal Functional Requirements & Operational Manual*, 2023. *(Data integration protocols).*
3. **Comptroller and Auditor General of India (CAG):**
   * *Performance Audit Reports on MPLADS Implementation (Union Government & State Chapters: Punjab, Maharashtra, Karnataka)*. *(Documented administrative delays, unspent fund parking, and contractor concentration).*
4. **Central Vigilance Commission (CVC):**
   * *Vigilance Manual & Guidelines on Preventive Vigilance in Public Procurement and Civil Infrastructure Works*, 2021. *(Cartelization and work-splitting detection criteria).*
5. **Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008):**
   * *Isolation Forest*. IEEE International Conference on Data Mining (ICDM), pp. 413-422. *(Algorithmic foundation for unsupervised path-length anomaly scoring).*

---

## 17. Source Traceability Matrix

| Fact / Metric / Claim | Exact Value | Source Code / File | Module / Page | Confidence |
| :--- | :--- | :--- | :--- | :--- |
| **Total Monitored Works** | 220 Records | `data/sanctioned_works.csv`, `backend/init_db.py:93` | Command Center, Queue | 100% Verified |
| **Total Sanctioned Outlay** | ₹8.52 Cr (₹8,51,87,000) | `data/sanctioned_works.csv`, `backend/init_db.py:351` | Command Center | 100% Verified |
| **ML Anomalies ($S_{\text{ml}} \ge 70$)** | 7 Works | `data/ml_scored_works.json`, `backend/ml_engine.py:235` | Command Center, Lineage | 100% Verified |
| **Mean Sanction Delay** | 75.4 Days | `backend/ml_engine.py:133`, `scripts/audit_data.py:34` | Project Intelligence | 100% Verified |
| **Risk Formula Weights** | $0.60 \times \text{ML} + 0.40 \times \text{Rule}$ | `backend/ml_engine.py:292`, `ScoreBreakdown.jsx:104` | Project Intelligence | 100% Verified |
| **Isolation Trees Count** | 100 trees, subsample 256 | `backend/ml_engine.py:215` | AI/ML Pipeline | 100% Verified |
| **Top Implementing Agency** | DC Ludhiana (93.6% share) | `backend/init_db.py:99`, `DistrictMatrixPage.jsx` | District & IDA Matrix | 100% Verified |
| **High Risk Priority Works** | 4 Works ($S_{\text{risk}} \ge 60.0$) | `backend/init_db.py:358`, `backend/ml_engine.py:298` | Queue, Dashboard | 100% Verified |
| **Frontend Framework** | React 19 + React Router 7 + Vite 8 | `frontend/package.json` | Global Application | 100% Verified |
| **Backend REST Engine** | FastAPI + SQLAlchemy + SQLite | `backend/requirements.txt`, `backend/main.py` | Global Application | 100% Verified |
