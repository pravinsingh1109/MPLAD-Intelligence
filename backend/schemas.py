from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# ==================================================
# WORKSPACE SCHEMAS
# ==================================================

class WorkspaceCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120, description="Workspace / Analysis session name")
    description: Optional[str] = Field(None, max_length=500, description="Optional description")

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    total_sanctioned_works: int = 0
    total_sanctioned_amount_cr: float = 0.0
    total_recommended_works: int = 0
    total_recommended_amount_cr: float = 0.0
    total_completed_works: int = 0
    total_disbursed_amount_cr: float = 0.0
    ml_anomaly_candidates_count: int = 0
    critical_risk_count: int = 0
    high_risk_count: int = 0
    medium_risk_count: int = 0
    normal_risk_count: int = 0

    class Config:
        from_attributes = True

class WorkspaceListResponse(BaseModel):
    items: List[WorkspaceResponse]
    total: int

class ValidationSummaryResponse(BaseModel):
    workspace_id: str
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    counts: Dict[str, int]

class NormalizedColumnInfo(BaseModel):
    canonical_field: str
    label: str
    matched_column: str
    is_required: bool

class AutomatedCleaningSummaryResponse(BaseModel):
    workspace_id: str
    status: str
    sanctioned_count: int
    recommended_count: int
    completed_count: int
    imputed_dates_count: int
    normalized_amounts_count: int
    detected_columns: List[str] = []
    normalized_columns: List[NormalizedColumnInfo] = []
    warnings: List[str] = []

class AnalysisSummaryResponse(BaseModel):
    workspace_id: str
    workspace_name: str
    status: str
    total_scored: int
    anomalies_count: int
    critical_count: int
    high_count: int
    medium_count: int
    normal_count: int
    weights_applied: Dict[str, float]
    timestamp: datetime

# ==================================================
# OVERVIEW KPIS RESPONSE SCHEMA
# ==================================================

class OverviewKpisResponse(BaseModel):
    workspace_id: str
    workspace_name: str
    total_sanctioned_works: int
    total_sanctioned_amount_cr: float
    total_recommended_works: int
    total_recommended_amount_cr: float
    total_completed_works: int
    total_disbursed_amount_cr: float
    ml_anomaly_candidates_count: int
    critical_risk_count: int
    high_risk_count: int
    medium_risk_count: int
    normal_risk_count: int

# ==================================================
# ML SCORED WORK SCHEMA
# ==================================================

class MlScoredWorkSchema(BaseModel):
    id: str # Represents work_id string (e.g., WS/MP18157/2024-2025/163249)
    work_id: Optional[str] = None
    workspace_id: Optional[str] = None
    sr_no: Optional[str] = None
    title: str
    category: str
    ida: str
    district: str
    mp_name: str
    constituency: str
    state: str
    sanctioned_amount_lakhs: float
    recommended_amount_lakhs: float
    sanction_delay_days: int
    is_recommendation_date_imputed: bool
    status: str
    is_completed: bool
    disbursed_amount_lakhs: float
    features: Dict[str, Any]
    ml_anomaly_score: float
    rule_score: float
    risk_priority_score: float
    severity_band: str
    is_ml_anomaly: bool
    rule_signals: List[str]
    explanation: Dict[str, Any]

    class Config:
        from_attributes = True

# ==================================================
# RISK QUEUE PAGINATED RESPONSE SCHEMA
# ==================================================

class RiskQueuePaginatedResponse(BaseModel):
    items: List[MlScoredWorkSchema]
    page: int
    page_size: int
    total: int
    total_pages: int
    workspace_id: str
    workspace_name: str

# ==================================================
# INVESTIGATION & CASE SCHEMAS
# ==================================================

class InvestigationActionRequest(BaseModel):
    action: str = Field(..., description="MARK_FOR_FIELD_VERIFICATION, REQUEST_NODAL_AGENCY_AUDIT, or CLEAR_AFTER_REVIEW")
    details: Optional[str] = None
    actor: Optional[str] = "State Nodal Officer"

class InvestigationCaseResponse(BaseModel):
    work_id: str
    workspace_id: str
    current_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InvestigationNoteRequest(BaseModel):
    note_text: str = Field(..., min_length=1, description="Official investigation note or field observation text")
    officer_name: Optional[str] = "State Nodal Officer"

class InvestigationNoteResponse(BaseModel):
    id: int
    work_id: str
    workspace_id: str
    officer_name: str
    note_text: str
    timestamp: datetime

    class Config:
        from_attributes = True

# ==================================================
# AUDIT LOG SCHEMAS
# ==================================================

class AuditLogResponse(BaseModel):
    id: int
    work_id: str
    workspace_id: str
    action_type: str
    previous_status: Optional[str] = None
    new_status: str
    actor: str
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class AuditLogPaginatedResponse(BaseModel):
    items: List[AuditLogResponse]
    page: int
    page_size: int
    total: int
    total_pages: int
    workspace_id: str

# ==================================================
# HEALTH & COMMON SCHEMAS
# ==================================================

class HealthResponse(BaseModel):
    status: str
    database: str
    active_workspaces_count: int
