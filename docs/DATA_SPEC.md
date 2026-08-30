# Data Specification & Canonical Schema Standard (DATA_SPEC.md)
*SIH26102 · AI-Powered MPLADS Monitoring, Anomaly Detection & Investigation Platform*

---

## 1. Canonical Schema & Column Alias Dictionary

The normalizer accepts raw constituency CSV feeds and automatically maps variations into standard internal attributes:

| Canonical Field | Required | Description | Recognized Alias Headers |
| :--- | :--- | :--- | :--- |
| `work_id` | **YES** | Unique alphanumeric work identifier | `project_id`, `work_id`, `work`, `work code`, `work_code`, `id`, `project code`, `sl. no`, `sr no` |
| `sanctioned_amount` | **YES** | Sanctioned cost | `sanctioned_amount`, `sanction amount`, `sanction amount inr`, `sanction amount ( ₹ )`, `sanction_cost`, `amount sanctioned` |
| `work_description` | NO | Project title / work scope | `work_description`, `work description`, `title`, `work name`, `project_name`, `work`, `description` |
| `category` | NO | Development sector | `category`, `work_category`, `sector`, `work category`, `scheme category`, `type of work` |
| `implementing_agency`| NO | Executing authority | `implementing_agency`, `ida`, `agency`, `implementing agency`, `executing agency`, `ia` |
| `district` | NO | Administrative district | `district`, `district_name`, `district name` |
| `state` | NO | State or UT name | `state`, `state_name`, `state name` |
| `mp_name` | NO | Sponsoring MP | `mp_name`, `mp name`, `hon'ble mp`, `member of parliament`, `mp` |
| `constituency` | NO | Constituency name / ID | `constituency`, `constituency_id`, `constituency name`, `lok sabha constituency` |
| `sanction_date` | NO | Date of AS issuance | `sanction_date`, `sanction date`, `as date`, `date of sanction`, `sanct_date` |
| `status` | NO | Current progress status | `status`, `work_status`, `project status`, `current status` |
| `disbursed_amount` | NO | Released SNA funds | `disbursed_amount`, `disbursed amount`, `released_amount`, `expenditure inr`, `amount released` |
| `completion_date` | NO | Date of CC / UC upload | `completion_date`, `completion date`, `actual completion date`, `date of completion` |
| `contractor_name` | NO | Awarded contractor | `contractor_name`, `contractor`, `vendor`, `executing contractor`, `agency contractor` |

---

## 2. 6-Dimensional Feature Vector Specification

For each sanctioned work, the feature engineering pipeline constructs a 6D standardized vector:

$$\mathbf{x} = \left[ z_{\text{cost}}, d_{\text{delay}}, p_{\text{disb}}, c_{\text{agency}}, v_{\text{rec\_sanct}}, s_{\text{status}} \right]$$

1. **Category Cost Z-Score ($z_{\text{cost}}$):** Standardized cost deviation within the same category:
   $$z_{\text{cost}} = \frac{\text{Amount}_{\text{Lakhs}} - \mu_{\text{category}}}{\sigma_{\text{category}} + \epsilon}$$
2. **Administrative Sanction Delay ($d_{\text{delay}}$):** Days elapsed between recommendation and sanction:
   $$d_{\text{delay}} = \min\left(\frac{\text{Sanction Date} - \text{Recommendation Date}}{365.0}, 3.0\right)$$
3. **Disbursement Variance Ratio ($p_{\text{disb}}$):** Discrepancy between sanctioned outlay and actual disbursed funds:
   $$p_{\text{disb}} = \frac{|\text{Sanctioned Amount} - \text{Disbursed Amount}|}{\text{Sanctioned Amount} + \epsilon}$$
4. **Implementing Agency Concentration ($c_{\text{agency}}$):** Share of total constituency funds assigned to this agency:
   $$c_{\text{agency}} = \frac{\sum \text{Outlay of Assigned IDA}}{\text{Total Workspace Outlay}}$$
5. **Recommendation Variance Ratio ($v_{\text{rec\_sanct}}$):** Difference between MP requested amount and AS sanction:
   $$v_{\text{rec\_sanct}} = \frac{|\text{Recommended Amount} - \text{Sanctioned Amount}|}{\text{Sanctioned Amount} + \epsilon}$$
6. **Execution Status Factor ($s_{\text{status}}$):** Ordinal completion baseline encoding.

---

## 3. Data Quality & Validation Summary Model

The ingestion pipeline produces a structured validation and cleaning audit record:

```json
{
  "total_records_received": 220,
  "accepted_records": 220,
  "rejected_records": 0,
  "duplicate_records_removed": 0,
  "normalized_amounts_count": 220,
  "imputed_dates_count": 14,
  "normalized_columns": [
    { "canonical_key": "work_id", "label": "Work Code / ID", "matched_column": "project_id", "is_required": true }
  ],
  "warnings": []
}
```
