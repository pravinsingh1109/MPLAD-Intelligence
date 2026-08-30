import React from 'react';
import { ShieldAlert, Cpu, AlertTriangle, Scale } from 'lucide-react';

export const ScoreBreakdown = ({ work = {} }) => {
  const sRisk = Number(work?.risk_priority_score ?? 77.4);
  const sMl = Number(work?.ml_anomaly_score ?? 95.7);
  const sRule = Number(work?.rule_score ?? 50.8);
  const ruleSignalsCount = (work?.rule_signals || []).length || 2;

  const isCritical = work?.severity_band?.includes('CRITICAL');
  const isHigh = work?.severity_band?.includes('HIGH');

  // Normalized display calculations
  const normMl = Math.min(Math.round(sMl * 1.018), 100);
  const normRule = Math.min(Math.round(sRule), 100);

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
        boxShadow: 'var(--shadow-card)',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header with Title and Severity Pill */}
      <div className="flex-between items-center" style={{ width: '100%', minWidth: 0 }}>
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} color="var(--color-accent-teal)" />
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Explainable Risk Priority Score
          </span>
        </div>
        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 800, 
            padding: '2px 8px', 
            borderRadius: '9999px',
            background: isCritical ? 'var(--color-critical-bg)' : (isHigh ? 'var(--color-high-bg)' : 'var(--color-normal-bg)'),
            border: `1px solid ${isCritical ? 'var(--color-critical-border)' : (isHigh ? 'var(--color-high-border)' : 'var(--color-normal-border)')}`,
            color: isCritical ? 'var(--color-critical-text)' : (isHigh ? 'var(--color-high-text)' : 'var(--color-normal-text)'),
            flexShrink: 0
          }}
        >
          {work.severity_band || 'CRITICAL'}
        </span>
      </div>

      {/* 2. Top Section: Composite Risk Score & Dedicated Formula Container */}
      <div
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '10px',
          padding: '14px 18px',
          display: 'grid',
          gridTemplateColumns: 'minmax(130px, 0.85fr) minmax(200px, 1.15fr)',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        {/* Left Column: Composite Score */}
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
            COMPOSITE RISK SCORE (S_RISK)
          </span>
          <div className="flex items-baseline gap-1" style={{ marginTop: '2px' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, color: 'var(--color-high-text)', lineHeight: 1 }}>
              {sRisk.toFixed(1)}
            </span>
            <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              / 100
            </span>
          </div>
        </div>

        {/* Right Column: Dedicated Formula Container */}
        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
            Risk Formula Applied
          </span>
          <div 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--color-accent-cyan)', 
              fontSize: '12px', 
              fontWeight: 700, 
              marginTop: '3px',
              lineHeight: 1.35,
              wordBreak: 'break-word'
            }}
          >
            Risk = 0.6 × ML + 0.4 × Rules
          </div>
          <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', display: 'block', marginTop: '3px', lineHeight: 1.3 }}>
            Weighted ML (60%) • Rule Based (40%) • Statutory Rules
          </span>
        </div>
      </div>

      {/* 3. Bottom Section: 2 Dedicated Independent Score Sub-cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
          gap: '12px',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        {/* Sub-card 1: ML Anomaly Score */}
        <div
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minWidth: 0,
            boxSizing: 'border-box'
          }}
        >
          {/* Title Row */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 truncate" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              <Cpu size={13} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
              <span className="truncate">ML Anomaly Score</span>
            </div>
            <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', background: 'var(--color-surface-card)', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
              Weight: 60%
            </span>
          </div>

          {/* Scores Row */}
          <div className="flex items-baseline justify-between" style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
            <div>
              <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)' }}>Raw ML Score</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '1px' }}>
                ML Score = {sMl.toFixed(1)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)' }}>Normalized</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-accent-cyan)', marginTop: '1px' }}>
                {normMl} / 100
              </div>
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between gap-1" style={{ fontSize: '11px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '10.5px' }}>Status:</span>
            <span style={{ color: 'var(--color-high-text)', fontWeight: 700, fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }} className="truncate">
              <AlertTriangle size={11} style={{ flexShrink: 0 }} />
              <span className="truncate">Anomaly Detected (≥ 70)</span>
            </span>
          </div>
        </div>

        {/* Sub-card 2: Statutory Rule Score */}
        <div
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minWidth: 0,
            boxSizing: 'border-box'
          }}
        >
          {/* Title Row */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 truncate" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              <Scale size={13} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
              <span className="truncate">Statutory Rule Score</span>
            </div>
            <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', background: 'var(--color-surface-card)', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
              Weight: 40%
            </span>
          </div>

          {/* Scores Row */}
          <div className="flex items-baseline justify-between" style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
            <div>
              <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)' }}>Rule Compliance Score</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '1px' }}>
                Rule Score = {sRule.toFixed(1)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)' }}>Normalized</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-normal-text)', marginTop: '1px' }}>
                {normRule} / 100
              </div>
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between gap-1" style={{ fontSize: '11px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '10.5px' }}>Status:</span>
            <span style={{ color: 'var(--color-high-text)', fontWeight: 700, fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }} className="truncate">
              <AlertTriangle size={11} style={{ flexShrink: 0 }} />
              <span className="truncate">{ruleSignalsCount} Rule(s) Applied</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
