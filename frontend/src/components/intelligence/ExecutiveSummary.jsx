import React from 'react';
import { FileText, Cpu } from 'lucide-react';

export const ExecutiveSummary = ({ explanation }) => {
  const narrative = explanation?.executive_summary || 'Project M-PUN-2024-1482 is classified as CRITICAL RISK PRIORITY (S_risk = 77.4/100). Isolation Forest model identified an anomaly intensity score of 95.7/100 due to multivariate feature isolation. The statutory rule engine triggered 2 compliance signal(s) giving S_rule = 50.8/100.';

  return (
    <div 
      style={{ 
        padding: '20px 22px', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-border-subtle)', 
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-card)',
        height: '100%',
        justifyContent: 'space-between'
      }}
    >
      {/* Header */}
      <div className="flex-between items-center">
        <div className="flex items-center gap-2">
          <FileText size={16} color="var(--color-accent-teal)" />
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Executive Intelligence Narrative
          </span>
        </div>
        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 700, 
            padding: '2px 8px', 
            borderRadius: '9999px',
            background: 'var(--color-accent-teal-glow)',
            border: '1px solid var(--color-border-accent)',
            color: 'var(--color-accent-teal)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Cpu size={10} />
          <span>AI/ML Model Engine</span>
        </span>
      </div>

      {/* Briefing Text Container with Cyan Border */}
      <div
        style={{
          background: 'var(--color-surface-elevated)',
          borderLeft: '3px solid var(--color-accent-teal)',
          borderTop: '1px solid var(--color-border-subtle)',
          borderRight: '1px solid var(--color-border-subtle)',
          borderBottom: '1px solid var(--color-border-subtle)',
          borderRadius: '8px',
          padding: '16px 18px',
          fontSize: '12.5px',
          lineHeight: '1.7',
          color: 'var(--color-text-secondary)'
        }}
      >
        {narrative}
      </div>
    </div>
  );
};
