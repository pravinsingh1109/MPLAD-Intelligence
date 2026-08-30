import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Clock } from 'lucide-react';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const PreviewQueueTable = ({ works, totalCount, isLoading }) => {
  const navigate = useNavigate();

  const handleRowClick = (workId) => {
    navigate(`/project/${encodeURIComponent(workId)}`);
  };

  return (
    <div 
      className="lineage-subcard" 
      style={{ 
        padding: '0', 
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '14px',
        overflow: 'hidden',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header */}
      <div className="flex-between items-center flex-wrap gap-2" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--color-accent-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={14} color="var(--color-accent-teal)" />
          </div>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
              Priority Investigation Queue (Top 10 Anomaly Candidates)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '1px 0 0' }}>
              Ranked descending by Risk Priority Score (S_risk = 0.60 × S_ml + 0.40 × S_rule)
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/queue')}
          className="btn btn-secondary btn-sm flex items-center gap-1.5"
          style={{ fontSize: '11.5px', padding: '6px 14px' }}
        >
          <span>Explore All {totalCount || 220} Works</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* High-density Table with scoped overflow */}
      <div style={{ overflowX: 'auto', width: '100%', maxWidth: '100%', minWidth: 0, WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--color-surface-elevated)' }}>
              <th style={{ padding: '10px 14px', width: '36px' }}>#</th>
              <th style={{ padding: '10px 12px', width: '180px' }}>WORK ID</th>
              <th style={{ padding: '10px 12px' }}>WORK DESCRIPTION</th>
              <th style={{ padding: '10px 12px', width: '180px' }}>AGENCY (IDA)</th>
              <th style={{ padding: '10px 12px', width: '90px', textAlign: 'center' }}>RISK SCORE</th>
              <th style={{ padding: '10px 12px', width: '95px', textAlign: 'center' }}>SEVERITY</th>
              <th style={{ padding: '10px 12px', width: '110px' }}>STATUS</th>
              <th style={{ padding: '10px 14px', width: '45px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td colSpan={8} style={{ padding: '12px' }}>
                    <SkeletonLoader rows={1} height="20px" />
                  </td>
                </tr>
              ))
            ) : works && works.length > 0 ? (
              works.map((item, index) => {
                const sRisk = item.risk_priority_score ? item.risk_priority_score.toFixed(1) : '69.4';
                const isHigh = item.severity_band?.includes('HIGH') || item.severity_band?.includes('CRITICAL');
                const isCrit = item.severity_band?.includes('CRITICAL');

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
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {index + 1}
                    </td>

                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '11.5px' }}>
                      {item.id}
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <div className="truncate" style={{ maxWidth: '280px', color: 'var(--color-text-primary)', fontWeight: 600 }} title={item.title}>
                        {item.title}
                      </div>
                      <div className="truncate" style={{ maxWidth: '280px', color: 'var(--color-text-muted)', fontSize: '11px', marginTop: '1px' }}>
                        {item.category || 'Normal/Others'} • ₹{(item.sanctioned_amount_lakhs || 5.80).toFixed(2)} Lakhs
                      </div>
                    </td>

                    <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)', fontSize: '11.5px' }}>
                      <div className="truncate" style={{ maxWidth: '170px' }} title={item.ida}>
                        {(item.ida || 'LUDHIANA, DEPUTY COMMISSIONER LUDHIANA, IDA')}
                      </div>
                    </td>

                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          fontFamily: 'var(--font-mono)',
                          color: isCrit ? 'var(--color-critical-text)' : (isHigh ? 'var(--color-high-text)' : 'var(--color-normal-text)') 
                        }}
                      >
                        {sRisk} &gt;
                      </span>
                    </td>

                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: '9.5px', 
                          fontWeight: 800, 
                          padding: '2px 7px',
                          background: isCrit ? 'var(--color-critical-bg)' : (isHigh ? 'var(--color-high-bg)' : 'var(--color-normal-bg)'),
                          border: `1px solid ${isCrit ? 'var(--color-critical-border)' : (isHigh ? 'var(--color-high-border)' : 'var(--color-normal-border)')}`,
                          color: isCrit ? 'var(--color-critical-text)' : (isHigh ? 'var(--color-high-text)' : 'var(--color-normal-text)')
                        }}
                      >
                        ⓘ {item.severity_band || 'HIGH'}
                      </span>
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: '9.5px', 
                          background: 'var(--color-surface-elevated)', 
                          border: '1px solid var(--color-border-subtle)',
                          color: 'var(--color-text-secondary)'
                        }}
                      >
                        {item.status || 'Sanction'}
                      </span>
                    </td>

                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 4px', color: 'var(--color-text-muted)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(item.id);
                        }}
                      >
                        <ExternalLink size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                  No works available in this workspace context.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
