# SIH 2026 — MPLAD Intelligence Project Data Extraction Specification

## Purpose

Extract **real, currently available project information** from the MPLAD Intelligence codebase/data so it can be used for an SIH 2026 presentation.

The attached reference PDF is a 7-page SIH idea-submission template. It establishes the presentation information categories:
1. Title / problem statement
2. Proposed solution and solution flow
3. Current scenario vs proposed solution
4. Technical approach / technology stack
5. Feasibility and viability
6. Impact and benefits
7. Research and references

Reference basis: SIH26102, Smart Automation, Software category, AI-powered MPLAD anomaly/fraud/inefficiency detection concept.

---

# 1. TITLE / PROJECT IDENTITY DATA

Extract from the project/codebase:

- Problem Statement ID
- Exact Problem Statement Title used by the project
- Project / product name
- Short one-line project description
- Team name, if stored in project metadata
- Team ID, if stored
- Institution name, if stored
- Any project tagline visible in the application

Do not invent team/institution information if it is not present in the repository.

---

# 2. PROBLEM / CURRENT-SCENARIO DATA

Extract evidence from the project that explains the problem being addressed.

Look specifically for:

- Data fragmentation / multiple source feeds
- Manual or semi-manual monitoring
- Difficult project-level tracking
- Spending anomalies
- Administrative/sanction delays
- Completion/disbursement inconsistencies
- Agency concentration
- Limited visibility into risky works
- Lack of explainability
- Auditability / traceability issues
- Difficulty prioritizing projects for review

Collect the exact implemented features/data supporting each problem.
Do not write generic problem statements unless directly supported by the project.

---

# 3. PROPOSED SOLUTION DATA

Extract the actual implemented capabilities of the system, where present:

- Centralized MPLAD dataset/workspace handling
- Dataset upload and validation
- Canonical normalization
- Risk scoring
- ML anomaly detection
- Statutory/compliance rules
- Explainable alerts
- Risk queue
- District & IDA analysis
- Contractor intelligence
- Project intelligence dossier
- Data lineage / provenance
- Audit trail
- Decision-support actions
- Investigation notes / observations
- Dashboard monitoring
- Context/workspace switching
- Light/Dark theme support
- Report generation

For every capability capture:
- What it does
- Which page/module implements it
- What real data it uses
- What output it produces
- Status: implemented / partial / demo-derived / planned / unavailable

---

# 4. END-TO-END SOLUTION FLOW

Reconstruct the REAL implemented system flow, for example:

Source MPLAD Data
→ Upload / Ingestion
→ Schema Validation
→ Canonical Normalization
→ Feature Generation
→ ML / Anomaly Analysis
→ Statutory Rule Evaluation
→ Composite Risk Scoring
→ Risk Prioritization
→ Dashboard / District / Project Views
→ Explainable Alerts
→ Investigation / Review
→ Audit Trail / Lineage

For each stage capture:
- Input
- Processing
- Output
- Relevant UI/module
- Important metrics
- Data fields involved

Do not include a stage unless supported by code/project evidence.

---

# 5. DATA / DATASET INVENTORY

Extract actual dataset/file structures used by the project.

For each dataset/file:
- file name
- purpose
- required/optional status
- important columns
- source meaning
- where it is consumed
- downstream analytics depending on it

Known UI examples to verify against source code:
- Sanctioned Works Report
- Recommended Works Proposals
- Completed Works & Disbursements

Also extract any enriched/derived datasets actually present.

---

# 6. IMPORTANT RAW FIELDS

Create a structured list of important source/project fields.

### Work identity
- Work ID / project_id / work_id
- Work title / description
- Category
- State
- Constituency
- District
- MP name
- IDA / implementing agency

### Financial
- Sanctioned amount
- Recommended amount
- Disbursed amount
- Outlay
- Fund share
- Log sanctioned amount

### Dates / timing
- Recommendation date
- Sanction date
- Completion date
- Sanction processing delay
- Delay thresholds

### Status
- Project status
- Completion status
- Physical completion
- UC / certificate information where implemented

### Risk / anomaly
- ML score
- normalized ML score
- statutory/rule score
- composite risk score
- category cost z-score
- agency concentration
- disbursement variance
- completion flag
- other generated anomaly features

---

# 7. KEY NUMBERS / DEMO METRICS

Extract current metrics actually available in the project.

Potential metrics to verify:
- Total works
- Total sanctioned outlay
- MP recommendations
- Completed works
- ML anomalies
- High-risk / critical-risk works
- Medium-risk works
- Normal-risk works
- Delayed works
- Agencies / IDAs
- Districts
- Anomaly counts
- Agency concentration percentages
- Risk-score distribution
- Recommendation/disbursement feed counts
- Queue size

Every number must come from the current project/data configuration.
For every metric also record source module and source field/file if identifiable.

---

# 8. RISK SCORING DATA

Extract the actual implemented risk model.

Capture:
- ML anomaly score definition
- normalized ML score, if used
- statutory/rule score
- rule weights
- composite risk formula
- risk bands and thresholds
- number/type of statutory rules
- explainability information
- anomaly triggers

Extract exact formula/thresholds from code rather than assuming them.

---

# 9. ML / AI DATA

Extract exactly what AI/ML components exist.

Look for:
- Isolation Forest
- anomaly detection
- feature extraction
- multivariate analysis
- model score
- normalized score
- feature vector
- model metadata
- model version
- feature generation timestamps
- explainability/narrative generation
- other actual AI/ML models

For each capture model name, purpose, inputs/features, output, threshold, and UI location.

Do not claim an AI method that is not actually implemented.

---

# 10. EXPLAINABILITY DATA

Extract the evidence used to answer “Why was this project flagged?”

Potential evidence:
- category cost outlier
- administrative sanction delay
- disbursed amount variance
- agency concentration
- statutory rule violation
- anomaly intensity
- composite risk
- feature evidence
- benchmark comparison

Capture exact evidence fields and current examples.

---

# 11. DATA LINEAGE / AUDITABILITY DATA

Extract all implemented provenance/audit information.

Important fields may include:
- source feed
- row number
- canonical identifier
- transformation stages
- validation status
- normalization
- feature generation
- model scoring
- risk scoring
- transformation hash
- feature vector hash
- data hash
- lineage version
- ingestion batch ID
- timestamps
- verified stages
- audit events
- audit actors

Identify the actual transformation sequence implemented.

---

# 12. DISTRICT / IDA ANALYTICS DATA

Extract:
- district list/count
- implementing agencies
- sanctioned works by district/agency
- total outlay
- fund share
- completed works
- delayed works (>75 days or actual threshold)
- anomalies
- average risk
- agency concentration
- queue drilldown relationships

Identify calculated vs directly stored values.

---

# 13. PROJECT INTELLIGENCE DATA

Extract fields displayed in the Project Intelligence dossier.

### Project identity
- Work ID
- title
- district
- state
- constituency
- category
- implementing agency
- status

### Risk
- composite risk
- ML anomaly score
- rule score
- weights
- severity

### Compliance
- triggered statutory rules
- rule count
- rule descriptions
- severity

### Feature evidence
- feature dimension
- observed metric
- benchmark
- algorithmic evaluation
- severity

### Administrative chronology
- recommendation
- sanction
- agency assignment
- fund disbursement
- completion / verification

### Investigation
- case status
- authorized actions
- notes/observations
- officer role
- timestamps

---

# 14. CONTRACTOR INTELLIGENCE DATA

Inspect the actual implementation and determine what contractor/vendor information is available.

Extract:
- contractor/vendor identity
- linked works
- contract value
- risk
- anomalies
- delay exposure
- district/agency relationships
- repeat exposure metrics

If contractor intelligence is derived/enriched demo data, explicitly mark it DEMO / DERIVED.
Do not present fabricated contractor information as real-world verified information.

---

# 15. FEASIBILITY / VIABILITY DATA

Extract implementation-backed feasibility evidence:
- supported file formats
- schema validation
- deterministic processing
- API/backend architecture
- database integration
- scalable data handling
- model processing
- explainable output
- auditability
- human review workflow
- responsive dashboard
- export/report capability

Also capture actual limitations:
- missing contractor identifiers
- incomplete fields
- data-quality issues
- dependency on source quality
- human validation requirements
- API/data-source limitations

Do not hide known limitations.

---

# 16. IMPACT / BENEFITS DATA

Extract implementation-backed impact claims and map them to:

### Authorities
- faster identification of risky projects
- prioritization
- explainable review

### Administrators
- centralized monitoring
- investigation workflow
- audit trail

### Citizens / Public
- transparency
- project visibility
- accountability

### Government
- data-driven oversight
- risk prioritization
- better monitoring

Use only impact claims reasonably connected to implemented functionality.

---

# 17. RESEARCH / REFERENCES DATA

Extract references already present in the project/repository/documentation.

The reference PDF mentions:
- MPLADS Scheme Guidelines, 2023
- MPLADS Annual Report 2022-23
- CAG Audit Reports on MPLADS
- UNDP transparency/governance publications
- IEEE Xplore anomaly detection / XAI papers

Do not invent URLs.
If a reference is only in the PDF and not in the project, mark it:
REFERENCE-TEMPLATE ITEM; VERIFICATION REQUIRED

---

# 18. TECHNOLOGY STACK

Extract only technologies actually used by the current project.

For each:
- frontend framework
- language
- build tool
- backend framework
- database
- ORM
- Python/ML stack
- visualization library
- deployment/runtime
- supporting libraries important to architecture

The PDF contains example technologies such as React + Vite, TypeScript, Node.js + Express,
PostgreSQL + Drizzle, Python AI/ML, Chart.js, and AWS. Verify against the actual repository;
do not copy them blindly.

---

# 19. IMPLEMENTATION STATUS

For every major claimed feature classify it as:

- IMPLEMENTED
- PARTIALLY IMPLEMENTED
- DEMO / DERIVED
- PLANNED / NOT IMPLEMENTED
- DATA UNAVAILABLE

This distinction is mandatory.

---

# 20. SOURCE TRACEABILITY

For each extracted fact, store:
- Fact
- Value
- Source module/page
- Source file/table/component if identifiable
- Confidence
- Notes

This is especially important for numeric KPIs, risk formulas, ML metrics, dataset counts,
technology stack, and audit/lineage claims.

---

# OUTPUT

Create:
`SIH26102_MPLAD_Project_Data.md`

Use these main sections:
1. Project Identity
2. Problem Understanding
3. Current Scenario
4. Proposed Solution
5. Solution Flow
6. Dataset & Data Sources
7. Key Metrics
8. Risk & ML Analysis
9. Explainable Alerts
10. Data Lineage & Auditability
11. District & IDA Intelligence
12. Project Intelligence
13. Contractor Intelligence
14. Technical Architecture
15. Technology Stack
16. Feasibility & Viability
17. Impact & Benefits
18. Research & References
19. Implementation Status
20. Source Traceability

Use markdown tables for important numeric data and technology stack.

For risk bands use a table such as:
| Risk Band | Threshold | Works | % |
|---|---|---:|---:|
| Normal | ... | ... | ... |
| Medium | ... | ... | ... |
| High | ... | ... | ... |
| Critical | ... | ... | ... |

For technology:
| Layer | Technology | Evidence |
|---|---|---|
| Frontend | ... | ... |
| Backend | ... | ... |
| Database | ... | ... |
| ML/AI | ... | ... |

---

# FINAL INSTRUCTION TO ANTIGRAVITY

Do NOT make assumptions just to fill gaps.
Do NOT copy another project's metrics.
Do NOT use reference-PDF sample values as if they belong to this project.
Inspect the current repository and extract the project's REAL information.

The final Markdown file will be used as the factual source for an SIH 2026 presentation,
so accuracy and traceability are more important than quantity.

If a requested field cannot be found, write:
`NOT FOUND IN CURRENT PROJECT`

If a value exists only as demo/enriched data, write:
`DEMO / DERIVED`

If a feature is planned but not actually implemented, write:
`PLANNED / NOT IMPLEMENTED`

Before finalizing, ensure the Markdown file contains enough concrete, project-specific data
to prepare slides covering:
- problem
- solution
- architecture
- workflow
- AI/ML
- risk detection
- explainability
- feasibility
- impact
- references
