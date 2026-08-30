import React from 'react';
import { Info } from 'lucide-react';

export const DataNoticeBanner = ({ totalSanctioned, totalRecommended, totalCompleted, outlayCr }) => {
  return (
    <div 
      style={{ 
        padding: '10px 18px', 
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-accent)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div 
        style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          background: 'var(--color-accent-teal-glow)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0 
        }}
      >
        <Info size={14} color="var(--color-accent-teal)" />
      </div>
      <div style={{ flex: 1, fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
        <strong style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>Empirically Audited Dataset: </strong>
        <span>
          {totalSanctioned || 220} Sanctioned Works {outlayCr ? `(₹${outlayCr} Cr Outlay)` : '(₹8.52 Cr Outlay)'} • {totalRecommended || 242} MP Recommendations • ML Engine: 100 Trees Isolation Forest • 5 Statutory Rules
        </span>
      </div>
    </div>
  );
};
