import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { useApp } from '../../context/AppContext';

export const RiskDistributionChart = ({ kpis, isLoading }) => {
  const { theme } = useApp();
  const isDark = theme !== 'light';

  if (isLoading || !kpis) {
    return (
      <div className="lineage-subcard" style={{ minHeight: '340px', width: '100%', minWidth: 0 }}>
        <SkeletonLoader rows={5} height="40px" />
      </div>
    );
  }

  const criticalCount = kpis.critical_risk_count || 0;
  const highCount = kpis.high_risk_count || 5;
  const mediumCount = kpis.medium_risk_count || 11;
  const normalCount = kpis.normal_risk_count || (kpis.total_sanctioned_works ? (kpis.total_sanctioned_works - criticalCount - highCount - mediumCount) : 204);

  const total = (criticalCount + highCount + mediumCount + normalCount) || kpis.total_sanctioned_works || 220;
  const totalOutlay = kpis.total_sanctioned_amount_cr || 8.52;

  const normalPct = ((normalCount / total) * 100).toFixed(1);
  const medPct = ((mediumCount / total) * 100).toFixed(1);
  const highPct = ((highCount / total) * 100).toFixed(1);
  const critPct = ((criticalCount / total) * 100).toFixed(1);

  // Proportional estimated outlay breakdown
  const normalVal = ((normalCount / total) * totalOutlay).toFixed(2);
  const medVal = ((mediumCount / total) * totalOutlay).toFixed(2);
  const highVal = ((highCount / total) * totalOutlay).toFixed(2);
  const critVal = ((criticalCount / total) * totalOutlay).toFixed(2);

  const tableRows = [
    { label: 'Normal (0 - 50)', count: normalCount, pct: normalPct, val: `₹${normalVal} Cr`, color: isDark ? '#10b981' : '#059669' },
    { label: 'Medium (50 - 70)', count: mediumCount, pct: medPct, val: `₹${medVal} Cr`, color: isDark ? '#eab308' : '#d97706' },
    { label: 'High (70 - 90)', count: highCount, pct: highPct, val: `₹${highVal} Cr`, color: isDark ? '#f59e0b' : '#ea580c' },
    { label: 'Critical (90 - 100)', count: criticalCount, pct: critPct, val: `₹${critVal} Cr`, color: isDark ? '#ef4444' : '#dc2626' }
  ];

  const pieData = tableRows.map(r => ({
    name: r.label,
    value: r.count,
    color: r.color,
    pct: r.pct
  })).filter(r => r.value > 0);

  return (
    <div 
      className="lineage-subcard" 
      style={{ 
        padding: '20px 22px', 
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        minHeight: '340px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header */}
      <div className="flex-between items-start flex-wrap gap-2">
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Risk Priority Score Distribution
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Categorization by composite severity band
          </p>
        </div>
        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 700, 
            background: 'var(--color-surface-elevated)', 
            border: '1px solid var(--color-border-subtle)', 
            padding: '2px 8px', 
            borderRadius: '9999px',
            color: 'var(--color-text-secondary)',
            flexShrink: 0
          }}
        >
          {total} Works Total
        </span>
      </div>

      {/* Center Layout: Donut + Structured Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, 160px) minmax(0, 1fr)', gap: '16px', alignItems: 'center', margin: '14px 0', width: '100%', minWidth: 0 }}>
        {/* Left: Donut Chart with Center Label */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '150px', height: '150px', margin: '0 auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke={isDark ? '#11141e' : '#ffffff'}
                strokeWidth={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div
                        style={{
                          background: 'var(--color-surface-card)',
                          border: '1px solid var(--color-border-strong)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          color: 'var(--color-text-primary)',
                          fontSize: '11.5px',
                          boxShadow: 'var(--shadow-card)'
                        }}
                      >
                        <strong style={{ color: d.color }}>{d.name}</strong>
                        <div>{d.value} works ({d.pct}%)</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Overlay */}
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {normalPct}%
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 500 }}>
              Normal
            </span>
          </div>
        </div>

        {/* Right: Structured Table / Legend */}
        <div className="flex-col gap-2" style={{ width: '100%', minWidth: 0 }}>
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 32px minmax(0, 1fr) minmax(0, 60px)', fontSize: '9px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px', borderBottom: '1px solid var(--color-border-subtle)', minWidth: 0 }}>
            <span>RISK BAND</span>
            <span style={{ textAlign: 'right' }}>WORKS</span>
            <span style={{ textAlign: 'center' }}>PERCENTAGE</span>
            <span style={{ textAlign: 'right' }}>VALUE (₹)</span>
          </div>

          {/* Table Rows */}
          {tableRows.map((r) => (
            <div 
              key={r.label}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'minmax(0, 1.2fr) 32px minmax(0, 1fr) minmax(0, 60px)', 
                alignItems: 'center', 
                fontSize: '11px',
                padding: '3px 0',
                minWidth: 0
              }}
            >
              <div className="flex items-center gap-1.5 truncate" style={{ minWidth: 0 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }} className="truncate">{r.label}</span>
              </div>

              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                {r.count}
              </span>

              <div style={{ padding: '0 6px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                  <div style={{ flex: 1, height: '4px', background: 'var(--color-surface-elevated)', borderRadius: '9999px', overflow: 'hidden', minWidth: '20px' }}>
                    <div style={{ width: `${Math.min(parseFloat(r.pct), 100)}%`, height: '100%', background: r.color, borderRadius: '9999px' }} />
                  </div>
                  <span style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {r.pct}%
                  </span>
                </div>
              </div>

              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '10.5px' }}>
                {r.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Formula */}
      <div style={{ paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', fontSize: '10.5px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
        Composite Risk Score = (0.60 × S_ml) + (0.40 × S_rule) × 100
      </div>
    </div>
  );
};
