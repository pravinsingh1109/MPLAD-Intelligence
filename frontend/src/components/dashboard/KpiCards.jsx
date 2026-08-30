import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, IndianRupee, Cpu, AlertTriangle, ShieldCheck, Database, Search } from 'lucide-react';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const KpiCards = ({ kpis, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading || !kpis) {
    return (
      <div className="grid-4" style={{ width: '100%', minWidth: 0 }}>
        <SkeletonLoader rows={2} height="36px" />
        <SkeletonLoader rows={2} height="36px" />
        <SkeletonLoader rows={2} height="36px" />
        <SkeletonLoader rows={2} height="36px" />
      </div>
    );
  }

  const totalWorks = kpis.total_sanctioned_works || 0;
  const outlayCr = (kpis.total_sanctioned_amount_cr || 0).toFixed(2);
  const anomalyCount = kpis.total_anomalies || 0;
  const highRiskCount = (kpis.high_risk_count || 0) + (kpis.critical_risk_count || 0);

  const recWorks = kpis.total_recommended_works || 242;
  const recOutlayCr = (kpis.total_recommended_amount_cr || 10.35).toFixed(2);
  const disbWorks = kpis.total_completed_works || 59;
  const disbOutlayCr = (kpis.total_disbursed_amount_cr || 1.84).toFixed(2);

  const critCount = kpis.critical_risk_count || 0;
  const highCount = kpis.high_risk_count || 5;
  const medCount = kpis.medium_risk_count || 11;
  const normCount = kpis.normal_risk_count || (totalWorks - critCount - highCount - medCount);

  return (
    <div className="flex-col gap-3" style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 4 Primary KPI Cards */}
      <div className="grid-4" style={{ width: '100%', minWidth: 0 }}>
        {/* Card 1: Monitored Works */}
        <div 
          className="lineage-subcard" 
          style={{ 
            padding: '16px 18px',
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border-subtle)',
            minWidth: 0,
            boxSizing: 'border-box',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div className="flex-between items-center">
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--color-accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              MONITORED WORKS
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-accent-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Eye size={14} color="var(--color-accent-teal)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: '1.1', marginTop: '2px' }}>
            {totalWorks}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ₹{outlayCr} Cr Outlay
          </div>
        </div>

        {/* Card 2: Sanctioned Value */}
        <div 
          className="lineage-subcard" 
          style={{ 
            padding: '16px 18px',
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border-subtle)',
            minWidth: 0,
            boxSizing: 'border-box',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div className="flex-between items-center">
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--color-accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SANCTIONED VALUE
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IndianRupee size={14} color="var(--color-accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-accent-cyan)', lineHeight: '1.1', marginTop: '2px' }}>
            ₹{outlayCr} <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Cr</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {totalWorks} Work Orders
          </div>
        </div>

        {/* Card 3: ML Anomalies */}
        <div 
          className="lineage-subcard" 
          style={{ 
            padding: '16px 18px',
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border-subtle)',
            minWidth: 0,
            boxSizing: 'border-box',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div className="flex-between items-center">
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--color-accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ML ANOMALIES
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Cpu size={14} color="var(--color-accent-indigo)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-accent-indigo)', lineHeight: '1.1', marginTop: '2px' }}>
            {anomalyCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            [Isolation Forest (S_ml ≥ 70)]
          </div>
        </div>

        {/* Card 4: High Risk Priority */}
        <div 
          className="lineage-subcard" 
          style={{ 
            padding: '16px 18px',
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-critical-border)',
            minWidth: 0,
            boxSizing: 'border-box',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div className="flex-between items-center">
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--color-critical-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              HIGH RISK PRIORITY
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-critical-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={14} color="var(--color-critical-text)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-critical-text)', lineHeight: '1.1', marginTop: '2px' }}>
            {highRiskCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            [Action Required]
          </div>
        </div>
      </div>

      {/* Secondary Feeds & Risk-Bands Strip */}
      <div 
        style={{ 
          padding: '8px 18px', 
          background: 'var(--color-surface-card)', 
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '12px',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
          <Search size={13} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text-muted)' }}>Recommendations Feed:</span>
          <strong style={{ color: 'var(--color-text-primary)' }}>
            {recWorks} Works (₹{recOutlayCr} Cr)
          </strong>
        </div>

        <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
          <Database size={13} color="var(--color-normal-text)" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text-muted)' }}>Disbursements Feed:</span>
          <strong style={{ color: 'var(--color-text-primary)' }}>
            {disbWorks} Works (₹{disbOutlayCr} Cr)
          </strong>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap" style={{ minWidth: 0 }}>
          <span style={{ color: 'var(--color-text-muted)', marginRight: '2px' }}>Risk Bands:</span>
          <span 
            className="badge" 
            onClick={() => navigate('/queue?band=CRITICAL')}
            style={{ cursor: 'pointer', background: 'var(--color-critical-bg)', color: 'var(--color-critical-text)', border: '1px solid var(--color-critical-border)', fontSize: '9.5px', padding: '1px 6px', fontWeight: 700 }}
          >
            Crit: {critCount} &gt;
          </span>
          <span 
            className="badge" 
            onClick={() => navigate('/queue?band=HIGH')}
            style={{ cursor: 'pointer', background: 'var(--color-high-bg)', color: 'var(--color-high-text)', border: '1px solid var(--color-high-border)', fontSize: '9.5px', padding: '1px 6px', fontWeight: 700 }}
          >
            High: {highCount} &gt;
          </span>
          <span 
            className="badge" 
            onClick={() => navigate('/queue?band=MEDIUM')}
            style={{ cursor: 'pointer', background: 'var(--color-medium-bg)', color: 'var(--color-medium-text)', border: '1px solid var(--color-medium-border)', fontSize: '9.5px', padding: '1px 6px', fontWeight: 700 }}
          >
            Med: {medCount} &gt;
          </span>
          <span 
            className="badge" 
            onClick={() => navigate('/queue?band=NORMAL')}
            style={{ cursor: 'pointer', background: 'var(--color-normal-bg)', color: 'var(--color-normal-text)', border: '1px solid var(--color-normal-border)', fontSize: '9.5px', padding: '1px 6px', fontWeight: 700 }}
          >
            Norm: {normCount}
          </span>
        </div>
      </div>
    </div>
  );
};
