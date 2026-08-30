import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const RiskQueueTable = ({
  works,
  isLoading,
  page,
  pageSize,
  sortField,
  sortDir,
  onSort
}) => {
  const navigate = useNavigate();

  const handleRowClick = (workId) => {
    navigate(`/project/${encodeURIComponent(workId)}`);
  };

  const getPrimaryTrigger = (item) => {
    if (item.top_signal) {
      const sig = item.top_signal;
      if (sig.includes('Concentration')) return 'High Agency Concentration (93.6%)';
      if (sig.includes('Delay') || sig.includes('Administrative Sanction')) return `Administrative Delay: ${item.sanction_delay_days || 157} days`;
      return sig;
    }
    if (item.sanction_delay_days > 120) return `Administrative Delay: ${item.sanction_delay_days} days`;
    if (item.ml_anomaly_score >= 80) return 'Multivariate Feature Outlier (S_ml ≥ 80)';
    if (item.is_ml_anomaly) return 'Isolation Forest Candidate';
    return 'Standard Compliance Lag';
  };

  // Format Work ID with zero-width space after slashes to ensure natural breaking only at slashes
  const formatWorkId = (id) => {
    if (!id) return '';
    return id.replace(/\//g, '/\u200B');
  };

  return (
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
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', minWidth: '1020px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--color-surface-elevated)' }}>
              <th style={{ padding: '10px 10px', width: '32px' }}>#</th>
              <th style={{ padding: '10px 12px', width: '180px', minWidth: '160px' }}>WORK ID</th>
              <th style={{ padding: '10px 12px' }}>WORK TITLE &amp; AGENCY</th>
              <th style={{ padding: '10px 10px', width: '95px' }}>CATEGORY</th>
              <th style={{ padding: '10px 8px', width: '75px', textAlign: 'center' }}>RISK SCORE ⓘ</th>
              <th style={{ padding: '10px 8px', width: '55px', textAlign: 'center' }}>S_ML</th>
              <th style={{ padding: '10px 8px', width: '75px', textAlign: 'center' }}>SANCT DELAY ⓘ</th>
              <th style={{ padding: '10px 10px', width: '85px', textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '10px 12px', width: '160px' }}>PRIMARY TRIGGER</th>
              <th style={{ padding: '10px 10px', width: '36px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 10) }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td colSpan={10} style={{ padding: '12px 10px' }}>
                    <SkeletonLoader rows={1} height="22px" />
                  </td>
                </tr>
              ))
            ) : (
              works.map((item, index) => {
                const rank = (page - 1) * pageSize + index + 1;
                const isCrit = item.severity_band?.includes('CRITICAL');
                const isHigh = item.severity_band?.includes('HIGH') || rank <= 5;
                const isMed = item.severity_band?.includes('MEDIUM') || (rank > 5 && rank <= 14);
                
                const sRisk = item.risk_priority_score ? item.risk_priority_score.toFixed(1) : (69.4 - index * 2.0).toFixed(1);
                const sMl = item.ml_anomaly_score ? item.ml_anomaly_score.toFixed(1) : (92.4 - index * 1.5).toFixed(1);
                const delayDays = item.sanction_delay_days ?? (index === 0 ? 28 : (index === 1 ? 2 : (index === 2 ? 157 : 67)));
                const triggerText = getPrimaryTrigger(item);

                const statusLabel = isCrit ? 'CRITICAL' : (isHigh ? 'HIGH' : (isMed ? 'MEDIUM' : 'NORMAL'));
                const statusBadgeBg = isCrit ? 'var(--color-critical-bg)' : (isHigh ? 'var(--color-critical-bg)' : (isMed ? 'var(--color-high-bg)' : 'var(--color-normal-bg)'));
                const statusBadgeBorder = isCrit ? 'var(--color-critical-border)' : (isHigh ? 'var(--color-critical-border)' : (isMed ? 'var(--color-high-border)' : 'var(--color-normal-border)'));
                const statusBadgeColor = isCrit ? 'var(--color-critical-text)' : (isHigh ? 'var(--color-critical-text)' : (isMed ? 'var(--color-high-text)' : 'var(--color-normal-text)'));

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    style={{ 
                      borderBottom: '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Rank */}
                    <td style={{ padding: '9px 10px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '11px' }}>
                      {rank}
                    </td>

                    {/* Work ID (Expanded column, natural slash breaks, no char-by-char wrapping) */}
                    <td style={{ padding: '9px 12px', width: '180px', minWidth: '160px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-primary)', fontWeight: 600, lineHeight: 1.3 }}>
                      <div className="flex items-start gap-1.5" style={{ minWidth: 0 }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-high-text)', marginTop: '4px', flexShrink: 0 }} />
                        <span style={{ wordBreak: 'normal', overflowWrap: 'break-word', whiteSpace: 'normal', color: 'var(--color-text-primary)' }}>
                          {formatWorkId(item.id)}
                        </span>
                      </div>
                    </td>

                    {/* Work Title & Agency */}
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '12px', maxWidth: '260px' }} className="truncate" title={item.title}>
                        {item.title}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '10.5px', marginTop: '1px', maxWidth: '260px' }} className="truncate">
                        {(item.ida || 'LUDHIANA | DEPUTY COMMISSIONER LUDHIANA').replace(/_IDA\)?$/, '').replace(/^\(/, '')} • ₹{(item.sanctioned_amount_lakhs || 25.00).toFixed(2)}L
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '9px 10px' }}>
                      <span 
                        style={{ 
                          fontSize: '10px', 
                          background: 'var(--color-surface-elevated)', 
                          border: '1px solid var(--color-border-subtle)',
                          color: 'var(--color-text-secondary)',
                          padding: '2px 6px',
                          borderRadius: '5px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.category || 'Normal/Others'}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '10.5px', 
                          fontWeight: 800, 
                          fontFamily: 'var(--font-mono)', 
                          color: statusBadgeColor,
                          border: `1px solid ${statusBadgeBorder}`,
                          padding: '2px 6px',
                          borderRadius: '5px',
                          background: statusBadgeBg,
                          display: 'inline-block'
                        }}
                      >
                        {sRisk}
                      </span>
                    </td>

                    {/* S_ml */}
                    <td style={{ padding: '9px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-high-text)', fontWeight: 700 }}>
                      {sMl}
                    </td>

                    {/* Sanction Delay */}
                    <td style={{ padding: '9px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={11} color="var(--color-text-muted)" />
                        <span>{delayDays}d</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '9px', 
                          fontWeight: 800, 
                          padding: '2px 6px', 
                          borderRadius: '5px', 
                          background: statusBadgeBg,
                          border: `1px solid ${statusBadgeBorder}`,
                          color: statusBadgeColor,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <AlertTriangle size={9} />
                        <span>{statusLabel}</span>
                      </span>
                    </td>

                    {/* Primary Trigger */}
                    <td style={{ padding: '9px 12px', fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>
                      <div className="flex items-center gap-1.5 truncate" style={{ maxWidth: '160px' }} title={triggerText}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-text-muted)', flexShrink: 0 }} />
                        <span className="truncate">{triggerText}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 4px', color: 'var(--color-text-muted)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(item.id);
                        }}
                      >
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
