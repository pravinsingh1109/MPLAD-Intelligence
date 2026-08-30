import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { ErrorCard } from '../components/common/ErrorCard';
import { 
  Briefcase, 
  Building2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Info, 
  Search, 
  X,
  ExternalLink,
  Coins
} from 'lucide-react';

export const ContractorsPage = () => {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useApp();

  const [contractorData, setContractorData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContractors = useCallback(async () => {
    if (!activeWorkspaceId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getContractors(activeWorkspaceId);
      setContractorData(res);
    } catch (err) {
      console.error('Failed to load contractor intelligence:', err);
      setError(err.message || 'Error fetching contractor intelligence.');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadContractors();
  }, [loadContractors]);

  if (!activeWorkspaceId) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', border: '1px solid var(--color-border-strong)' }}>
          <Briefcase size={26} color="var(--color-accent-teal)" />
        </div>
        <h2 className="text-heading-2" style={{ marginBottom: 'var(--space-2)' }}>No Active Workspace Selected</h2>
        <p className="text-body-secondary" style={{ marginBottom: 'var(--space-6)' }}>
          Select or load an active workspace to view contractor portfolio analytics.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/workspaces')}>
          Open Workspaces Hub
        </button>
      </div>
    );
  }

  const contractorsList = contractorData?.contractors || [];
  const filteredContractors = contractorsList.filter(c => 
    c.contractor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalContractors = contractorsList.length;
  const totalOutlayLakhs = contractorsList.reduce((acc, c) => acc + (c.total_sanctioned_amount_lakhs || 0), 0);
  const totalAnomalies = contractorsList.reduce((acc, c) => acc + (c.anomaly_works_count || 0), 0);
  const highRiskContractors = contractorsList.filter(c => c.average_risk_score >= 50 || c.anomaly_works_count > 0).length;

  return (
    <div className="flex-col gap-4" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 1. Page Header */}
      <div className="flex-between items-center flex-wrap gap-3" style={{ width: '100%', minWidth: 0 }}>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Contractor &amp; Vendor Intelligence
            </h1>
            <span className="lineage-verified-badge" style={{ fontSize: '10px', padding: '3px 9px' }}>
              ● EXECUTING ENTITY EXPOSURE
            </span>
          </div>
          <p className="text-body-secondary truncate" style={{ marginTop: '3px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Aggregated contractor portfolio risk, financial outlay concentration, anomaly rates, and linked project records
          </p>
        </div>
      </div>

      {error ? (
        <ErrorCard title="Contractor Intelligence Error" message={error} onRetry={loadContractors} />
      ) : isLoading ? (
        <div className="lineage-subcard" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Aggregating contractor portfolio metrics...
        </div>
      ) : !contractorData?.has_contractor_data ? (
        /* Graceful degradation empty state when contractor data is absent in CSV */
        <div 
          style={{ 
            background: 'var(--color-surface-card)', 
            border: '1px solid var(--color-border-subtle)', 
            borderRadius: '14px', 
            padding: '36px 24px', 
            textAlign: 'center',
            maxWidth: '680px',
            margin: '20px auto',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--color-border-strong)' }}>
            <Building2 size={26} color="var(--color-text-muted)" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Contractor Entity Data Unavailable
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '580px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            {contractorData?.message || "Contractor intelligence unavailable for this dataset because contractor identifiers are not present in the uploaded data feeds."}
          </p>
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '10px', padding: '14px 18px', textAlign: 'left' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              <Info size={15} color="var(--color-accent-teal)" />
              <strong style={{ fontSize: '12.5px', color: 'var(--color-text-primary)' }}>Statutory Notice on Vendor Identification:</strong>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Under standard MoSPI e-SAKSHI progress reports, works are primarily allocated to <strong>Implementing Agencies (IDAs)</strong> (e.g. Deputy Commissioner, PWD, Municipal Corp). To activate vendor cartelization detection and risk scoring, upload an enriched dataset mapping the <code>contractor_name</code> or <code>vendor</code> column.
            </p>
          </div>
        </div>
      ) : (
        /* Active Contractor Intelligence Dashboard */
        <div className="flex-col gap-4" style={{ width: '100%', minWidth: 0 }}>
          {/* 2. Top Metric KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px', width: '100%', minWidth: 0 }}>
            {/* KPI 1 */}
            <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '14px 18px', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                <Building2 size={13} color="var(--color-accent-teal)" />
                <span>Executing Vendors</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {totalContractors} <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Entities</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '14px 18px', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                <Coins size={13} color="var(--color-accent-teal)" />
                <span>Total Contract Value</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                ₹{(totalOutlayLakhs / 100).toFixed(2)} <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Cr Outlay</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-critical-border)', borderRadius: '12px', padding: '14px 18px', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-critical-text)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                <AlertTriangle size={13} color="var(--color-critical-text)" />
                <span>Portfolio Anomalies</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-critical-text)', marginTop: '4px' }}>
                {totalAnomalies} <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Outlier Works</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-high-border)', borderRadius: '12px', padding: '14px 18px', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--color-high-text)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                <ShieldAlert size={13} color="var(--color-high-text)" />
                <span>High Exposure Vendors</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-high-text)', marginTop: '4px' }}>
                {highRiskContractors} <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Under Review</span>
              </div>
            </div>
          </div>

          {/* 3. Search Bar */}
          <div 
            style={{ 
              background: 'var(--color-surface-card)', 
              border: '1px solid var(--color-border-subtle)', 
              borderRadius: '12px', 
              padding: '8px 14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <Search size={15} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search executing contractors by vendor name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '12.5px',
                width: '100%',
                minWidth: 0,
                outline: 'none'
              }}
            />
          </div>

          {/* 4. Contractors Data Table */}
          <div 
            style={{ 
              background: 'var(--color-surface-card)', 
              border: '1px solid var(--color-border-subtle)', 
              borderRadius: '14px', 
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}
          >
            <div style={{ overflowX: 'auto', width: '100%', maxWidth: '100%', minWidth: 0, WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', minWidth: '940px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--color-surface-elevated)' }}>
                    <th style={{ padding: '10px 14px' }}>CONTRACTOR / VENDOR ENTITY</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>TOTAL WORKS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>TOTAL OUTLAY</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>COMPLETED</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>DELAYED (&gt;75D)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>ANOMALY RATE</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>AVG RISK</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContractors.map((c, idx) => (
                    <tr 
                      key={idx}
                      style={{ 
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedContractor(c)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Name */}
                      <td style={{ padding: '10px 14px' }}>
                        <div className="flex items-center gap-2">
                          <Building2 size={13} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
                          <strong style={{ fontSize: '12.5px', color: 'var(--color-text-primary)' }}>{c.contractor_name}</strong>
                        </div>
                      </td>

                      {/* Total Works */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {c.total_works}
                      </td>

                      {/* Outlay */}
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        ₹{c.total_sanctioned_amount_lakhs.toLocaleString('en-IN')} L
                      </td>

                      {/* Completed */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-normal-text)', fontWeight: 600 }}>
                        {c.completed_works}
                      </td>

                      {/* Delayed */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: c.delayed_works > 0 ? 'var(--color-high-text)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                        {c.delayed_works}
                      </td>

                      {/* Anomaly Rate */}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span 
                          style={{ 
                            fontSize: '9.5px', 
                            fontWeight: 800, 
                            padding: '2px 7px', 
                            borderRadius: '9999px',
                            background: c.anomaly_rate_pct > 15 ? 'var(--color-critical-bg)' : (c.anomaly_rate_pct > 0 ? 'var(--color-high-bg)' : 'var(--color-normal-bg)'),
                            color: c.anomaly_rate_pct > 15 ? 'var(--color-critical-text)' : (c.anomaly_rate_pct > 0 ? 'var(--color-high-text)' : 'var(--color-normal-text)'),
                            border: `1px solid ${c.anomaly_rate_pct > 15 ? 'var(--color-critical-border)' : (c.anomaly_rate_pct > 0 ? 'var(--color-high-border)' : 'var(--color-normal-border)')}`
                          }}
                        >
                          {c.anomaly_rate_pct}%
                        </span>
                      </td>

                      {/* Avg Risk */}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: 800, 
                            fontFamily: 'var(--font-mono)',
                            color: c.average_risk_score >= 70 ? 'var(--color-critical-text)' : (c.average_risk_score >= 40 ? 'var(--color-high-text)' : 'var(--color-normal-text)')
                          }}
                        >
                          {c.average_risk_score}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-accent-teal)', fontSize: '11px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContractor(c);
                          }}
                        >
                          <span>Portfolio</span>
                          <ArrowRight size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Interactive Contractor Portfolio Drawer / Modal */}
          {selectedContractor && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '20px'
              }}
              onClick={() => setSelectedContractor(null)}
            >
              <div
                style={{
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: '16px',
                  maxWidth: '750px',
                  width: '100%',
                  maxHeight: '85vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-frame)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface-elevated)' }}>
                  <div className="flex items-center gap-2">
                    <Building2 size={18} color="var(--color-accent-teal)" />
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                        {selectedContractor.contractor_name}
                      </h3>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        Portfolio: {selectedContractor.total_works} works • ₹{selectedContractor.total_sanctioned_amount_lakhs} Lakhs Allocation
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedContractor(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body: Linked Works List */}
                <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Linked Project Works ({selectedContractor.works?.length || 0})
                  </span>

                  {selectedContractor.works?.map((w, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-accent-teal)', fontWeight: 600 }}>
                            {w.work_id}
                          </span>
                          {w.is_ml_anomaly && (
                            <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: 'var(--color-critical-bg)', color: 'var(--color-critical-text)', border: '1px solid var(--color-critical-border)' }}>
                              ⚠ ANOMALY
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: 600, marginTop: '2px' }} className="truncate">
                          {w.title}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          Outlay: ₹{(w.sanctioned_amount_lakhs || 0).toFixed(2)}L • Risk Priority Score: <strong style={{ color: w.risk_priority_score >= 50 ? 'var(--color-critical-text)' : 'var(--color-high-text)' }}>{(w.risk_priority_score || 0).toFixed(1)}</strong>
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                        style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0 }}
                        onClick={() => {
                          setSelectedContractor(null);
                          navigate(`/project/${encodeURIComponent(w.work_id)}`);
                        }}
                      >
                        <span>Dossier</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
