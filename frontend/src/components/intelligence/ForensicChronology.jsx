import React from 'react';
import { History, Check } from 'lucide-react';

export const ForensicChronology = ({ work = {} }) => {
  const delayDays = work?.sanction_delay_days || 73;
  const isImputed = work?.is_recommendation_date_imputed;
  const sanctLakhs = Number(work?.sanctioned_amount_lakhs || 0);

  const steps = [
    {
      title: 'MP Recommendation Recorded',
      detail: `Hon'ble MP recommended work in Constituency. (${isImputed ? 'Estimated Baseline' : 'e-SAKSHI Ingested'})`,
      status: 'VERIFIED'
    },
    {
      title: 'Administrative Sanction Issued',
      detail: `District Authority issued AS after ${delayDays} days of administrative processing.`,
      status: delayDays > 75 ? 'BREACHED (75D)' : 'COMPLIANT'
    },
    {
      title: 'Executing Agency Fund Allocation',
      detail: `100% allocation (₹${sanctLakhs.toFixed(2)} Lakhs) assigned to ${work?.district || 'District'} IDA.`,
      status: 'DISBURSED'
    },
    {
      title: 'Physical Completion & UC Verification',
      detail: 'Final Completion Certificate (CC) & Utilization Certificate (UC) verified.',
      status: 'VERIFIED'
    }
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
        gap: '16px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header */}
      <div className="flex-between items-center">
        <div className="flex items-center gap-2">
          <History size={16} color="var(--color-accent-teal)" />
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Forensic Administrative Chronology
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
          Lifecycle Milestones
        </span>
      </div>

      {/* Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
        {steps.map((step, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Timeline Green Node */}
            <div 
              style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                background: 'var(--color-normal-text)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}
            >
              <Check size={11} color="#ffffff" strokeWidth={3.5} />
            </div>

            {/* Timeline Details */}
            <div style={{ flex: 1 }}>
              <div className="flex-between items-center">
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {step.title}
                </span>
                <span 
                  style={{ 
                    fontSize: '9.5px', 
                    fontWeight: 800, 
                    padding: '2px 7px', 
                    borderRadius: '4px',
                    background: step.status.includes('BREACH') ? 'var(--color-high-bg)' : 'var(--color-normal-bg)',
                    border: `1px solid ${step.status.includes('BREACH') ? 'var(--color-high-border)' : 'var(--color-normal-border)'}`,
                    color: step.status.includes('BREACH') ? 'var(--color-high-text)' : 'var(--color-normal-text)'
                  }}
                >
                  {step.status}
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', margin: '2px 0 0', lineHeight: 1.4 }}>
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
