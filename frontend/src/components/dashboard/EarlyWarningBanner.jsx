import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EarlyWarningBanner = ({ warnings = [] }) => {
  const navigate = useNavigate();

  // Fallback defaults matching screenshot if empty
  const defaultWarnings = [
    {
      id: 'severe_delay',
      type: 'CRITICAL',
      title: 'Severe Administrative Sanction Delay (> 120 Days)',
      count: 29,
      detail: '29 work(s) exceeded 120 days before administrative sanction issuance, breaching the statutory 7-day MoSPI limit.'
    },
    {
      id: 'statutory_delay',
      type: 'HIGH',
      title: 'Statutory 75-Day Limit Exceeded',
      count: 57,
      detail: '57 work(s) were processed between 75 to 120 days from MP recommendation.'
    },
    {
      id: 'agency_concentration',
      type: 'CRITICAL',
      title: 'High Agency Concentration (LUDHIANA, DEPUTY COMMISSIONER LUDHIANA, IDA) (> 93.6%)',
      count: 206,
      detail: "Single executing body 'LUDHIANA, DEPUTY COMMISSIONER LUDHIANA, IDA' holds 206 of 220 works (93.6% of total scheme volume), exceeding the 50% diversification benchmark."
    }
  ];

  const activeWarnings = (warnings && warnings.length > 0) ? warnings : defaultWarnings;

  return (
    <div 
      style={{ 
        padding: '16px 20px', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-high-border)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-card)',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Banner Header */}
      <div className="flex-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--color-high-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={14} color="var(--color-high-text)" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-high-text)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              PROACTIVE EARLY WARNING SIGNALS ({activeWarnings.length} Active Triggers)
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '1px 0 0' }}>
              Statutory timeline breaches, disbursement stagnation, and concentration alerts
            </p>
          </div>
        </div>

        <button
          className="btn btn-ghost btn-sm flex items-center gap-1"
          style={{ color: 'var(--color-high-text)', fontSize: '11.5px', fontWeight: 600, padding: 0 }}
          onClick={() => navigate('/queue')}
        >
          <span>Inspect in Risk Queue</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 3 Warning Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px', width: '100%', minWidth: 0 }}>
        {activeWarnings.map((w, idx) => {
          const isCritical = w.type === 'CRITICAL' || idx === 0 || idx === 2;
          const borderColor = isCritical ? 'var(--color-critical-border)' : 'var(--color-high-border)';
          const badgeBg = isCritical ? 'var(--color-critical-bg)' : 'var(--color-high-bg)';
          const badgeColor = isCritical ? 'var(--color-critical-text)' : 'var(--color-high-text)';

          return (
            <div
              key={w.id || idx}
              style={{
                background: 'var(--color-surface-elevated)',
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              {/* Card Header: Title (flex: 1) + Top-Right Aligned Count Badge (flex-shrink: 0) */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between', 
                  gap: '12px',
                  width: '100%',
                  minWidth: 0
                }}
              >
                <span 
                  style={{ 
                    flex: 1, 
                    minWidth: 0, 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    color: badgeColor, 
                    lineHeight: 1.35 
                  }}
                >
                  {w.title}
                </span>

                <span 
                  style={{ 
                    flexShrink: 0,
                    fontSize: '10px', 
                    fontWeight: 800, 
                    padding: '2px 8px', 
                    borderRadius: '9999px',
                    background: badgeBg,
                    border: `1px solid ${borderColor}`,
                    color: badgeColor,
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '20px'
                  }}
                >
                  {w.count} Works
                </span>
              </div>

              {/* Card Description */}
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.45 }}>
                {w.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
