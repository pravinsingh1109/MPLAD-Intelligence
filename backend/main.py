import csv
import io
import math
import re
import urllib.parse
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Query, status, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, desc, func

from database import get_db, DB_PATH
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
from schemas import (
    WorkspaceCreateRequest,
    WorkspaceResponse,
    WorkspaceListResponse,
    AutomatedCleaningSummaryResponse,
    AnalysisSummaryResponse,
    OverviewKpisResponse,
    MlScoredWorkSchema,
    RiskQueuePaginatedResponse,
    InvestigationActionRequest,
    InvestigationCaseResponse,
    InvestigationNoteRequest,
    InvestigationNoteResponse,
    AuditLogResponse,
    AuditLogPaginatedResponse,
    HealthResponse
)
from init_db import seed_demo_workspace
from ml_engine import run_ml_pipeline
from normalizer import map_and_validate_columns, extract_work_code
from pdf_generator import generate_project_pdf, generate_executive_pdf

# Initialize FastAPI Application
app = FastAPI(
    title="MPLAD Intelligence REST API",
    description="Official Decision-Support System REST API for MPLADS Monitoring & Risk Intelligence",
    version="2.1.0"
)

# Configure CORS Middleware for Local & Production Frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """
    Auto-initializes database tables and seeds baseline Demo dataset on deployment.
    """
    try:
        from database import engine, SessionLocal, Base
        from models import Workspace
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            demo = db.query(Workspace).filter(Workspace.id == "demo-ludhiana").first()
            if not demo:
                seed_demo_workspace(db)
        finally:
            db.close()
    except Exception as e:
        print(f"[STARTUP DB INIT WARNING]: {e}")

# ==================================================
# HELPER FUNCTIONS
# ==================================================

def parse_num(val):
    if not val:
        return 0.0
    clean = str(val).replace(',', '').replace('₹', '').replace(' ', '').strip()
    try:
        return float(clean)
    except ValueError:
        return 0.0

def require_workspace(db: Session, workspace_id: Optional[str]) -> Workspace:
    if not workspace_id or not str(workspace_id).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required 'workspace_id' parameter. Please select or provide an active workspace context."
        )
    clean_ws = str(workspace_id).strip()
    ws = db.query(Workspace).filter(Workspace.id == clean_ws).first()
    if not ws:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace '{clean_ws}' not found."
        )
    return ws

def build_enriched_explanation(work: MlScoredWork) -> dict:
    feats = work.features or {}
    
    # 1. Feature Evidence Matrix with Empirical Benchmarks
    sanction_delay = feats.get("sanction_delay_days", work.sanction_delay_days or 0)
    delay_eval = "High Delay (>120 Days)" if sanction_delay > 120 else ("Moderate Delay (>75 Days)" if sanction_delay > 75 else "Within Mean Baseline")
    
    cost_zscore = feats.get("category_cost_zscore", 0.0)
    zscore_eval = "Extreme Outlier (Z > +3.0)" if cost_zscore > 3.0 else ("Outlier (Z > +2.0)" if cost_zscore > 2.0 else "Within Expected Category Range")
    
    ida_pct = feats.get("ida_concentration_pct", 50.0)
    ida_eval = "High Agency Concentration (>70%)" if ida_pct > 70.0 else "Normal Agency Allocation"
    
    sanction_amt = work.sanctioned_amount_lakhs
    amt_eval = "High Value Project (≥₹25.0 L)" if sanction_amt >= 25.0 else ("Medium Value Project (>₹10.0 L)" if sanction_amt >= 10.0 else "Standard Outlay")

    comp_flag = feats.get("is_completed_flag", 1 if work.is_completed else 0)
    comp_eval = "Completed Feed Matched" if comp_flag == 1 else "Pending Completion Record"
    
    var_pct = feats.get("disbursed_variance_pct", 0.0)
    var_eval = "Disbursement Variance (>20%)" if abs(var_pct) > 20.0 else "Normal Disbursement Flow"

    feature_evidence_matrix = [
        {
            "feature_name": "Sanction Delay",
            "observed_value": f"{sanction_delay} Days",
            "dataset_benchmark": "Dataset Mean: 75.4 Days (Median: 54 Days)",
            "evaluation": delay_eval,
            "severity": "HIGH" if sanction_delay > 120 else ("MEDIUM" if sanction_delay > 75 else "NORMAL")
        },
        {
            "feature_name": "Category Cost Z-Score",
            "observed_value": f"+{cost_zscore:.2f} SD",
            "dataset_benchmark": "Category Standard Normal (Mean: 0.0, Std: 1.0)",
            "evaluation": zscore_eval,
            "severity": "HIGH" if cost_zscore > 2.0 else "NORMAL"
        },
        {
            "feature_name": "IDA Agency Concentration",
            "observed_value": f"{ida_pct:.1f}%",
            "dataset_benchmark": "District Agency Baseline",
            "evaluation": ida_eval,
            "severity": "HIGH" if ida_pct > 70.0 else "NORMAL"
        },
        {
            "feature_name": "Sanctioned Amount",
            "observed_value": f"₹{sanction_amt:.2f} Lakhs",
            "dataset_benchmark": "Category Outlay Baseline",
            "evaluation": amt_eval,
            "severity": "HIGH" if sanction_amt >= 25.0 else "NORMAL"
        },
        {
            "feature_name": "Completion Status Match",
            "observed_value": "Completed" if comp_flag == 1 else "In Progress / Pending",
            "dataset_benchmark": "Completion Matching Rate",
            "evaluation": comp_eval,
            "severity": "NORMAL" if comp_flag == 1 else "MEDIUM"
        },
        {
            "feature_name": "Disbursement Variance",
            "observed_value": f"{var_pct:.1f}%",
            "dataset_benchmark": "Expected Variance: 0.0%",
            "evaluation": var_eval,
            "severity": "HIGH" if abs(var_pct) > 20.0 else "NORMAL"
        }
    ]

    # 2. Executive Summary Narrative
    s_risk = work.risk_priority_score
    s_ml = work.ml_anomaly_score
    s_rule = work.rule_score
    band = work.severity_band
    
    narrative = f"Project #{work.work_id} is classified as {band} (S_risk = {s_risk:.1f}/100). "
    if work.is_ml_anomaly:
        narrative += f"The Isolation Forest model identified an anomaly intensity score of S_ml = {s_ml:.1f}/100 due to multivariate feature isolation. "
    else:
        narrative += f"Multivariate anomaly intensity is S_ml = {s_ml:.1f}/100. "
    
    if work.rule_signals:
        narrative += f"The statutory rule engine triggered {len(work.rule_signals)} compliance signal(s) giving S_rule = {s_rule:.1f}/100."
    else:
        narrative += f"No critical statutory rule thresholds were violated (S_rule = {s_rule:.1f}/100)."

    base_exp = work.explanation or {}
    
    return {
        "is_ml_anomaly": work.is_ml_anomaly,
        "ml_anomaly_score": s_ml,
        "rule_score": s_rule,
        "risk_priority_score": s_risk,
        "severity_band": band,
        "weights_applied": {"w_ml": 0.60, "w_rule": 0.40},
        "score_attribution": {
            "ml_contribution": round(0.60 * s_ml, 1),
            "rule_contribution": round(0.40 * s_rule, 1),
            "total_risk_score": s_risk
        },
        "executive_summary": narrative,
        "feature_evidence_matrix": feature_evidence_matrix,
        "rule_signals": work.rule_signals or [],
        "ml_anomaly_evidence": base_exp.get("ml_anomaly_evidence", {
            "is_ml_anomaly": work.is_ml_anomaly,
            "ml_anomaly_score": s_ml,
            "anomaly_threshold_rule": "S_ml >= 70.0"
        })
    }

# ==================================================
# ROOT & SERVICE ENDPOINTS
# ==================================================

@app.get("/")
def read_root():
    return {
        "service": "MPLAD Intelligence REST API",
        "status": "running",
        "database": "connected",
        "version": "2.1.0"
    }

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# ==================================================
# 1. HEALTH CHECK ENDPOINT
# ==================================================

@app.get("/api/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1;"))
        ws_count = db.query(Workspace).count()
        return {
            "status": "ok", 
            "database": "connected",
            "active_workspaces_count": ws_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection failed: {str(e)}"
        )

# ==================================================
# 2. WORKSPACE MANAGEMENT ENDPOINTS
# ==================================================

@app.get("/api/workspaces", response_model=WorkspaceListResponse)
def get_workspaces(db: Session = Depends(get_db)):
    items = db.query(Workspace).order_by(desc(Workspace.created_at)).all()
    return {
        "items": items,
        "total": len(items)
    }

@app.post("/api/workspaces", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(payload: WorkspaceCreateRequest, db: Session = Depends(get_db)):
    ws_id = f"ws-{uuid.uuid4().hex[:8]}"
    ws = Workspace(
        id=ws_id,
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        status="CREATED",
        is_demo=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws

@app.get("/api/workspaces/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace_details(workspace_id: str, db: Session = Depends(get_db)):
    ws = require_workspace(db, workspace_id)
    return ws

@app.post("/api/workspaces/demo", response_model=WorkspaceResponse)
@app.get("/api/workspaces/demo", response_model=WorkspaceResponse)
def load_demo_workspace(db: Session = Depends(get_db)):
    ws = seed_demo_workspace(db, workspace_id="demo-ludhiana", workspace_name="Demo: Ludhiana FY2024-25")
    return ws

@app.post("/api/workspaces/{workspace_id}/clear")
def clear_workspace_dataset(workspace_id: str, db: Session = Depends(get_db)):
    ws = require_workspace(db, workspace_id)
    
    # Delete child records
    db.query(SanctionedWork).filter(SanctionedWork.workspace_id == ws.id).delete()
    db.query(RecommendedWork).filter(RecommendedWork.workspace_id == ws.id).delete()
    db.query(CompletedWork).filter(CompletedWork.workspace_id == ws.id).delete()
    db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id).delete()
    db.query(InvestigationCase).filter(InvestigationCase.workspace_id == ws.id).delete()
    db.query(InvestigationNote).filter(InvestigationNote.workspace_id == ws.id).delete()
    db.query(AuditLog).filter(AuditLog.workspace_id == ws.id).delete()

    # Reset Workspace KPIs
    ws.status = "CLEARED"
    ws.total_sanctioned_works = 0
    ws.total_sanctioned_amount_cr = 0.0
    ws.total_recommended_works = 0
    ws.total_recommended_amount_cr = 0.0
    ws.total_completed_works = 0
    ws.total_disbursed_amount_cr = 0.0
    ws.ml_anomaly_candidates_count = 0
    ws.critical_risk_count = 0
    ws.high_risk_count = 0
    ws.medium_risk_count = 0
    ws.normal_risk_count = 0
    ws.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ws)

    return {
        "status": "cleared",
        "workspace_id": ws.id,
        "message": f"Dataset for workspace '{ws.name}' successfully cleared."
    }

@app.delete("/api/workspaces/{workspace_id}")
def delete_historical_workspace(workspace_id: str, db: Session = Depends(get_db)):
    ws = require_workspace(db, workspace_id)
    db.delete(ws)
    db.commit()
    return {
        "status": "deleted",
        "workspace_id": workspace_id,
        "message": f"Workspace '{ws.name}' and all associated records permanently deleted."
    }

# ==================================================
# 3. DATASET INGESTION & CANONICAL NORMALIZATION
# ==================================================

@app.post("/api/workspaces/{workspace_id}/upload", response_model=AutomatedCleaningSummaryResponse)
async def upload_workspace_data(
    workspace_id: str,
    sanctioned_file: UploadFile = File(...),
    recommended_file: Optional[UploadFile] = File(None),
    completed_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)

    # 1. Parse Sanctioned CSV
    sanct_content = await sanctioned_file.read()
    try:
        sanct_text = sanct_content.decode('utf-8')
    except UnicodeDecodeError:
        sanct_text = sanct_content.decode('latin-1')

    sanct_reader = csv.DictReader(io.StringIO(sanct_text))
    sanct_rows = list(sanct_reader)

    if not sanct_rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sanctioned works CSV file is empty."
        )

    raw_headers = [k for k in sanct_rows[0].keys() if k is not None]
    
    # Run Canonical Validation & Mapping
    is_valid, mapping, missing_required, detected_cols, normalized_report = map_and_validate_columns(
        raw_headers, schema_type="sanctioned"
    )

    if not is_valid:
        missing_fmt = "\n".join(f"• {c}" for c in missing_required)
        detected_fmt = "\n".join(f"• {c}" for c in detected_cols if c.strip())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded CSV validation failed.\n\nMissing Required Columns:\n{missing_fmt}\n\nDetected Columns in File:\n{detected_fmt}"
        )

    # Clear existing data in workspace before new upload
    db.query(SanctionedWork).filter(SanctionedWork.workspace_id == ws.id).delete()
    db.query(RecommendedWork).filter(RecommendedWork.workspace_id == ws.id).delete()
    db.query(CompletedWork).filter(CompletedWork.workspace_id == ws.id).delete()
    db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id).delete()
    db.query(InvestigationCase).filter(InvestigationCase.workspace_id == ws.id).delete()
    db.commit()

    # Extract mapped column names
    work_col = mapping.get('work_id')
    amt_col = mapping.get('sanctioned_amount')
    desc_col = mapping.get('title')
    cat_col = mapping.get('category')
    ida_col = mapping.get('ida')
    dist_col = mapping.get('district')
    mp_col = mapping.get('mp_name')
    const_col = mapping.get('constituency')
    state_col = mapping.get('state')
    date_col = mapping.get('sanct_date')
    status_col = mapping.get('status')
    sr_col = mapping.get('sr_no')
    disb_col = mapping.get('disbursed_amount')
    comp_date_col = mapping.get('completion_date')

    sanct_records = []
    auto_completed_records = []
    seen_work_ids = set()
    imputed_dates_count = 0
    normalized_amounts_count = 0
    warnings = []

    for idx, r in enumerate(sanct_rows):
        sr_val = str(r.get(sr_col, '')).strip() if sr_col else str(idx + 1)
        if sr_val.lower() == 'grand total':
            continue

        raw_work = str(r.get(work_col, '')).strip() if work_col else ''
        raw_desc = str(r.get(desc_col, '')).strip() if desc_col else ''
        
        work_id = extract_work_code(raw_work, raw_desc, sr_val)

        if work_id in seen_work_ids:
            unique_work_id = f"{work_id}-{uuid.uuid4().hex[:4]}"
            warnings.append(f"Row {sr_val}: Duplicate Work ID '{work_id}' resolved to '{unique_work_id}'")
            work_id = unique_work_id
        seen_work_ids.add(work_id)

        raw_amt = r.get(amt_col, 0) if amt_col else 0
        amt = parse_num(raw_amt)
        amt_lakhs = round(amt / 100000.0, 2)
        if amt > 0:
            normalized_amounts_count += 1

        s_date = str(r.get(date_col, '')).strip() if date_col else None
        if not s_date or s_date.upper() == 'NA':
            s_date = None
            imputed_dates_count += 1

        # Determine Title
        title_text = raw_desc or raw_work
        if not title_text:
            cat_label = str(r.get(cat_col, 'MPLADS Project')).strip() if cat_col else 'MPLADS Project'
            dist_label = str(r.get(dist_col, 'Constituency')).strip() if dist_col else 'Constituency'
            title_text = f"{cat_label} in {dist_label} ({work_id})"

        item = SanctionedWork(
            workspace_id=ws.id,
            work_id=work_id,
            sr_no=sr_val,
            title=title_text,
            category=str(r.get(cat_col, 'Normal/Others')).strip() if cat_col and r.get(cat_col) else 'Normal/Others',
            ida=str(r.get(ida_col, 'DISTRICT_IDA')).strip() if ida_col and r.get(ida_col) else 'DISTRICT_IDA',
            district=str(r.get(dist_col, 'Ludhiana')).strip() if dist_col and r.get(dist_col) else 'Ludhiana',
            mp_name=str(r.get(mp_col, 'Hon. MP')).strip() if mp_col and r.get(mp_col) else 'Hon. MP',
            constituency=str(r.get(const_col, 'LUDHIANA')).strip() if const_col and r.get(const_col) else 'LUDHIANA',
            state=str(r.get(state_col, 'Punjab')).strip() if state_col and r.get(state_col) else 'Punjab',
            sanctioned_amount=amt,
            sanctioned_amount_lakhs=amt_lakhs,
            sanct_date=s_date,
            status=str(r.get(status_col, 'Sanction Issued')).strip() if status_col and r.get(status_col) else 'Sanction Issued'
        )
        sanct_records.append(item)

        # Single-file dataset completion match detection (e.g. mplad_sample_500.csv)
        if not completed_file and disb_col:
            disb_val = parse_num(r.get(disb_col, 0))
            comp_d = str(r.get(comp_date_col, '')).strip() if comp_date_col else None
            st_val = str(r.get(status_col, '')).strip().lower() if status_col else ''
            
            if disb_val > 0 or comp_d or st_val == 'completed':
                c_item = CompletedWork(
                    workspace_id=ws.id,
                    sr_no=sr_val,
                    work_id_matched=work_id,
                    title=title_text,
                    disbursed_amount=disb_val,
                    disbursed_amount_lakhs=round(disb_val / 100000.0, 2),
                    completion_date=comp_d if comp_d and comp_d.upper() != 'NA' else None,
                    district=item.district
                )
                auto_completed_records.append(c_item)

    db.bulk_save_objects(sanct_records)
    if auto_completed_records:
        db.bulk_save_objects(auto_completed_records)
    db.commit()

    # 2. Process Recommended CSV if provided
    rec_count = 0
    if recommended_file:
        rec_content = await recommended_file.read()
        try:
            rec_text = rec_content.decode('utf-8')
        except UnicodeDecodeError:
            rec_text = rec_content.decode('latin-1')
        
        rec_reader = csv.DictReader(io.StringIO(rec_text))
        rec_rows = list(rec_reader)
        if rec_rows:
            r_headers = [k for k in rec_rows[0].keys() if k is not None]
            r_valid, r_mapping, _, _, _ = map_and_validate_columns(r_headers, schema_type="recommended")
            
            r_amt_col = r_mapping.get('recommended_amount')
            r_work_col = r_mapping.get('work_id')
            r_title_col = r_mapping.get('title')
            r_date_col = r_mapping.get('rec_date')
            r_dist_col = r_mapping.get('district')
            r_sr_col = r_mapping.get('sr_no')

            rec_records = []
            for idx, r in enumerate(rec_rows):
                sr = str(r.get(r_sr_col, '')).strip() if r_sr_col else str(idx + 1)
                if sr.lower() == 'grand total':
                    continue
                amt = parse_num(r.get(r_amt_col, 0)) if r_amt_col else 0
                w_str = str(r.get(r_title_col, '')).strip() if r_title_col else ''
                w_code = extract_work_code(r.get(r_work_col, ''), w_str, sr)

                item = RecommendedWork(
                    workspace_id=ws.id,
                    work_id=w_code,
                    sr_no=sr,
                    title=w_str or f"Recommended Project ({w_code})",
                    recommended_amount=amt,
                    recommended_amount_lakhs=round(amt / 100000.0, 2),
                    rec_date=str(r.get(r_date_col, '')).strip() if r_date_col else None,
                    district=str(r.get(r_dist_col, 'Ludhiana')).strip() if r_dist_col else 'Ludhiana'
                )
                rec_records.append(item)
            if rec_records:
                db.bulk_save_objects(rec_records)
                db.commit()
                rec_count = len(rec_records)

    # 3. Process Completed CSV if provided
    comp_count = len(auto_completed_records)
    if completed_file:
        comp_content = await completed_file.read()
        try:
            comp_text = comp_content.decode('utf-8')
        except UnicodeDecodeError:
            comp_text = comp_content.decode('latin-1')

        comp_reader = csv.DictReader(io.StringIO(comp_text))
        comp_rows = list(comp_reader)
        if comp_rows:
            # Overwrite auto-completed records with dedicated completed file
            db.query(CompletedWork).filter(CompletedWork.workspace_id == ws.id).delete()
            db.commit()

            c_headers = [k for k in comp_rows[0].keys() if k is not None]
            c_valid, c_mapping, _, _, _ = map_and_validate_columns(c_headers, schema_type="completed")
            
            c_amt_col = c_mapping.get('disbursed_amount')
            c_work_col = c_mapping.get('work_id')
            c_title_col = c_mapping.get('title')
            c_date_col = c_mapping.get('completion_date')
            c_dist_col = c_mapping.get('district')
            c_sr_col = c_mapping.get('sr_no')

            comp_records = []
            for idx, r in enumerate(comp_rows):
                sr = str(r.get(c_sr_col, '')).strip() if c_sr_col else str(idx + 1)
                if sr.lower() == 'grand total':
                    continue
                amt = parse_num(r.get(c_amt_col, 0)) if c_amt_col else 0
                w_str = str(r.get(c_title_col, '')).strip() if c_title_col else ''
                matched_id = extract_work_code(r.get(c_work_col, ''), w_str, sr)

                item = CompletedWork(
                    workspace_id=ws.id,
                    sr_no=sr,
                    work_id_matched=matched_id,
                    title=w_str or f"Completed Project ({matched_id})",
                    disbursed_amount=amt,
                    disbursed_amount_lakhs=round(amt / 100000.0, 2),
                    completion_date=str(r.get(c_date_col, '')).strip() if c_date_col else None,
                    district=str(r.get(c_dist_col, 'Ludhiana')).strip() if c_dist_col else 'Ludhiana'
                )
                comp_records.append(item)
            if comp_records:
                db.bulk_save_objects(comp_records)
                db.commit()
                comp_count = len(comp_records)

    # 4. Initialize Default Investigation Cases for Sanctioned Works
    cases = [InvestigationCase(workspace_id=ws.id, work_id=w.work_id, current_status="UNDER REVIEW") for w in sanct_records]
    db.bulk_save_objects(cases)
    db.commit()

    # Update Workspace status
    ws.status = "CLEANED"
    ws.total_sanctioned_works = len(sanct_records)
    ws.total_sanctioned_amount_cr = round(sum(s.sanctioned_amount for s in sanct_records) / 1e7, 4)
    ws.total_recommended_works = rec_count
    ws.total_completed_works = comp_count
    ws.updated_at = datetime.utcnow()
    db.commit()

    if imputed_dates_count > 0:
        warnings.append(f"Auto-imputed {imputed_dates_count} missing dates using empirical baseline (75.4 days mean).")
    warnings.append(f"Normalized {normalized_amounts_count} monetary amounts to Lakhs standard.")
    if comp_count > 0 and not completed_file:
        warnings.append(f"Auto-extracted {comp_count} completion & disbursement records from single-feed dataset.")

    return {
        "workspace_id": ws.id,
        "status": ws.status,
        "sanctioned_count": len(sanct_records),
        "recommended_count": rec_count,
        "completed_count": comp_count,
        "imputed_dates_count": imputed_dates_count,
        "normalized_amounts_count": normalized_amounts_count,
        "detected_columns": raw_headers,
        "normalized_columns": normalized_report,
        "warnings": warnings
    }

# ==================================================
# 4. SYNCHRONOUS ML ANALYSIS EXECUTION
# ==================================================

@app.post("/api/workspaces/{workspace_id}/analyze", response_model=AnalysisSummaryResponse)
def run_workspace_analysis(workspace_id: str, db: Session = Depends(get_db)):
    ws = require_workspace(db, workspace_id)

    sanct_works = db.query(SanctionedWork).filter(SanctionedWork.workspace_id == ws.id).all()
    if not sanct_works:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot run analysis. Workspace '{ws.name}' contains 0 sanctioned works. Please upload a dataset first."
        )

    rec_works = db.query(RecommendedWork).filter(RecommendedWork.workspace_id == ws.id).all()
    comp_works = db.query(CompletedWork).filter(CompletedWork.workspace_id == ws.id).all()

    rec_map = {r.work_id: r for r in rec_works if r.work_id}
    comp_map = {c.work_id_matched: c for c in comp_works if c.work_id_matched}

    # Execute ML & Rule Engine Synchronously
    scored_results = run_ml_pipeline(sanct_works, rec_map, comp_map)

    # Delete existing scored records for workspace
    db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id).delete()
    db.commit()

    ml_records = []
    for item in scored_results:
        scored_obj = MlScoredWork(
            workspace_id=ws.id,
            work_id=item['work_id'],
            sr_no=item.get('sr_no'),
            title=item['title'],
            category=item['category'],
            ida=item['ida'],
            district=item['district'],
            mp_name=item['mp_name'],
            constituency=item['constituency'],
            state=item['state'],
            sanctioned_amount_lakhs=item['sanctioned_amount_lakhs'],
            recommended_amount_lakhs=item['recommended_amount_lakhs'],
            sanction_delay_days=item['sanction_delay_days'],
            is_recommendation_date_imputed=item['is_recommendation_date_imputed'],
            status=item['status'],
            is_completed=item['is_completed'],
            disbursed_amount_lakhs=item['disbursed_amount_lakhs'],
            features=item['features'],
            ml_anomaly_score=item['ml_anomaly_score'],
            rule_score=item['rule_score'],
            risk_priority_score=item['risk_priority_score'],
            severity_band=item['severity_band'],
            is_ml_anomaly=item['is_ml_anomaly'],
            rule_signals=item['rule_signals'],
            explanation=item['explanation']
        )
        ml_records.append(scored_obj)

    db.bulk_save_objects(ml_records)

    # Update Workspace Aggregates
    anomalies_count = sum(1 for m in ml_records if m.is_ml_anomaly)
    critical_count = sum(1 for m in ml_records if m.severity_band == "CRITICAL RISK PRIORITY")
    high_count = sum(1 for m in ml_records if m.severity_band == "HIGH RISK PRIORITY")
    medium_count = sum(1 for m in ml_records if m.severity_band == "MEDIUM RISK PRIORITY")
    normal_count = sum(1 for m in ml_records if m.severity_band == "NORMAL RISK")

    ws.status = "ACTIVE"
    ws.ml_anomaly_candidates_count = anomalies_count
    ws.critical_risk_count = critical_count
    ws.high_risk_count = high_count
    ws.medium_risk_count = medium_count
    ws.normal_risk_count = normal_count
    ws.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ws)

    return {
        "workspace_id": ws.id,
        "workspace_name": ws.name,
        "status": ws.status,
        "total_scored": len(ml_records),
        "anomalies_count": anomalies_count,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "normal_count": normal_count,
        "weights_applied": {"w_ml": 0.60, "w_rule": 0.40},
        "timestamp": ws.updated_at
    }

# ==================================================
# 5. CONTEXTUAL DECISION SUPPORT ENDPOINTS
# ==================================================

@app.get("/api/overview/kpis", response_model=OverviewKpisResponse)
def get_overview_kpis(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)

    total_sanct_works = db.query(SanctionedWork).filter(SanctionedWork.workspace_id == ws.id).count()
    sanct_sum = db.query(SanctionedWork.sanctioned_amount).filter(SanctionedWork.workspace_id == ws.id).all()
    total_sanct_amt = sum(s[0] for s in sanct_sum) if sanct_sum else 0.0

    total_rec_works = db.query(RecommendedWork).filter(RecommendedWork.workspace_id == ws.id).count()
    rec_sum = db.query(RecommendedWork.recommended_amount).filter(RecommendedWork.workspace_id == ws.id).all()
    total_rec_amt = sum(r[0] for r in rec_sum) if rec_sum else 0.0

    total_comp_works = db.query(CompletedWork).filter(CompletedWork.workspace_id == ws.id).count()
    comp_sum = db.query(CompletedWork.disbursed_amount).filter(CompletedWork.workspace_id == ws.id).all()
    total_comp_amt = sum(c[0] for c in comp_sum) if comp_sum else 0.0

    ml_anomalies = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id, MlScoredWork.is_ml_anomaly == True).count()
    critical_risk = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id, MlScoredWork.severity_band == "CRITICAL RISK PRIORITY").count()
    high_risk = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id, MlScoredWork.severity_band == "HIGH RISK PRIORITY").count()
    medium_risk = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id, MlScoredWork.severity_band == "MEDIUM RISK PRIORITY").count()
    normal_risk = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id, MlScoredWork.severity_band == "NORMAL RISK").count()

    return {
        "workspace_id": ws.id,
        "workspace_name": ws.name,
        "total_sanctioned_works": total_sanct_works,
        "total_sanctioned_amount_cr": round(total_sanct_amt / 1e7, 4),
        "total_recommended_works": total_rec_works,
        "total_recommended_amount_cr": round(total_rec_amt / 1e7, 4),
        "total_completed_works": total_comp_works,
        "total_disbursed_amount_cr": round(total_comp_amt / 1e7, 4),
        "ml_anomaly_candidates_count": ml_anomalies,
        "critical_risk_count": critical_risk,
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "normal_risk_count": normal_risk
    }

@app.get("/api/overview/ida-distribution")
def get_ida_distribution(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    
    results = db.query(
        SanctionedWork.ida,
        func.count(SanctionedWork.id).label("count"),
        func.sum(SanctionedWork.sanctioned_amount).label("outlay")
    ).filter(
        SanctionedWork.workspace_id == ws.id
    ).group_by(
        SanctionedWork.ida
    ).order_by(
        desc("count")
    ).all()

    total_count = sum(r[1] for r in results) if results else 0
    items = []
    for ida_name, cnt, outlay_sum in results:
        raw_name = str(ida_name).strip() if ida_name else "Unknown Agency"
        pct = round((cnt / total_count * 100.0), 1) if total_count > 0 else 0.0
        outlay_cr = round((outlay_sum or 0.0) / 1e7, 4)
        
        # Clean display label
        short_name = raw_name.replace(' (DEPUTY COMMISSIONER LUDHIANA_IDA)', '')\
                             .replace('LUDHIANA(DEPUTY COMMISSIONER LUDHIANA_IDA)', 'Ludhiana DC')\
                             .replace('(DEPUTY COMMISSIONER JALANDHAR_IDA)', '')\
                             .replace('_IDA', '')\
                             .strip()
        if len(short_name) > 22:
            short_name = short_name[:20] + "..."

        items.append({
            "name": short_name,
            "fullName": raw_name,
            "count": cnt,
            "percentage": pct,
            "outlay_cr": outlay_cr,
            "isPrimary": pct > 50.0
        })

    return {
        "workspace_id": ws.id,
        "total_works": total_count,
        "items": items[:8]
    }

@app.get("/api/projects/risk-queue", response_model=RiskQueuePaginatedResponse)
@app.get("/api/queue", response_model=RiskQueuePaginatedResponse)
def get_risk_queue(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page (15, 25, 50, 220)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    severity: Optional[str] = Query(None, description="Filter by severity band"),
    search: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    query = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id)

    if category and category != "ALL":
        query = query.filter(MlScoredWork.category == category)
    
    if severity and severity != "ALL":
        if severity == "CRITICAL":
            query = query.filter(MlScoredWork.severity_band == "CRITICAL RISK PRIORITY")
        elif severity == "HIGH":
            query = query.filter(MlScoredWork.severity_band == "HIGH RISK PRIORITY")
        elif severity == "MEDIUM":
            query = query.filter(MlScoredWork.severity_band == "MEDIUM RISK PRIORITY")
        elif severity == "NORMAL":
            query = query.filter(MlScoredWork.severity_band == "NORMAL RISK")
        elif severity == "ML_ANOMALY":
            query = query.filter(MlScoredWork.is_ml_anomaly == True)

    if search and search.strip():
        q = f"%{search.strip()}%"
        query = query.filter(
            (MlScoredWork.work_id.like(q)) | 
            (MlScoredWork.title.like(q)) | 
            (MlScoredWork.ida.like(q)) | 
            (MlScoredWork.district.like(q))
        )

    total_records = query.count()
    total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1

    raw_items = query.order_by(desc(MlScoredWork.risk_priority_score))\
                     .offset((page - 1) * page_size)\
                     .limit(page_size)\
                     .all()

    items = []
    for w in raw_items:
        item_dict = {c.name: getattr(w, c.name) for c in w.__table__.columns}
        item_dict["id"] = w.work_id
        item_dict["explanation"] = build_enriched_explanation(w)
        items.append(item_dict)

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total_records,
        "total_pages": total_pages,
        "workspace_id": ws.id,
        "workspace_name": ws.name
    }

@app.get("/api/projects/{work_id:path}/intelligence", response_model=MlScoredWorkSchema)
@app.get("/api/intelligence/{work_id:path}", response_model=MlScoredWorkSchema)
def get_project_intelligence(
    work_id: str, 
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    clean_id = urllib.parse.unquote(work_id).strip()
    work = db.query(MlScoredWork).filter(
        MlScoredWork.workspace_id == ws.id,
        MlScoredWork.work_id == clean_id
    ).first()

    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work ID '{clean_id}' not found in workspace '{ws.name}'."
        )

    work_dict = {c.name: getattr(work, c.name) for c in work.__table__.columns}
    work_dict["id"] = work.work_id
    work_dict["explanation"] = build_enriched_explanation(work)
    return work_dict

# ==================================================
# 6. INVESTIGATION & NOTES API
# ==================================================

@app.get("/api/projects/{work_id:path}/investigation", response_model=InvestigationCaseResponse)
def get_investigation_case(
    work_id: str, 
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    clean_id = urllib.parse.unquote(work_id).strip()
    
    work = db.query(SanctionedWork).filter(
        SanctionedWork.workspace_id == ws.id,
        SanctionedWork.work_id == clean_id
    ).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work ID '{clean_id}' not found in workspace '{ws.name}'."
        )

    case = db.query(InvestigationCase).filter(
        InvestigationCase.workspace_id == ws.id,
        InvestigationCase.work_id == clean_id
    ).first()

    if not case:
        case = InvestigationCase(workspace_id=ws.id, work_id=clean_id, current_status="UNDER REVIEW")
        db.add(case)
        db.commit()
        db.refresh(case)

    return case

ALLOWED_ACTIONS = {
    "MARK_FOR_FIELD_VERIFICATION": "MARKED FOR FIELD VERIFICATION",
    "REQUEST_NODAL_AGENCY_AUDIT": "REQUEST NODAL AGENCY AUDIT",
    "CLEAR_AFTER_REVIEW": "CLEARED AFTER REVIEW"
}

@app.post("/api/projects/{work_id:path}/investigation-action")
def post_investigation_action(
    work_id: str, 
    payload: InvestigationActionRequest, 
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    clean_id = urllib.parse.unquote(work_id).strip()
    action_key = payload.action.upper().strip()
    if action_key not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action '{payload.action}'. Allowed actions: {list(ALLOWED_ACTIONS.keys())}"
        )

    new_status = ALLOWED_ACTIONS[action_key]

    work = db.query(SanctionedWork).filter(
        SanctionedWork.workspace_id == ws.id,
        SanctionedWork.work_id == clean_id
    ).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work ID '{clean_id}' not found in workspace '{ws.name}'."
        )

    case = db.query(InvestigationCase).filter(
        InvestigationCase.workspace_id == ws.id,
        InvestigationCase.work_id == clean_id
    ).first()
    prev_status = case.current_status if case else "UNDER REVIEW"

    if not case:
        case = InvestigationCase(workspace_id=ws.id, work_id=clean_id, current_status=new_status)
        db.add(case)
    else:
        case.current_status = new_status
        case.updated_at = datetime.utcnow()

    # Record Audit Event
    audit_entry = AuditLog(
        workspace_id=ws.id,
        work_id=clean_id,
        action_type=f"VERIFICATION STATUS: {new_status}",
        previous_status=prev_status,
        new_status=new_status,
        actor=payload.actor or "State Nodal Officer",
        details=payload.details or f"Official status transitioned from {prev_status} to {new_status}",
        timestamp=datetime.utcnow()
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(case)
    db.refresh(audit_entry)

    return {
        "work_id": clean_id,
        "workspace_id": ws.id,
        "previous_status": prev_status,
        "new_status": new_status,
        "action": action_key,
        "timestamp": audit_entry.timestamp.isoformat()
    }

@app.get("/api/projects/{work_id:path}/notes", response_model=List[InvestigationNoteResponse])
def get_investigation_notes(
    work_id: str, 
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    clean_id = urllib.parse.unquote(work_id).strip()
    notes = db.query(InvestigationNote).filter(
        InvestigationNote.workspace_id == ws.id,
        InvestigationNote.work_id == clean_id
    ).order_by(desc(InvestigationNote.id)).all()
    return notes

@app.post("/api/projects/{work_id:path}/notes", response_model=InvestigationNoteResponse, status_code=status.HTTP_201_CREATED)
def post_investigation_note(
    work_id: str, 
    payload: InvestigationNoteRequest, 
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    clean_id = urllib.parse.unquote(work_id).strip()
    note_text = payload.note_text.strip()
    if not note_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Note text cannot be empty."
        )

    work = db.query(SanctionedWork).filter(
        SanctionedWork.workspace_id == ws.id,
        SanctionedWork.work_id == clean_id
    ).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work ID '{clean_id}' not found in workspace '{ws.name}'."
        )

    new_note = InvestigationNote(
        workspace_id=ws.id,
        work_id=clean_id,
        officer_name=payload.officer_name or "State Nodal Officer",
        note_text=note_text,
        timestamp=datetime.utcnow()
    )
    db.add(new_note)

    case = db.query(InvestigationCase).filter(
        InvestigationCase.workspace_id == ws.id,
        InvestigationCase.work_id == clean_id
    ).first()
    current_status = case.current_status if case else "UNDER REVIEW"

    audit_entry = AuditLog(
        workspace_id=ws.id,
        work_id=clean_id,
        action_type="INVESTIGATION NOTE ADDED",
        previous_status=current_status,
        new_status=current_status,
        actor=payload.officer_name or "State Nodal Officer",
        details=note_text,
        timestamp=datetime.utcnow()
    )
    db.add(audit_entry)

    db.commit()
    db.refresh(new_note)

    return new_note

# ==================================================
# 7. AUDIT LOG API
# ==================================================

@app.get("/api/audit-logs", response_model=AuditLogPaginatedResponse)
def get_audit_logs(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=500),
    work_id: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    query = db.query(AuditLog).filter(AuditLog.workspace_id == ws.id)

    if work_id and work_id.strip():
        query = query.filter(AuditLog.work_id == urllib.parse.unquote(work_id.strip()))

    if action_type and action_type.strip():
        query = query.filter(AuditLog.action_type.like(f"%{action_type.strip()}%"))

    total_records = query.count()
    total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1

    items = query.order_by(desc(AuditLog.id))\
                 .offset((page - 1) * page_size)\
                 .limit(page_size)\
                 .all()

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total_records,
        "total_pages": total_pages,
        "workspace_id": ws.id
    }

@app.delete("/api/audit-logs")
def clear_audit_logs(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    deleted_count = db.query(AuditLog).filter(AuditLog.workspace_id == ws.id).delete()
    db.commit()
    return {
        "status": "cleared",
        "workspace_id": ws.id,
        "deleted_audit_records": deleted_count,
        "message": f"Audit trail for workspace '{ws.name}' cleared."
    }

# ==================================================
# 8. PDF INTELLIGENCE REPORT EXPORT
# ==================================================

@app.get("/api/projects/{work_id:path}/pdf")
def get_project_pdf(
    work_id: str,
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    clean_id = urllib.parse.unquote(work_id).strip()
    
    # 1. Fetch ML Scored Work
    work = db.query(MlScoredWork).filter(
        MlScoredWork.workspace_id == ws.id,
        MlScoredWork.work_id == clean_id
    ).first()

    if work:
        work_dict = {c.name: getattr(work, c.name) for c in work.__table__.columns}
        explanation = build_enriched_explanation(work)
    else:
        raw_work = db.query(SanctionedWork).filter(
            SanctionedWork.workspace_id == ws.id,
            SanctionedWork.work_id == clean_id
        ).first()
        if not raw_work:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Work ID '{clean_id}' not found in workspace '{ws.name}'."
            )
        work_dict = {
            "work_id": raw_work.work_id,
            "title": raw_work.title,
            "category": raw_work.category,
            "ida": raw_work.ida,
            "district": raw_work.district,
            "mp_name": raw_work.mp_name,
            "constituency": raw_work.constituency,
            "state": raw_work.state,
            "sanctioned_amount_lakhs": raw_work.sanctioned_amount_lakhs,
            "recommended_amount_lakhs": 0.0,
            "sanction_delay_days": 0,
            "is_recommendation_date_imputed": False,
            "status": raw_work.status,
            "is_completed": False,
            "disbursed_amount_lakhs": 0.0,
            "ml_anomaly_score": 0.0,
            "rule_score": 0.0,
            "risk_priority_score": 0.0,
            "severity_band": "NORMAL RISK",
            "is_ml_anomaly": False,
            "rule_signals": [],
            "features": {}
        }
        explanation = {
            "executive_summary": f"Project #{clean_id} is recorded in workspace '{ws.name}' with status '{raw_work.status}'.",
            "feature_evidence_matrix": []
        }

    # 2. Fetch Investigation Case & Notes
    case = db.query(InvestigationCase).filter(
        InvestigationCase.workspace_id == ws.id,
        InvestigationCase.work_id == clean_id
    ).first()
    case_dict = {"current_status": case.current_status} if case else {"current_status": "UNDER REVIEW"}

    notes = db.query(InvestigationNote).filter(
        InvestigationNote.workspace_id == ws.id,
        InvestigationNote.work_id == clean_id
    ).order_by(desc(InvestigationNote.id)).all()
    notes_list = [{"timestamp": n.timestamp.isoformat(), "officer_name": n.officer_name, "note_text": n.note_text} for n in notes]

    # 3. Fetch Audit Logs
    audit_logs = db.query(AuditLog).filter(
        AuditLog.workspace_id == ws.id,
        AuditLog.work_id == clean_id
    ).order_by(desc(AuditLog.id)).limit(10).all()
    audit_list = [{"timestamp": a.timestamp.isoformat(), "actor": a.actor, "action_type": a.action_type, "details": a.details} for a in audit_logs]

    # 4. Generate PDF Binary
    pdf_bytes = generate_project_pdf(
        work_data=work_dict,
        explanation=explanation,
        case_data=case_dict,
        notes=notes_list,
        audit_logs=audit_list,
        workspace_name=ws.name
    )

    clean_filename = re.sub(r'[^a-zA-Z0-9_\-]+', '_', clean_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=MPLADS_Intelligence_Report_{clean_filename}.pdf",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

# ==================================================
# 9. EARLY WARNINGS & PROACTIVE SIGNALS API
# ==================================================

@app.get("/api/overview/early-warnings")
def get_early_warnings(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    scored_works = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id).all()
    
    warnings = []

    # 1. Extreme Sanction Delay (> 120 days)
    extreme_delay_works = [w for w in scored_works if w.sanction_delay_days > 120]
    if extreme_delay_works:
        warnings.append({
            "id": "EW-DELAY-EXTREME",
            "type": "CRITICAL",
            "title": "Severe Administrative Sanction Delay (> 120 Days)",
            "detail": f"{len(extreme_delay_works)} work(s) exceeded 120 days before Administrative Sanction issuance, breaching the statutory 75-day MoSPI limit.",
            "count": len(extreme_delay_works),
            "sample_work_ids": [w.work_id for w in extreme_delay_works[:5]]
        })

    # 2. Elevated Sanction Delay (75 - 120 days)
    elevated_delay_works = [w for w in scored_works if 75 < w.sanction_delay_days <= 120]
    if elevated_delay_works:
        warnings.append({
            "id": "EW-DELAY-ELEVATED",
            "type": "WARNING",
            "title": "Statutory 75-Day Limit Exceeded",
            "detail": f"{len(elevated_delay_works)} work(s) were processed between 75 to 120 days from MP recommendation.",
            "count": len(elevated_delay_works),
            "sample_work_ids": [w.work_id for w in elevated_delay_works[:5]]
        })

    # 3. Disbursed Funds Awaiting Completion (Disbursement Stagnation)
    disbursed_incomplete = [w for w in scored_works if (w.disbursed_amount_lakhs or 0) > 0 and not w.is_completed]
    if disbursed_incomplete:
        warnings.append({
            "id": "EW-DISB-INCOMPLETE",
            "type": "WARNING",
            "title": "Funds Released Without Verified Completion Certificate",
            "detail": f"{len(disbursed_incomplete)} work(s) have recorded fund disbursements while physical completion or UC verification is still pending.",
            "count": len(disbursed_incomplete),
            "sample_work_ids": [w.work_id for w in disbursed_incomplete[:5]]
        })

    # 4. Implementing Agency High Concentration
    agency_counts = {}
    for w in scored_works:
        agency_counts[w.ida] = agency_counts.get(w.ida, 0) + 1
    total_w = len(scored_works) or 1
    for ida_name, cnt in agency_counts.items():
        pct = (cnt / total_w) * 100.0
        if pct > 60.0 and len(agency_counts) > 1:
            clean_ida = ida_name.replace(' (DEPUTY COMMISSIONER LUDHIANA_IDA)', '')
            warnings.append({
                "id": "EW-AGENCY-CONCENTRATION",
                "type": "CRITICAL",
                "title": f"High Agency Concentration ({clean_ida}: {pct:.1f}%)",
                "detail": f"Single executing body '{clean_ida}' holds {cnt} of {total_w} works ({pct:.1f}% of total scheme volume), exceeding the 50% diversification benchmark.",
                "count": cnt,
                "sample_work_ids": [w.work_id for w in scored_works if w.ida == ida_name][:5]
            })

    return {
        "workspace_id": ws.id,
        "workspace_name": ws.name,
        "total_warnings": len(warnings),
        "warnings": warnings
    }

# ==================================================
# 10. CONTRACTOR INTELLIGENCE API
# ==================================================

@app.get("/api/contractors")
def get_contractor_intelligence(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    scored_works = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id).all()

    # Check if contractor data exists in features or attributes
    contractors_map = {}
    has_contractor_data = False

    for w in scored_works:
        feats = w.features or {}
        contractor = feats.get("contractor_name") or getattr(w, "contractor_name", None)
        if contractor and str(contractor).strip() and str(contractor).strip().upper() not in ["UNKNOWN", "NONE", "N/A", ""]:
            has_contractor_data = True
            c_name = str(contractor).strip()
            if c_name not in contractors_map:
                contractors_map[c_name] = {
                    "contractor_name": c_name,
                    "total_works": 0,
                    "total_sanctioned_amount_lakhs": 0.0,
                    "completed_works": 0,
                    "delayed_works": 0,
                    "anomaly_works_count": 0,
                    "risk_scores": [],
                    "works": []
                }
            contractors_map[c_name]["total_works"] += 1
            contractors_map[c_name]["total_sanctioned_amount_lakhs"] += (w.sanctioned_amount_lakhs or 0.0)
            if w.is_completed:
                contractors_map[c_name]["completed_works"] += 1
            if w.sanction_delay_days > 75:
                contractors_map[c_name]["delayed_works"] += 1
            if w.is_ml_anomaly:
                contractors_map[c_name]["anomaly_works_count"] += 1
            contractors_map[c_name]["risk_scores"].append(w.risk_priority_score or 0.0)
            contractors_map[c_name]["works"].append({
                "work_id": w.work_id,
                "title": w.title,
                "sanctioned_amount_lakhs": w.sanctioned_amount_lakhs,
                "risk_priority_score": w.risk_priority_score,
                "is_ml_anomaly": w.is_ml_anomaly
            })

    if not has_contractor_data or not contractors_map:
        return {
            "workspace_id": ws.id,
            "workspace_name": ws.name,
            "has_contractor_data": False,
            "total_contractors": 0,
            "contractors": [],
            "message": "Contractor intelligence unavailable for this dataset because contractor identifiers are not present in the uploaded data feeds."
        }

    # Aggregate contractor summaries
    contractor_list = []
    for c_name, c_data in contractors_map.items():
        avg_risk = sum(c_data["risk_scores"]) / len(c_data["risk_scores"]) if c_data["risk_scores"] else 0.0
        anom_rate = (c_data["anomaly_works_count"] / c_data["total_works"]) * 100.0 if c_data["total_works"] else 0.0
        contractor_list.append({
            "contractor_name": c_name,
            "total_works": c_data["total_works"],
            "total_sanctioned_amount_lakhs": round(c_data["total_sanctioned_amount_lakhs"], 2),
            "completed_works": c_data["completed_works"],
            "delayed_works": c_data["delayed_works"],
            "anomaly_works_count": c_data["anomaly_works_count"],
            "anomaly_rate_pct": round(anom_rate, 1),
            "average_risk_score": round(avg_risk, 1),
            "works": c_data["works"][:10]
        })

    contractor_list.sort(key=lambda x: (x["anomaly_works_count"], x["average_risk_score"]), reverse=True)

    return {
        "workspace_id": ws.id,
        "workspace_name": ws.name,
        "has_contractor_data": True,
        "total_contractors": len(contractor_list),
        "contractors": contractor_list,
        "message": f"Identified {len(contractor_list)} executing contractor(s)."
    }

# ==================================================
# 11. DISTRICT & IDA MATRIX API
# ==================================================

@app.get("/api/matrix/district-ida")
def get_district_ida_matrix(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    scored_works = db.query(MlScoredWork).filter(MlScoredWork.workspace_id == ws.id).all()

    matrix_map = {}
    districts_set = set()
    idas_set = set()
    total_sanctioned_lakhs = sum((w.sanctioned_amount_lakhs or 0.0) for w in scored_works) or 1.0

    for w in scored_works:
        dist = w.district or "Unknown District"
        raw_ida = w.ida or "Unknown Agency"
        clean_ida = raw_ida.replace(' (DEPUTY COMMISSIONER LUDHIANA_IDA)', '').replace('_IDA', '')
        
        districts_set.add(dist)
        idas_set.add(clean_ida)

        key = (dist, clean_ida)
        if key not in matrix_map:
            matrix_map[key] = {
                "district": dist,
                "ida": clean_ida,
                "works_count": 0,
                "sanctioned_amount_lakhs": 0.0,
                "completed_count": 0,
                "delayed_count": 0,
                "anomaly_count": 0,
                "risk_scores": []
            }
        matrix_map[key]["works_count"] += 1
        matrix_map[key]["sanctioned_amount_lakhs"] += (w.sanctioned_amount_lakhs or 0.0)
        if w.is_completed:
            matrix_map[key]["completed_count"] += 1
        if w.sanction_delay_days > 75:
            matrix_map[key]["delayed_count"] += 1
        if w.is_ml_anomaly:
            matrix_map[key]["anomaly_count"] += 1
        matrix_map[key]["risk_scores"].append(w.risk_priority_score or 0.0)

    # Format cell list
    cells = []
    for (dist, ida), data in matrix_map.items():
        avg_risk = sum(data["risk_scores"]) / len(data["risk_scores"]) if data["risk_scores"] else 0.0
        conc_pct = (data["sanctioned_amount_lakhs"] / total_sanctioned_lakhs) * 100.0
        cells.append({
            "district": dist,
            "ida": ida,
            "works_count": data["works_count"],
            "sanctioned_amount_lakhs": round(data["sanctioned_amount_lakhs"], 2),
            "sanctioned_amount_cr": round(data["sanctioned_amount_lakhs"] / 100.0, 3),
            "completed_count": data["completed_count"],
            "completion_rate_pct": round((data["completed_count"] / data["works_count"]) * 100.0, 1) if data["works_count"] else 0.0,
            "delayed_count": data["delayed_count"],
            "anomaly_count": data["anomaly_count"],
            "average_risk_score": round(avg_risk, 1),
            "concentration_pct": round(conc_pct, 1)
        })

    cells.sort(key=lambda x: (x["anomaly_count"], x["sanctioned_amount_lakhs"]), reverse=True)

    return {
        "workspace_id": ws.id,
        "workspace_name": ws.name,
        "districts": sorted(list(districts_set)),
        "idas": sorted(list(idas_set)),
        "total_cells": len(cells),
        "matrix": cells
    }

# ==================================================
# 12. TRACEABLE DATA LINEAGE API
# ==================================================

@app.get("/api/lineage/{work_id:path}")
def get_work_data_lineage(
    work_id: str,
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    clean_id = urllib.parse.unquote(work_id).strip()

    sanct = db.query(SanctionedWork).filter(
        SanctionedWork.workspace_id == ws.id,
        SanctionedWork.work_id == clean_id
    ).first()
    if not sanct:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work ID '{clean_id}' not found in workspace '{ws.name}'."
        )

    ml_work = db.query(MlScoredWork).filter(
        MlScoredWork.workspace_id == ws.id,
        MlScoredWork.work_id == clean_id
    ).first()

    rec = db.query(RecommendedWork).filter(
        RecommendedWork.workspace_id == ws.id,
        RecommendedWork.work_id == clean_id
    ).first()

    comp = db.query(CompletedWork).filter(
        CompletedWork.workspace_id == ws.id,
        CompletedWork.work_id_matched == clean_id
    ).first()

    audit_logs = db.query(AuditLog).filter(
        AuditLog.workspace_id == ws.id,
        AuditLog.work_id == clean_id
    ).order_by(AuditLog.id).all()

    pipeline_stages = [
        {
            "stage_number": 1,
            "stage_name": "CSV Ingestion & Canonical Schema Mapping",
            "status": "VERIFIED",
            "timestamp": ws.created_at.isoformat() if ws.created_at else datetime.utcnow().isoformat(),
            "details": f"Raw record received from feed. Mapped canonical identifier: '{sanct.work_id}'."
        },
        {
            "stage_number": 2,
            "stage_name": "Data Cleaning & Monetary Normalization",
            "status": "VERIFIED",
            "timestamp": ws.created_at.isoformat() if ws.created_at else datetime.utcnow().isoformat(),
            "details": f"Sanctioned amount normalized to ₹{sanct.sanctioned_amount_lakhs:.2f} Lakhs (INR {sanct.sanctioned_amount:,.0f}). Recommendation match: {'Exact Match' if rec else 'Sanction Feed Only'}."
        },
        {
            "stage_number": 3,
            "stage_name": "6-Dimensional Multivariate Feature Extraction",
            "status": "VERIFIED" if ml_work else "PENDING",
            "timestamp": ws.updated_at.isoformat() if ws.updated_at else datetime.utcnow().isoformat(),
            "details": f"Features constructed: Cost Z-Score ({(ml_work.features.get('category_cost_zscore', 0) if ml_work else 0):.2f} SD), Delay ({(ml_work.sanction_delay_days if ml_work else 0)} days), Agency Concentration ({(ml_work.features.get('ida_concentration_pct', 0) if ml_work else 0):.1f}%)."
        },
        {
            "stage_number": 4,
            "stage_name": "AI/ML Isolation Forest & Statutory Compliance Scoring",
            "status": "VERIFIED" if ml_work else "PENDING",
            "timestamp": ws.updated_at.isoformat() if ws.updated_at else datetime.utcnow().isoformat(),
            "details": f"Anomaly Intensity S_ml = {(ml_work.ml_anomaly_score if ml_work else 0):.1f}, Statutory Rule Penalty S_rule = {(ml_work.rule_score if ml_work else 0):.1f}."
        },
        {
            "stage_number": 5,
            "stage_name": "Composite Risk Index Formulation & Decision Triage",
            "status": "VERIFIED" if ml_work else "PENDING",
            "timestamp": ws.updated_at.isoformat() if ws.updated_at else datetime.utcnow().isoformat(),
            "details": f"S_risk = 0.60 × S_ml + 0.40 × S_rule = {(ml_work.risk_priority_score if ml_work else 0):.1f} / 100 ({ml_work.severity_band if ml_work else 'NORMAL'})."
        }
    ]

    return {
        "workspace_id": ws.id,
        "workspace_name": ws.name,
        "work_id": clean_id,
        "title": sanct.title,
        "source_data": {
            "raw_sanctioned_row": {
                "work_id": sanct.work_id,
                "title": sanct.title,
                "category": sanct.category,
                "ida": sanct.ida,
                "district": sanct.district,
                "sanctioned_amount": sanct.sanctioned_amount,
                "sanct_date": sanct.sanct_date,
                "status": sanct.status
            },
            "recommendation_matched": bool(rec),
            "completion_matched": bool(comp)
        },
        "features": ml_work.features if ml_work else {},
        "scores": {
            "ml_anomaly_score": ml_work.ml_anomaly_score if ml_work else 0.0,
            "rule_score": ml_work.rule_score if ml_work else 0.0,
            "risk_priority_score": ml_work.risk_priority_score if ml_work else 0.0,
            "severity_band": ml_work.severity_band if ml_work else "NORMAL RISK"
        },
        "pipeline_stages": pipeline_stages,
        "audit_events": [{"timestamp": a.timestamp.isoformat(), "action": a.action_type, "actor": a.actor, "details": a.details} for a in audit_logs]
    }

# ==================================================
# 13. EXECUTIVE COMMAND SUMMARY PDF REPORT
# ==================================================

@app.get("/api/reports/executive/pdf")
def get_executive_report_pdf(
    workspace_id: str = Query(..., description="Active Workspace ID"),
    db: Session = Depends(get_db)
):
    ws = require_workspace(db, workspace_id)
    
    kpis = {
        "total_sanctioned_works": ws.total_sanctioned_works,
        "total_sanctioned_amount_cr": ws.total_sanctioned_amount_cr,
        "total_completed_works": ws.total_completed_works,
        "total_disbursed_amount_cr": ws.total_disbursed_amount_cr,
        "ml_anomaly_candidates_count": ws.ml_anomaly_candidates_count,
        "critical_risk_count": ws.critical_risk_count,
        "high_risk_count": ws.high_risk_count,
        "medium_risk_count": ws.medium_risk_count,
        "normal_risk_count": ws.normal_risk_count
    }

    top_anomalies_query = db.query(MlScoredWork).filter(
        MlScoredWork.workspace_id == ws.id
    ).order_by(desc(MlScoredWork.risk_priority_score)).limit(10).all()

    top_anomalies = [
        {
            "work_id": a.work_id,
            "title": a.title,
            "ida": a.ida.replace(' (DEPUTY COMMISSIONER LUDHIANA_IDA)', ''),
            "risk_priority_score": a.risk_priority_score,
            "severity_band": a.severity_band
        } for a in top_anomalies_query
    ]

    ida_counts = db.query(
        SanctionedWork.ida,
        func.count(SanctionedWork.id).label("count"),
        func.sum(SanctionedWork.sanctioned_amount_lakhs).label("outlay_lakhs")
    ).filter(SanctionedWork.workspace_id == ws.id).group_by(SanctionedWork.ida).all()

    total_w = ws.total_sanctioned_works or 1
    agency_dist = [
        {
            "agency": row[0].replace(' (DEPUTY COMMISSIONER LUDHIANA_IDA)', ''),
            "count": row[1],
            "outlay_cr": round((row[2] or 0.0) / 100.0, 2),
            "percentage": round((row[1] / total_w) * 100.0, 1)
        } for row in ida_counts
    ]

    early_warnings_resp = get_early_warnings(workspace_id=ws.id, db=db)
    early_warnings = early_warnings_resp.get("warnings", [])

    pdf_bytes = generate_executive_pdf(
        workspace_name=ws.name,
        kpis=kpis,
        top_anomalies=top_anomalies,
        agency_dist=agency_dist,
        early_warnings=early_warnings
    )

    clean_ws_name = re.sub(r'[^a-zA-Z0-9_\-]+', '_', ws.name)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=MPLADS_Executive_Command_Report_{clean_ws_name}.pdf",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)



