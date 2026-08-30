# Domain Research & Statutory Compliance Specification (DOMAIN_RESEARCH.md)
*SIH26102 · AI-Powered Anomaly, Inefficiency, and Risk Detection in MPLADS Implementation*

---

## 1. Executive Summary & Regulatory Context

The **Members of Parliament Local Area Development Scheme (MPLADS)** is a Central Sector Scheme administered by the **Ministry of Statistics and Programme Implementation (MoSPI)**, Government of India. It enables Members of Parliament (MPs) to recommend developmental works of capital nature based on locally felt community needs.

Under current operational guidelines (effective April 1, 2023, and integrated with the **e-SAKSHI digital portal**), each MP is entitled to recommend developmental works up to **₹5.00 Crore per financial year**, disbursed in two equal tranches of ₹2.50 Crore via the **Single Nodal Agency (SNA)** / Public Financial Management System (PFMS).

### Purpose of this Document
This document establishes the authoritative domain foundation for SIH26102. It synthesizes:
1. **MoSPI Operational Guidelines (2016, 2023 revision)**
2. **Comptroller & Auditor General (CAG) of India Performance Audit Reports on MPLADS**
3. **Central Vigilance Commission (CVC) Guidelines on Public Procurement & Cartelization**
4. **Public Financial Management System (PFMS / SNA) Fund Flow Directives**

---

## 2. Statutory Administrative Workflow & Milestones

The formal administrative lifecycle of an MPLADS work consists of 5 tightly coupled stages:

```
[ Stage 1: Recommendation ]
Hon'ble MP recommends work via e-SAKSHI portal with estimated cost
                 │
                 ▼
[ Stage 2: Technical Sanction & Administrative Sanction (AS) ]
District Authority (District Magistrate / Deputy Commissioner) verifies eligibility,
selects Implementing Agency (IDA), checks technical estimates, and issues AS within 75 days.
                 │
                 ▼
[ Stage 3: Tender & Contractor Award ]
Implementing Agency initiates tendering/work order according to State Financial Rules.
                 │
                 ▼
[ Stage 4: Execution & Milestone Fund Release ]
Funds released just-in-time from Single Nodal Account (SNA). Stage-wise geo-tagged photos uploaded.
                 │
                 ▼
[ Stage 5: Completion, Utilization & Handover ]
Final Completion Certificate (CC) & Utilization Certificate (UC) uploaded. Asset entered into National Registry.
```

---

## 3. Authoritative Audit Findings (CAG of India & Ministry Reviews)

Independent audits by the CAG have identified 6 recurring systemic vulnerabilities across MPLADS implementation nationwide:

| Vulnerability Category | CAG Audit Finding & Statutory Reference | Analytical Detection Strategy in SIH26102 |
| :--- | :--- | :--- |
| **1. Severe Administrative Delays** | MoSPI Rule 3.19 mandates sanction within **75 days** of MP recommendation. CAG audits show $30\text{–}60\%$ of works exceed 180+ days before AS issue. | Calculate `sanction_delay_days = sanct_date - rec_date`. Trigger high-risk anomaly if $>75\text{ days}$ or $>2.0\text{ SD}$ above district mean. |
| **2. Fund Parking & Idle Balances** | Funds drawn from SNA treasury parked in savings/current accounts of IDAs for $>12\text{ months}$ without physical progress or UC submission. | Detect disbursement without physical milestone completion (`disbursed_amount > 0` while `is_completed == False` and duration $>365\text{ days}$). |
| **3. Agency & Contractor Cartelization** | Disproportionate concentration of works awarded to a single Implementing Agency or contractor syndicate without competitive capacity checks. | Herfindahl-Hirschman Index (HHI) and percentage concentration analysis (`ida_concentration_pct`, contractor portfolio exposure). |
| **4. Cost Outliers & Work Splitting** | Splitting large infrastructure works into multiple smaller parcels ($< ₹10\text{ Lakhs}$) to evade higher-level technical approval or competitive e-tendering. | Multivariate Isolation Forest outlier scoring on `category_cost_zscore` combined with title clustering for duplicate/split works. |
| **5. Inadmissible & Commercial Works** | MPLADS Guidelines Para 5.1 strictly prohibits creation of private assets, commercial shopping complexes, or religious structures. | Natural language categorization and statutory keyword rule matching against prohibited expenditure lists. |
| **6. SC/ST Earmarking Compliance** | Mandatory minimum allocation of **15%** for Scheduled Caste (SC) areas and **7.5%** for Scheduled Tribe (ST) areas annually. | Aggregated district-level and constituency-level demographic expenditure validation. |

---

## 4. Anomaly Taxonomy & Risk Classification Standard

To avoid false accusations and adhere to judicial/vigilance standards, SIH26102 enforces strict language guidelines:
- Flags are designated as **"Anomaly Candidates"**, **"Risk Indicators"**, or **"Irregularity Signals"**.
- A high score indicates **"High Priority for Inspection / Review"**, **NEVER** "Confirmed Fraud".

### Categorized Anomaly Dimensions:
1. **Cost Outlier ($A_{\text{cost}}$):** Sanctioned cost deviates $> 2.0$ Standard Deviations from category baseline.
2. **Sanction Processing Delay ($A_{\text{delay}}$):** Time gap between MP recommendation and AS exceeds 75 statutory days.
3. **Disbursement Velocity Anomaly ($A_{\text{disb}}$):** Disbursed amount significantly exceeds or lags behind physical execution milestones.
4. **Implementing Agency Concentration ($A_{\text{agency}}$):** More than $50\%$ of constituency outlay allocated to a single executing body.
5. **Contractor Monopoly ($A_{\text{contractor}}$):** Repeated contract awards to a single contractor entity with elevated delay or cost variance rates.
6. **Statutory Threshold Violation ($A_{\text{rule}}$):** Specific non-compliance with MoSPI guidelines (e.g. unrecommended sanction, missing dates, extreme delay).

---

## 5. Risk Scoring Formula Specification

$$\Large S_{\text{risk}} = 0.60 \times S_{\text{ml}} + 0.40 \times S_{\text{rule}}$$

Where:
- **$S_{\text{ml}} \in [0, 100]$:** Pure Python Isolation Forest anomaly intensity computed across a 6-dimensional standardized feature space:
  $$\mathbf{x} = \left[ \tilde{z}_{\text{cost}}, \tilde{d}_{\text{delay}}, \tilde{p}_{\text{disb}}, \tilde{c}_{\text{agency}}, \tilde{v}_{\text{rec\_sanct}}, \tilde{s}_{\text{status}} \right]$$
- **$S_{\text{rule}} \in [0, 100]$:** Statutory compliance penalty index accumulating triggered violations:
  - Extreme Administrative Delay ($>120$ days): $+35\text{ pts}$
  - Elevated Administrative Delay ($>75$ days): $+20\text{ pts}$
  - Sanction without MP Recommendation Match: $+25\text{ pts}$
  - High Implementing Agency Concentration ($>60\%$): $+20\text{ pts}$
  - Significant Category Cost Deviation ($>2.5\text{ SD}$): $+25\text{ pts}$
  - Extreme Disbursement Discrepancy: $+20\text{ pts}$

---

## 6. Official Domain References & Bibliography

1. **Ministry of Statistics and Programme Implementation (MoSPI):** *Guidelines on Members of Parliament Local Area Development Scheme (MPLADS)*, Government of India, Revised April 2023.
2. **MoSPI:** *e-SAKSHI Portal Functional Requirement Specifications & User Manual*, 2023.
3. **Comptroller and Auditor General of India (CAG):** *Report No. 31 of 2010-11 - Performance Audit of Members of Parliament Local Area Development Scheme (MPLADS)*.
4. **CAG of India:** *State Performance Audit Reports on MPLADS Implementation (Punjab, Maharashtra, Karnataka, Uttar Pradesh 2018–2023)*.
5. **Central Vigilance Commission (CVC):** *Vigilance Manual & Guidelines on Preventive Vigilance in Public Procurement and Infrastructure Works*, 2021.
6. **Public Financial Management System (PFMS):** *Standard Operating Procedure for Single Nodal Account (SNA) System in Central Sector Schemes*, Department of Expenditure, Ministry of Finance, 2022.
