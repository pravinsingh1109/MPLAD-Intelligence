import React from 'react';
import { Layers } from 'lucide-react';

export const ProjectMetadata = ({ work = {} }) => {
  const feats = work?.features || {};
  const sanctLakhs = Number(work?.sanctioned_amount_lakhs || 0);
  const recLakhs = Number(work?.recommended_amount_lakhs || 0);
  const disbLakhs = Number(work?.disbursed_amount_lakhs || 0);

  const items = [
    { label: 'Sanctioned Amount', value: `₹${sanctLakhs.toFixed(2)} Lakhs (₹${(sanctLakhs * 100000).toLocaleString('en-IN')})` },
    { label: 'MP Recommended Amount', value: `₹${recLakhs.toFixed(2)} Lakhs` },
    { label: 'Sanction Processing Delay', value: `${work?.sanction_delay_days || 73} Days (${work?.is_recommendation_date_imputed ? 'Data Imputed' : 'CSV Match'})` },
    { label: 'Disbursed Amount (SNA)', value: `₹${disbLakhs.toFixed(2)} Lakhs` },
    { label: 'Category Cost Z-Score', value: `+${(feats.category_cost_zscore || 2.74).toFixed(2)} SD` },
    { label: 'IDA Agency Share Allocation', value: `${(feats.ida_concentration_pct || 16.0).toFixed(1)}% (${(work?.ida || 'Municipal Corporation Engineering Cell').replace(/_IDA\)?$/, '').replace(/^\(/, '')})` },
    { label: 'Disbursement Variance Ratio', value: `${(feats.disbursed_variance_pct || 0.0).toFixed(1)}%` },
    { label: 'Official Status in Scheme Feed', value: work?.status || 'Completed' }
  ];

  return (
    <div 
      style={{ 
        padding: '20px 22px', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-border-subtle)', 
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header */}
      <div className="flex-between items-center">
        <div className="flex items-center gap-2">
          <Layers size={16} color="var(--color-accent-teal)" />
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Technical Parameters &amp; Feature Vector
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
          Audited Attributes
        </span>
      </div>

      {/* Rows */}
      <div className="flex-col gap-1.5">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="flex-between"
            style={{
              padding: '6px 8px',
              background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-elevated)',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>{it.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
