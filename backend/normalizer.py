import re
import uuid

def clean_key(k: str) -> str:
    if not k:
        return ""
    # Remove parentheses, currency symbols, underscores, hyphens, dots, spaces, slashes
    return re.sub(r'[\s\-_.\(\)₹/\\\'\"]+', '', str(k).lower().strip())

CANONICAL_SCHEMAS = {
    "sanctioned": {
        "required": {
            "work_id": [
                "projectid", "workid", "workcode", "workcodeid", "work", "id", "workno", "projectno", "uniqueworkid"
            ],
            "sanctioned_amount": [
                "sanctionamount", "sanctionedamount", "amount", "cost", "sanctionamt", "sanctionedamt", 
                "sanctionamountinr", "sanctionedamountinr", "recommendedamount", "recommendedamt", 
                "recommendationamount", "sanctioncost", "sanctionedcost", "projectcost", "estimatedcost", 
                "totaloutlay", "outlay", "allocationamount", "allocatedamount"
            ]
        },
        "optional": {
            "title": [
                "workdescription", "description", "worktitle", "title", "projectname", "projectdescription", "workname", "work"
            ],
            "category": [
                "workcategory", "category", "sector", "scheme", "worktype"
            ],
            "ida": [
                "implementingagency", "ida", "agency", "executingagency", "implementingdept", "department"
            ],
            "district": [
                "district", "distt", "districtname", "location"
            ],
            "mp_name": [
                "mpname", "honblememberofparliament", "honblememberofparliaments", "memberofparliament", "mp", "honblemp"
            ],
            "constituency": [
                "constituency", "constituencyid", "constituencyname", "const"
            ],
            "state": [
                "state", "statename"
            ],
            "sanct_date": [
                "sanctiondate", "sanctioneddate", "dateofsanction", "sanctdate", "date"
            ],
            "status": [
                "status", "workstatus", "projectstatus"
            ],
            "rec_date": [
                "recommendeddate", "recommendationdate", "recdate", "dateofrecommendation"
            ],
            "disbursed_amount": [
                "releasedamount", "expenditureamount", "amountdisbursed", "disbursedamount", "disbursedamt"
            ],
            "completion_date": [
                "completiondate", "completeddate", "dateofcompletion"
            ],
            "sr_no": [
                "srno", "sno", "serialno"
            ]
        }
    },
    "recommended": {
        "required": {
            "recommended_amount": [
                "recommendedamount", "recommendationamount", "amount", "recamount", "cost", "recommendedamt"
            ]
        },
        "optional": {
            "work_id": ["projectid", "workid", "workcode", "work", "id", "workno"],
            "title": ["recommendedwork", "workdescription", "description", "title", "work", "worktitle"],
            "rec_date": ["recommendationdate", "recommendeddate", "recdate", "date", "dateofrecommendation"],
            "district": ["district", "distt", "location"],
            "sr_no": ["srno", "sno", "serialno"]
        }
    },
    "completed": {
        "required": {
            "disbursed_amount": [
                "amountdisbursed", "disbursedamount", "releasedamount", "expenditureamount", "amount", "disbursedamt"
            ]
        },
        "optional": {
            "work_id": ["workid", "projectid", "workcode", "work", "id", "workno"],
            "title": ["workdescription", "description", "title", "work", "worktitle"],
            "completion_date": ["completiondate", "completeddate", "date", "dateofcompletion"],
            "district": ["district", "distt", "location"],
            "sr_no": ["srno", "sno", "serialno"]
        }
    }
}

CANONICAL_LABELS = {
    "work_id": "Work Code / ID (e.g. project_id, work_id, Work)",
    "sanctioned_amount": "Sanction Amount / Project Outlay (e.g. Sanction Amount, Recommended Amount, Amount INR)",
    "recommended_amount": "Recommended Amount (e.g. recommended_amount, RECOMMENDED AMOUNT)",
    "disbursed_amount": "Disbursed / Released Amount (e.g. disbursed_amount, released_amount)",
    "title": "Work Description / Title",
    "category": "Category / Sector",
    "ida": "Implementing Agency (IDA)",
    "district": "District",
    "mp_name": "MP Name",
    "constituency": "Constituency",
    "state": "State",
    "sanct_date": "Sanction Date",
    "status": "Work Status"
}

def map_and_validate_columns(headers: list, schema_type: str = "sanctioned"):
    """
    Normalizes uploaded raw CSV headers against the canonical schema.
    Returns:
      (is_valid: bool, mapping: dict, missing_required: list, detected_columns: list, normalized_report: list)
    """
    schema = CANONICAL_SCHEMAS.get(schema_type, CANONICAL_SCHEMAS["sanctioned"])
    req_rules = schema["required"]
    opt_rules = schema["optional"]

    # Build header cleaned map
    header_clean_map = {clean_key(h): h for h in headers if h}
    
    mapping = {}
    normalized_report = []

    # Map required fields
    missing_required = []
    for canonical_field, alias_list in req_rules.items():
        matched_raw = None
        for alias in alias_list:
            if alias in header_clean_map:
                matched_raw = header_clean_map[alias]
                break
        if matched_raw:
            mapping[canonical_field] = matched_raw
            normalized_report.append({
                "canonical_field": canonical_field,
                "label": CANONICAL_LABELS.get(canonical_field, canonical_field),
                "matched_column": matched_raw,
                "is_required": True
            })
        else:
            missing_required.append(CANONICAL_LABELS.get(canonical_field, canonical_field))

    # Map optional fields
    for canonical_field, alias_list in opt_rules.items():
        matched_raw = None
        for alias in alias_list:
            if alias in header_clean_map and header_clean_map[alias] != mapping.get("work_id"):
                matched_raw = header_clean_map[alias]
                break
        if matched_raw:
            mapping[canonical_field] = matched_raw
            normalized_report.append({
                "canonical_field": canonical_field,
                "label": CANONICAL_LABELS.get(canonical_field, canonical_field),
                "matched_column": matched_raw,
                "is_required": False
            })

    is_valid = len(missing_required) == 0
    return is_valid, mapping, missing_required, headers, normalized_report

def extract_work_code(raw_id, raw_desc='', sr_no=''):
    if raw_id:
        s = str(raw_id).strip()
        m = re.search(r'(WS/MP\d+/\d{4}-\d{4}/\d+)', s)
        if m:
            return m.group(1)
        tokens = s.split()
        if tokens and tokens[0].upper() != 'NA':
            return tokens[0].rstrip('-')
        return s
    if raw_desc:
        s = str(raw_desc).strip()
        m = re.search(r'(WS/MP\d+/\d{4}-\d{4}/\d+)', m) if False else None
        m = re.search(r'(WS/MP\d+/\d{4}-\d{4}/\d+)', s)
        if m:
            return m.group(1)
    return f"WORK-SR-{sr_no or uuid.uuid4().hex[:6]}"
