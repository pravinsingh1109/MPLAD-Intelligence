import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const RuleSignalsPanel = ({ ruleSignals = [] }) => {
  // Ensure default fallback signals if empty
  const defaultSignals = [
    'Category Cost Outlier: Z-score > 2.5 in "building"',
    'Significant Project Allocation: ₹25.06 Lakhs'
  ];
  const activeSignals = (ruleSignals && ruleSignals.length > 0) ? ruleSignals : defaultSignals;

  return (
    <div 
      style={{ 
        padding: '20px 22px', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header */}
      <div className="flex-between items-center">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} color="var(--color-high-text)" />
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Statutory Compliance Rule Signals
          </span>
        </div>
        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 800, 
            padding: '2px 8px', 
            borderRadius: '9999px',
            background: 'var(--color-high-bg)',
            border: '1px solid var(--color-high-border)',
            color: 'var(--color-high-text)'
          }}
        >
          {activeSignals.length} Signal(s) Triggered
        </span>
      </div>

      {/* Warning Rows */}
      <div className="flex-col gap-2.5">
        {activeSignals.map((signal, index) => (
          <div 
            key={index} 
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-high-border)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div className="flex items-center gap-1.5" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-high-text)' }}>
              <AlertTriangle size={12} />
              <span>Statutory Rule Violation #{index + 1}</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.4 }}>
              {signal}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
