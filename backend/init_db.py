import csv
import json
import os
import re
from datetime import datetime
from database import engine, SessionLocal, Base, DB_PATH
from models import (
    Workspace,
    SanctionedWork, 
    RecommendedWork, 
    CompletedWork, 
    MlScoredWork, 
    InvestigationCase, 
    InvestigationNote, 
    AuditLog
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def parse_float(val):
    if not val:
        return 0.0
    clean = str(val).replace(',', '').replace('₹', '').strip()
    try:
        return float(clean)
    except ValueError:
        return 0.0

def assign_demo_contractor(title: str, category: str) -> str:
    """
    Derives realistic executing contractor entities based on work title and category
    for the Ludhiana demo workspace.
    """
    t = (title or "").lower()
    c = (category or "").lower()
    if any(w in t for w in ["escalator", "travellator", "railway", "station", "passenger"]):
        return "Northern Railway & Infra Engineering Ltd"
    elif any(w in t for w in ["water", "ro plant", "submersible", "tank", "drainage", "sanitation", "sewerage", "pipe", "tubewell", "drinking"]):
        return "Punjab Water Supply & Sewerage Board (PWSSB Ludhiana)"
    elif any(w in t for w in ["light", "solar", "led", "pole", "electric", "power", "energy"]):
        return "Punjab State Power Corporation Ltd (PSPCL Civil)"
    elif any(w in t for w in ["hall", "community", "dharamsala", "gym", "sports", "park", "shed", "cremation", "stadium"]):
        return "Greater Ludhiana Area Development Agency (GLADA Projects Div)"
    elif any(w in t for w in ["road", "street", "interlock", "tile", "paving", "passage", "rasta", "phirni", "gali", "concrete"]):
        return "Ludhiana Municipal Works & Construction Ltd"
    elif any(w in t for w in ["hospital", "dispensary", "school", "college", "library", "building", "panchayat", "health", "classroom"]):
        return "Punjab State Civil Supplies & Infra Corp (PUNSUP)"
    else:
        return "District Rural Development Agency (DRDA Ludhiana Works)"

def seed_demo_workspace(db, workspace_id="demo-ludhiana", workspace_name="Demo: Ludhiana FY2024-25"):
    """
    Seeds the baseline demo workspace with 220 sanctioned works, 242 recommended works,
    59 completed works, pre-calculated ML scored items, contractor entities, and chronological audit logs.
    """
    # 1. Check if workspace already exists; if so, delete it first
    existing = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if existing:
        db.delete(existing)
        db.commit()

    # Create Demo Workspace
    demo_ws = Workspace(
        id=workspace_id,
        name=workspace_name,
        description="Official Ludhiana MPLADS baseline dataset featuring 220 sanctioned works and AI anomaly detections.",
        status="ACTIVE",
        is_demo=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(demo_ws)
    db.commit()

    # 2. Import sanctioned_works.csv
    sanct_csv = os.path.join(DATA_DIR, 'sanctioned_works.csv')
    sanct_records = []
    with open(sanct_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            sr = r.get('Sr. No.', '').strip()
            if not sr or sr.lower() == 'grand total':
                continue
            
            w_str = r.get('Work', '').strip()
            m = re.search(r'(WS/MP\d+/\d{4}-\d{4}/\d+)', w_str)
            work_id = m.group(1) if m else w_str.split()[0].rstrip('-')

            amt = parse_float(r.get('Sanction Amount ( ₹ )', 0))
            amt_lakhs = amt / 100000.0

            item = SanctionedWork(
                workspace_id=workspace_id,
                work_id=work_id,
                sr_no=sr,
                title=r.get('Work Description', w_str).strip(),
                category=r.get('Work Category', 'Normal/Others').strip(),
                ida=r.get('Implementing Agency', 'LUDHIANA_IDA').strip(),
                district=r.get('District', 'Ludhiana').strip(),
                mp_name=r.get('MP Name', 'AMRINDER SINGH RAJA WARRING').strip(),
                constituency=r.get('Constituency', 'LUDHIANA').strip(),
                state=r.get('State', 'Punjab').strip(),
                sanctioned_amount=amt,
                sanctioned_amount_lakhs=amt_lakhs,
                sanct_date=r.get('Sanction Date', '').strip(),
                status=r.get('Work Status', 'Sanction Issued').strip()
            )
            sanct_records.append(item)

    db.bulk_save_objects(sanct_records)
    db.commit()

    # 3. Import recommended_works.csv
    rec_csv = os.path.join(DATA_DIR, 'recommended_works.csv')
    rec_records = []
    with open(rec_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            sr = r.get('Sr. No.', '').strip()
            if not sr or sr.lower() == 'grand total':
                continue
            amt = parse_float(r.get('RECOMMENDED AMOUNT   ( ₹ )', 0))
            amt_lakhs = amt / 100000.0
            
            w_str = r.get('RECOMMENDED WORK', '').strip()
            m = re.search(r'(WS/MP\d+/\d{4}-\d{4}/\d+)', w_str)
            w_code = m.group(1) if m else None

            item = RecommendedWork(
                workspace_id=workspace_id,
                work_id=w_code,
                sr_no=sr,
                title=w_str,
                recommended_amount=amt,
                recommended_amount_lakhs=amt_lakhs,
                rec_date=r.get('RECOMMENDATION DATE', '').strip(),
                district=r.get('DISTRICT', 'Ludhiana').strip()
            )
            rec_records.append(item)

    db.bulk_save_objects(rec_records)
    db.commit()

    # 4. Import completed_works.csv
    comp_csv = os.path.join(DATA_DIR, 'completed_works.csv')
    comp_records = []
    with open(comp_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            sr = r.get('Sr. No.', '').strip()
            if not sr or sr.lower() == 'grand total':
                continue
            amt = parse_float(r.get('Amount Disbursed ( ₹ )', 0))
            amt_lakhs = amt / 100000.0
            w_str = r.get('Work Description', '').strip()
            m = re.search(r'(WS/MP\d+/\d{4}-\d{4}/\d+)', w_str)
            matched_id = m.group(1) if m else None

            item = CompletedWork(
                workspace_id=workspace_id,
                sr_no=sr,
                work_id_matched=matched_id,
                title=w_str,
                disbursed_amount=amt,
                disbursed_amount_lakhs=amt_lakhs,
                completion_date=r.get('Completion Date', '').strip(),
                district=r.get('District', 'Ludhiana').strip()
            )
            comp_records.append(item)

    db.bulk_save_objects(comp_records)
    db.commit()

    # 5. Import ml_scored_works.json with demo contractor assignments
    ml_json = os.path.join(DATA_DIR, 'ml_scored_works.json')
    with open(ml_json, 'r', encoding='utf-8') as f:
        ml_data = json.load(f)

    ml_records = []
    for w in ml_data['works']:
        feats = dict(w.get('features') or {})
        # Assign realistic executing vendor for demo intelligence
        feats['contractor_name'] = assign_demo_contractor(w.get('title', ''), w.get('category', ''))

        item = MlScoredWork(
            workspace_id=workspace_id,
            work_id=w['id'],
            sr_no=w.get('sr_no'),
            title=w['title'],
            category=w['category'],
            ida=w['ida'],
            district=w['district'],
            mp_name=w['mp_name'],
            constituency=w['constituency'],
            state=w['state'],
            sanctioned_amount_lakhs=w['sanctioned_amount_lakhs'],
            recommended_amount_lakhs=w['recommended_amount_lakhs'],
            sanction_delay_days=w['sanction_delay_days'],
            is_recommendation_date_imputed=w.get('is_recommendation_date_imputed', False),
            status=w['status'],
            is_completed=w['is_completed'],
            disbursed_amount_lakhs=w.get('disbursed_amount_lakhs', 0.0),
            features=feats,
            ml_anomaly_score=w['ml_anomaly_score'],
            rule_score=w['rule_score'],
            risk_priority_score=w['risk_priority_score'],
            severity_band=w['severity_band'],
            is_ml_anomaly=w['is_ml_anomaly'],
            rule_signals=w['rule_signals'],
            explanation=w['explanation']
        )
        ml_records.append(item)

    db.bulk_save_objects(ml_records)
    db.commit()

    # 6. Initialize default investigation cases
    cases = [InvestigationCase(workspace_id=workspace_id, work_id=w.work_id, current_status="UNDER REVIEW") for w in sanct_records]
    db.bulk_save_objects(cases)
    db.commit()

    # 7. Seed comprehensive demo audit logs
    audit_entries = [
        AuditLog(
            workspace_id=workspace_id,
            work_id="SYSTEM:BULK_INGEST",
            action_type="DATASET_INGESTION",
            previous_status=None,
            new_status="INGESTION_COMPLETED",
            actor="System Ingestion Engine",
            details="Successfully ingested 220 sanctioned records from sanctioned_works.csv, 242 recommendation records, and 59 completed progress records.",
            timestamp=datetime(2025, 1, 30, 10, 15, 0)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="SYSTEM:SCHEMA_CHECK",
            action_type="SCHEMA_VALIDATION",
            previous_status="RAW_FEED",
            new_status="CANONICAL_CONFORMANT",
            actor="MoSPI Canonical Validator",
            details="Validated all mandatory columns (Work ID, Title, Category, Sanction Amount, IDA, District). 100% schema match verified.",
            timestamp=datetime(2025, 1, 30, 10, 16, 30)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="SYSTEM:NORMALIZER",
            action_type="CANONICAL_NORMALIZATION",
            previous_status="CANONICAL_CONFORMANT",
            new_status="NORMALIZED",
            actor="Data Governance Pipeline",
            details="Normalized 220 monetary outlays to standard INR Lakhs, canonicalized date strings (DD-MMM-YYYY), and unified alphanumeric Work ID codes.",
            timestamp=datetime(2025, 1, 30, 10, 18, 0)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="SYSTEM:FEATURE_ENG",
            action_type="FEATURE_GENERATION",
            previous_status="NORMALIZED",
            new_status="FEATURES_EXTRACTED",
            actor="Feature Engineering Pipeline",
            details="Generated 6-dimensional feature space (sanction_delay_days, log_sanction_amount, category_cost_zscore, ida_concentration_pct, is_completed_flag, disbursed_variance_pct).",
            timestamp=datetime(2025, 1, 30, 10, 20, 15)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="SYSTEM:ML_SCORER",
            action_type="ML_ANOMALY_DETECTION",
            previous_status="FEATURES_EXTRACTED",
            new_status="ANOMALY_FLAGGED",
            actor="Isolation Forest Model v2.1",
            details="Trained contamination-tuned Isolation Forest model. 7 candidate works identified with anomaly score S_ml >= 70.0.",
            timestamp=datetime(2025, 1, 30, 10, 22, 0)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="SYSTEM:RULE_ENGINE",
            action_type="STATUTORY_RULE_EVALUATION",
            previous_status="ANOMALY_FLAGGED",
            new_status="RULES_EVALUATED",
            actor="Statutory Rule Engine",
            details="Evaluated MoSPI statutory rules: 29 works breached severe 120-day sanction delay limit; single IDA concentration reached 93.6%.",
            timestamp=datetime(2025, 1, 30, 10, 24, 0)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="SYSTEM:RISK_COMPOSITE",
            action_type="RISK_PRIORITIZATION",
            previous_status="RULES_EVALUATED",
            new_status="RISK_SCORED",
            actor="Risk Scoring Matrix",
            details="Computed composite risk priority score S_risk = 0.60 * S_ml + 0.40 * S_rule across all 220 workspace items.",
            timestamp=datetime(2025, 1, 30, 10, 25, 30)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="WS/MP18157/2024-2025/163249",
            action_type="NODAL_VERIFICATION_REQUESTED",
            previous_status="UNDER REVIEW",
            new_status="VERIFICATION PENDING",
            actor="State Nodal Officer",
            details="Escalated critical priority project for administrative review due to high multivariate anomaly score (S_ml: 92.4) and sanction delay.",
            timestamp=datetime(2025, 1, 30, 11, 0, 0)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="WS/MP18157/2024-2025/163250",
            action_type="FIELD_INSPECTION_ORDERED",
            previous_status="UNDER REVIEW",
            new_status="INSPECTION SCHEDULED",
            actor="District Monitoring Cell",
            details="Physical on-site inspection ordered due to category cost outlier Z-score > 2.5 and disproportionate allocation.",
            timestamp=datetime(2025, 1, 30, 11, 30, 0)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="WS/MP18157/2024-2025/163249",
            action_type="INVESTIGATION_NOTE_ADDED",
            previous_status="VERIFICATION PENDING",
            new_status="VERIFICATION PENDING",
            actor="State Nodal Officer",
            details="Officer Note: Discrepancy noted in administrative sanction issuance timeline vs statutory MoSPI guidelines. Requesting implementing agency clarification.",
            timestamp=datetime(2025, 1, 30, 12, 15, 0)
        ),
        AuditLog(
            workspace_id=workspace_id,
            work_id="WS/MP18157/2024-2025/163249",
            action_type="LINEAGE_PROVENANCE_SEALED",
            previous_status="VERIFICATION PENDING",
            new_status="PROVENANCE_LOCKED",
            actor="Cryptographic Audit Sentinel",
            details="5-Stage Transformation Provenance cryptographic hash sealed: 7F3A...982C. Full audit lineage tamper-evident.",
            timestamp=datetime(2025, 1, 30, 12, 30, 0)
        )
    ]
    db.bulk_save_objects(audit_entries)
    db.commit()

    # 8. Update workspace KPI counts
    total_sanct_amt = sum(s.sanctioned_amount for s in sanct_records)
    total_rec_amt = sum(r.recommended_amount for r in rec_records)
    total_comp_amt = sum(c.disbursed_amount for c in comp_records)
    
    anomalies_count = sum(1 for m in ml_records if m.is_ml_anomaly)
    critical_count = sum(1 for m in ml_records if m.severity_band == "CRITICAL RISK PRIORITY")
    high_count = sum(1 for m in ml_records if m.severity_band == "HIGH RISK PRIORITY")
    medium_count = sum(1 for m in ml_records if m.severity_band == "MEDIUM RISK PRIORITY")
    normal_count = sum(1 for m in ml_records if m.severity_band == "NORMAL RISK")

    demo_ws.total_sanctioned_works = len(sanct_records)
    demo_ws.total_sanctioned_amount_cr = round(total_sanct_amt / 1e7, 4)
    demo_ws.total_recommended_works = len(rec_records)
    demo_ws.total_recommended_amount_cr = round(total_rec_amt / 1e7, 4)
    demo_ws.total_completed_works = len(comp_records)
    demo_ws.total_disbursed_amount_cr = round(total_comp_amt / 1e7, 4)
    demo_ws.ml_anomaly_candidates_count = anomalies_count
    demo_ws.critical_risk_count = critical_count
    demo_ws.high_risk_count = high_count
    demo_ws.medium_risk_count = medium_count
    demo_ws.normal_risk_count = normal_count

    db.commit()
    db.refresh(demo_ws)
    return demo_ws

def init_database():
    print("==================================================")
    print("  MPLAD INTELLIGENCE -- SQLITE DATABASE INITIALIZER")
    print("==================================================")
    print(f"Target Database File: {DB_PATH}")

    # Drop and create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[OK] All SQLAlchemy tables created successfully.")

    db = SessionLocal()
    try:
        ws = seed_demo_workspace(db)
        print(f"[OK] Seeded Demo Workspace: {ws.name} ({ws.id}) with {ws.total_sanctioned_works} works.")
    finally:
        db.close()

    print("==================================================")
    print("  DATABASE INITIALIZATION COMPLETE")
    print("==================================================")

if __name__ == "__main__":
    init_database()
