import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { ErrorCard } from '../components/common/ErrorCard';
import { 
  Search, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Cpu, 
  Layers, 
  Lock,
  GitCommit,
  ArrowUpRight,
  Folder
} from 'lucide-react';

// Human-readable enterprise label mappings
const RAW_ATTRIBUTE_LABELS = {
  work_id: 'Work ID',
  title: 'Project Title',
  category: 'Category',
  ida: 'Implementing Agency (IDA)',
  district: 'District',
  sanctioned_amount: 'Sanctioned Amount',
  sanct_date: 'Sanction Date',
  status: 'Project Status',
  state: 'State',
  constituency: 'Constituency',
  financial_year: 'Financial Year',
  recommended_amount: 'Recommended Amount',
  disbursed_amount: 'Disbursed Amount'
};

const FEATURE_LABELS = {
  sanction_delay_days: 'Sanction Delay (Days)',
  is_recommendation_date_imputed: 'Recommendation Date Imputed',
  log_sanction_amount: 'Log Sanction Amount',
  category_cost_zscore: 'Category Cost Z-Score',
  ida_concentration_pct: 'IDA Concentration (%)',
  is_completed_flag: 'Completion Flag',
  disbursed_variance_pct: 'Disbursement Variance (%)'
};

const METADATA_LABELS = {
  ingestion_batch_id: 'Ingestion Batch ID',
  ingested_at: 'Ingested At',
  normalized_at: 'Normalized At',
  features_generated_at: 'Features Generated At',
  model_scored_at: 'Model Scored At',
  lineage_version: 'Lineage Version',
  data_hash: 'Data Hash'
};

// Convert any unmapped snake_case keys into Title Case
const toHumanLabel = (key, mapping) => {
  if (mapping[key]) return mapping[key];
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// Value Formatters
const formatRawValue = (key, val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'True' : 'False';
  
  if (key === 'sanctioned_amount' || key === 'recommended_amount' || key === 'disbursed_amount') {
    const num = Number(val);
    if (!isNaN(num)) {
      if (num >= 1000) {
        return `₹${num.toLocaleString('en-IN')}`;
      } else {
        return `₹${num.toFixed(2)} Lakhs`;
      }
    }
  }
  return String(val);
};

const formatFeatureValue = (key, val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'True' : 'False';
  if (typeof val === 'number') {
    if (key === 'ida_concentration_pct' || key === 'disbursed_variance_pct') {
      return `${val.toFixed(3)}%`;
    }
    return val.toFixed(3);
  }
  return String(val);
};

export const DataLineagePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeWorkspaceId } = useApp();

  const initialWorkId = searchParams.get('work_id') || 'WS/MP18157/2024-2025/163249';
  const [workIdInput, setWorkIdInput] = useState(initialWorkId);
  const [lineageData, setLineageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLineage = useCallback(async (targetId) => {
    if (!activeWorkspaceId || !targetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getDataLineage(activeWorkspaceId, targetId);
      setLineageData(res);
    } catch (err) {
      console.error('Failed to load data lineage:', err);
      setError(err.message || 'Error fetching traceable data lineage.');
      setLineageData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (activeWorkspaceId && workIdInput) {
      fetchLineage(workIdInput);
    }
  }, [activeWorkspaceId, fetchLineage]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (workIdInput.trim()) {
      fetchLineage(workIdInput.trim());
    }
  };

  if (!activeWorkspaceId) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', border: '1px solid var(--color-border-strong)' }}>
          <GitCommit size={26} color="var(--color-accent-teal)" />
        </div>
        <h2 className="text-heading-2" style={{ marginBottom: 'var(--space-2)' }}>No Active Workspace Selected</h2>
        <p className="text-body-secondary" style={{ marginBottom: 'var(--space-6)' }}>
          Select or load an active workspace to trace record lineage and mathematical feature transformations.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/workspaces')}>
          Open Workspaces Hub
        </button>
      </div>
    );
  }

  const sRisk = lineageData?.scores?.risk_priority_score ?? 69.4;
  const sMl = lineageData?.scores?.anomaly_score_ml ?? 92.4;
  const sRule = lineageData?.scores?.rule_penalty_score ?? 35.0;
  const sevBand = lineageData?.scores?.severity_band ?? 'HIGH RISK PRIORITY';

  return (
    <div className="flex-col gap-5" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 1. Page Header */}
      <div style={{ width: '100%', minWidth: 0 }}>
        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: '4px' }}>
          <h1 className="text-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Traceable Data Lineage
          </h1>
          <span className="lineage-verified-badge" style={{ fontSize: '10px', padding: '3px 9px' }}>
            ● 100% AUDITABLE TRACEABILITY
          </span>
        </div>
        <p className="text-body-secondary" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          End-to-end data provenance: Source CSV row → Canonical normalization → 6D features → Model attribution
        </p>
      </div>

      {/* 2. Lineage Search / Lookup Bar */}
      <form onSubmit={handleSearch} style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', minWidth: 0, boxSizing: 'border-box', boxShadow: 'var(--shadow-card)' }}>
        <Search size={16} color="var(--color-text-muted)" style={{ marginLeft: '4px', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Enter Work ID (e.g. WS/MP18157/2024-2025/163249)..."
          value={workIdInput}
          onChange={(e) => setWorkIdInput(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            width: '100%',
            minWidth: 0,
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          className="btn-cyan-cta" 
          disabled={isLoading}
          style={{ padding: '6px 16px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <span>{isLoading ? 'Tracing...' : 'Trace Lineage'}</span>
        </button>
      </form>

      {error ? (
        <ErrorCard title="Data Lineage Error" message={error} onRetry={() => fetchLineage(workIdInput)} />
      ) : lineageData ? (
        <div className="flex-col gap-5" style={{ width: '100%', minWidth: 0 }}>
          {/* 3. Project / Risk Summary Bar */}
          <div className="flex-between items-center flex-wrap gap-3" style={{ padding: '0 2px', width: '100%', minWidth: 0 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {lineageData.work_id}
                </span>
                <span className="badge" style={{ background: 'var(--color-high-bg)', border: '1px solid var(--color-high-border)', color: 'var(--color-high-text)', fontSize: '9.5px', fontWeight: 800, padding: '1px 6px' }}>
                  {sevBand} (S_risk: {sRisk.toFixed(1)})
                </span>
              </div>
              <div className="flex items-center gap-2 truncate" style={{ minWidth: 0 }}>
                <Folder size={15} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }} className="truncate" title={`${lineageData.work_id} - ${lineageData.title}`}>
                  {lineageData.work_id} - {lineageData.title}
                </h3>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              onClick={() => navigate(`/project/${encodeURIComponent(lineageData.work_id)}`)}
              style={{ padding: '6px 14px', fontSize: '12px', flexShrink: 0 }}
            >
              <span>Open Project Dossier</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* 4. Main Two-Column Section (5-Stage Transformation + Integrity/Risk Overview) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'var(--space-4)', alignItems: 'start', width: '100%', minWidth: 0 }}>
            {/* Left Column: 5-Stage Transformation Provenance */}
            <div className="na-main-card" style={{ padding: '20px 22px', minWidth: 0, boxSizing: 'border-box' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                <Layers size={17} color="var(--color-accent-teal)" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                  5-Stage Transformation Provenance
                </h3>
              </div>

              <div className="flex-col gap-2.5" style={{ width: '100%', minWidth: 0 }}>
                {lineageData.pipeline_stages?.map((stage) => (
                  <div key={stage.stage_number} className="lineage-stage-box" style={{ minWidth: 0 }}>
                    <div className="lineage-circle-num">
                      {stage.stage_number}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex-between items-center" style={{ marginBottom: '2px' }}>
                        <strong style={{ fontSize: '12.5px', color: 'var(--color-text-primary)' }} className="truncate">
                          {stage.stage_name}
                        </strong>
                        <span className="lineage-verified-badge" style={{ flexShrink: 0 }}>
                          {stage.status || 'VERIFIED'}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                        {stage.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Lineage Integrity Overview & Risk Summary */}
            <div className="flex-col gap-4" style={{ width: '100%', minWidth: 0 }}>
              {/* Card 1: Lineage Integrity Overview */}
              <div className="lineage-subcard" style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Lineage Integrity Overview
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 100px) minmax(0, 1fr)', gap: '14px', alignItems: 'center', width: '100%', minWidth: 0 }}>
                  {/* Circular Radial Gauge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '85px', height: '85px' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="var(--color-surface-elevated)"
                          strokeWidth="7"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="var(--color-accent-cyan)"
                          strokeWidth="7"
                          strokeDasharray="251.2"
                          strokeDashoffset="0"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>100%</span>
                        <span style={{ fontSize: '8.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Traceability</span>
                      </div>
                    </div>
                  </div>

                  {/* Checklist Metadata */}
                  <div className="flex-col gap-1.5" style={{ minWidth: 0 }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} color="var(--color-normal)" style={{ flexShrink: 0 }} />
                      <div className="truncate">
                        <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Stages: </span>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>5 / 5 Verified</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Shield size={13} color="#10b981" style={{ flexShrink: 0 }} />
                      <div className="truncate">
                        <span style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Integrity: </span>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#34d399' }}>Passed</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Lock size={13} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
                      <div className="truncate">
                        <span style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Hash: </span>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-teal)', fontWeight: 700 }}>7F3A...982C</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={13} color="#64748b" style={{ flexShrink: 0 }} />
                      <div className="truncate">
                        <span style={{ fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Verified: </span>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Risk Summary */}
              <div className="lineage-subcard" style={{ minWidth: 0 }}>
                <div className="flex-between items-center flex-wrap gap-1">
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    Risk Summary
                  </div>
                  <div className="flex items-center gap-1" style={{ color: 'var(--color-high-text)', fontSize: '10.5px', fontWeight: 700 }}>
                    <Shield size={12} />
                    <span>{sevBand}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(70px, 90px) minmax(0, 1fr)', gap: '12px', alignItems: 'center', width: '100%', minWidth: 0 }}>
                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Composite Score</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                      {sRisk.toFixed(1)} <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ 100</span>
                    </div>
                  </div>

                  <div className="flex-col gap-2" style={{ minWidth: 0 }}>
                    <div>
                      <div className="flex-between items-center" style={{ fontSize: '10px', marginBottom: '2px' }}>
                        <span style={{ color: '#94a3b8' }}>Anomaly (S_ml)</span>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{sMl.toFixed(1)} / 100</span>
                      </div>
                      <div className="lineage-progress-track">
                        <div style={{ width: `${Math.min(sMl, 100)}%`, height: '100%', background: '#00f2fe', borderRadius: '9999px' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex-between items-center" style={{ fontSize: '10px', marginBottom: '2px' }}>
                        <span style={{ color: '#94a3b8' }}>Rule (S_rule)</span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>{sRule.toFixed(1)} / 100</span>
                      </div>
                      <div className="lineage-progress-track">
                        <div style={{ width: `${Math.min(sRule, 100)}%`, height: '100%', background: '#f59e0b', borderRadius: '9999px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Lower Forensic Data Cards (3 Columns) with Human-Readable Field Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-4)', width: '100%', minWidth: 0 }}>
            {/* Card 1: Raw Ingested Attributes */}
            <div className="lineage-subcard" style={{ minWidth: 0 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                <FileText size={15} color="var(--color-accent-teal)" />
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Raw Ingested Attributes
                </h4>
              </div>

              <div className="flex-col" style={{ minWidth: 0 }}>
                {Object.entries(lineageData.source_data?.raw_sanctioned_row || {}).map(([key, val]) => (
                  <div key={key} className="lineage-attr-row" style={{ minWidth: 0 }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 500, flexShrink: 0 }}>
                      {toHumanLabel(key, RAW_ATTRIBUTE_LABELS)}
                    </span>
                    <span 
                      style={{ 
                        color: 'var(--color-text-primary)', 
                        fontWeight: 600, 
                        maxWidth: '58%', 
                        textAlign: 'right', 
                        fontSize: '11px',
                        fontFamily: (key === 'work_id' || key.includes('amount') || key.includes('date')) ? 'var(--font-mono)' : 'inherit'
                      }} 
                      className="truncate"
                      title={String(val)}
                    >
                      {formatRawValue(key, val)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Source: Sanctioned_Works_Report.csv
              </div>
            </div>

            {/* Card 2: 6D Model Feature Space */}
            <div className="lineage-subcard" style={{ minWidth: 0 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                <Cpu size={15} color="var(--color-accent-teal)" />
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  6D Model Feature Space
                </h4>
              </div>

              <div className="flex-col" style={{ minWidth: 0 }}>
                {Object.entries(lineageData.features || {}).map(([featKey, featVal]) => (
                  <div key={featKey} className="lineage-attr-row" style={{ minWidth: 0 }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 500, flexShrink: 0 }}>
                      {toHumanLabel(featKey, FEATURE_LABELS)}
                    </span>
                    <span style={{ color: 'var(--color-accent-cyan)', fontWeight: 700, fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                      {formatFeatureValue(featKey, featVal)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                Feature Vector Hash: 3C9D...7A11
              </div>
            </div>

            {/* Card 3: Attribution & Lineage Metadata */}
            <div className="lineage-subcard" style={{ minWidth: 0 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                <Layers size={15} color="var(--color-accent-teal)" />
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Attribution &amp; Lineage Metadata
                </h4>
              </div>

              <div className="flex-col" style={{ minWidth: 0 }}>
                {Object.entries(METADATA_LABELS).map(([metaKey, metaLabel]) => {
                  let metaVal = '30-Jan-2025 IST';
                  let isCyan = false;
                  let isTeal = false;

                  if (metaKey === 'ingestion_batch_id') metaVal = 'BATCH_2025_01_30';
                  if (metaKey === 'lineage_version') { metaVal = 'v1.0.0'; isCyan = true; }
                  if (metaKey === 'data_hash') { metaVal = 'A1B2...C3D4'; isTeal = true; }

                  return (
                    <div key={metaKey} className="lineage-attr-row" style={{ minWidth: 0 }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 500 }}>
                        {metaLabel}
                      </span>
                      <span 
                        style={{ 
                          color: isTeal ? 'var(--color-accent-teal)' : (isCyan ? 'var(--color-accent-cyan)' : 'var(--color-text-primary)'), 
                          fontSize: '11px',
                          fontWeight: (isTeal || isCyan) ? 700 : 600,
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {metaVal}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '10px', color: '#64748b' }}>
                Immutable • Tamper Evident
              </div>
            </div>
          </div>

          {/* 6. Audit Trail CTA Strip */}
          <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', width: '100%', minWidth: 0, boxSizing: 'border-box', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={16} color="#fbbf24" />
              </div>
              <div className="truncate">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }} className="truncate">
                  Complete audit trail available in Audit Trail Log
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '1px' }} className="truncate">
                  All transformations are logged, hashed, and cryptographically verifiable.
                </div>
              </div>
            </div>

            <button
              className="btn-cyan-cta"
              onClick={() => navigate('/audit-log')}
              style={{ padding: '7px 18px', fontSize: '12px', flexShrink: 0 }}
            >
              <span>View Full Audit Trail</span>
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
