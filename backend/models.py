from sqlalchemy import Column, Integer, Float, String, Boolean, Text, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String, primary_key=True, index=True) # Unique ID (e.g. UUID or "demo-ludhiana")
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="CREATED") # CREATED, UPLOADED, VALIDATED, CLEANED, ANALYZED, ACTIVE
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Cached KPI metrics
    total_sanctioned_works = Column(Integer, default=0)
    total_sanctioned_amount_cr = Column(Float, default=0.0)
    total_recommended_works = Column(Integer, default=0)
    total_recommended_amount_cr = Column(Float, default=0.0)
    total_completed_works = Column(Integer, default=0)
    total_disbursed_amount_cr = Column(Float, default=0.0)
    ml_anomaly_candidates_count = Column(Integer, default=0)
    critical_risk_count = Column(Integer, default=0)
    high_risk_count = Column(Integer, default=0)
    medium_risk_count = Column(Integer, default=0)
    normal_risk_count = Column(Integer, default=0)

    # Relationships with cascade delete
    sanctioned_works = relationship("SanctionedWork", back_populates="workspace", cascade="all, delete-orphan")
    recommended_works = relationship("RecommendedWork", back_populates="workspace", cascade="all, delete-orphan")
    completed_works = relationship("CompletedWork", back_populates="workspace", cascade="all, delete-orphan")
    ml_scored_works = relationship("MlScoredWork", back_populates="workspace", cascade="all, delete-orphan")
    investigation_cases = relationship("InvestigationCase", back_populates="workspace", cascade="all, delete-orphan")
    investigation_notes = relationship("InvestigationNote", back_populates="workspace", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="workspace", cascade="all, delete-orphan")

class SanctionedWork(Base):
    __tablename__ = "sanctioned_works"
    __table_args__ = (UniqueConstraint('workspace_id', 'work_id', name='uix_sanct_workspace_work'),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    work_id = Column(String, nullable=False, index=True) # Work ID (WS/MP18157/YYYY-YYYY/XXXXXX)
    sr_no = Column(String, nullable=True)
    title = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    ida = Column(String, nullable=False)
    district = Column(String, nullable=False)
    mp_name = Column(String, nullable=False)
    constituency = Column(String, nullable=False)
    state = Column(String, nullable=False)
    sanctioned_amount = Column(Float, nullable=False) # INR
    sanctioned_amount_lakhs = Column(Float, nullable=False) # Lakhs
    sanct_date = Column(String, nullable=True)
    status = Column(String, nullable=False)

    workspace = relationship("Workspace", back_populates="sanctioned_works")

class RecommendedWork(Base):
    __tablename__ = "recommended_works"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    work_id = Column(String, nullable=True, index=True)
    sr_no = Column(String, nullable=True)
    title = Column(Text, nullable=False)
    recommended_amount = Column(Float, nullable=False) # INR
    recommended_amount_lakhs = Column(Float, nullable=False) # Lakhs
    rec_date = Column(String, nullable=True)
    district = Column(String, nullable=False)

    workspace = relationship("Workspace", back_populates="recommended_works")

class CompletedWork(Base):
    __tablename__ = "completed_works"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    sr_no = Column(String, nullable=True)
    work_id_matched = Column(String, nullable=True, index=True)
    title = Column(Text, nullable=False)
    disbursed_amount = Column(Float, nullable=False) # INR
    disbursed_amount_lakhs = Column(Float, nullable=False) # Lakhs
    completion_date = Column(String, nullable=True)
    district = Column(String, nullable=False)

    workspace = relationship("Workspace", back_populates="completed_works")

class MlScoredWork(Base):
    __tablename__ = "ml_scored_works"
    __table_args__ = (UniqueConstraint('workspace_id', 'work_id', name='uix_ml_workspace_work'),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    work_id = Column(String, nullable=False, index=True) # Work ID
    sr_no = Column(String, nullable=True)
    title = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    ida = Column(String, nullable=False)
    district = Column(String, nullable=False)
    mp_name = Column(String, nullable=False)
    constituency = Column(String, nullable=False)
    state = Column(String, nullable=False)

    sanctioned_amount_lakhs = Column(Float, nullable=False)
    recommended_amount_lakhs = Column(Float, nullable=False)
    sanction_delay_days = Column(Integer, nullable=False)
    is_recommendation_date_imputed = Column(Boolean, default=False)
    status = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    disbursed_amount_lakhs = Column(Float, default=0.0)

    # 6 Feature Vector stored as JSON
    features = Column(JSON, nullable=False)

    # Scores
    ml_anomaly_score = Column(Float, nullable=False) # S_ml [0, 100]
    rule_score = Column(Float, nullable=False)       # S_rule [0, 100]
    risk_priority_score = Column(Float, nullable=False) # S_risk = 0.60 S_ml + 0.40 S_rule
    severity_band = Column(String, nullable=False)  # CRITICAL RISK PRIORITY, HIGH, MEDIUM, NORMAL
    is_ml_anomaly = Column(Boolean, default=False)   # S_ml >= 70.0
    rule_signals = Column(JSON, nullable=False)      # List of triggered rule descriptions
    explanation = Column(JSON, nullable=False)       # Explanation dictionary

    workspace = relationship("Workspace", back_populates="ml_scored_works")

class InvestigationCase(Base):
    __tablename__ = "investigation_cases"
    __table_args__ = (UniqueConstraint('workspace_id', 'work_id', name='uix_case_workspace_work'),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    work_id = Column(String, nullable=False, index=True)
    current_status = Column(String, default="UNDER REVIEW")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="investigation_cases")

class InvestigationNote(Base):
    __tablename__ = "investigation_notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    work_id = Column(String, nullable=False, index=True)
    officer_name = Column(String, default="State Nodal Officer")
    note_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="investigation_notes")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    work_id = Column(String, nullable=False, index=True)
    action_type = Column(String, nullable=False)
    previous_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    actor = Column(String, default="State Nodal Officer")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="audit_logs")
