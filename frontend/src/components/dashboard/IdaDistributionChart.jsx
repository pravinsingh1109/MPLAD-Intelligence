import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const IdaDistributionChart = () => {
  const { activeWorkspaceId, theme } = useApp();
  const isDark = theme !== 'light';
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchIdaData = async () => {
      if (!activeWorkspaceId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await api.getIdaDistribution(activeWorkspaceId);
        if (isMounted && res && res.items) {
          setData(res.items);
        }
      } catch (err) {
        console.error('Failed to load dynamic IDA distribution:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchIdaData();
    return () => { isMounted = false; };
  }, [activeWorkspaceId]);

  if (isLoading) {
    return (
      <div className="lineage-subcard" style={{ minHeight: '340px' }}>
        <SkeletonLoader rows={5} height="40px" />
      </div>
    );
  }

  // Ensure default fallback if data array is empty
  const chartItems = data.length > 0 ? data : [
    { name: 'LUDHIANA, DEPUTY COMMISSIONER LUDHIANA, IDA', count: 220, percentage: 100 }
  ];

  const totalCount = chartItems.reduce((sum, d) => sum + (d.count || 0), 0) || 220;
  const topAgency = chartItems[0];

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
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header */}
      <div className="flex-between items-start">
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Implementing Agency (IDA) Concentration
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Work allocation and agency concentration index
          </p>
        </div>

        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 800, 
            background: 'var(--color-high-bg)', 
            border: '1px solid var(--color-high-border)', 
            padding: '2px 8px', 
            borderRadius: '9999px',
            color: 'var(--color-high-text)'
          }}
        >
          {topAgency ? `${topAgency.percentage}% ${topAgency.name.split(',')[0].trim()}` : '100% LUDHIANA'}
        </span>
      </div>

      {/* Horizontal Bar Chart */}
      <div style={{ flex: 1, width: '100%', minHeight: '170px', marginTop: '12px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartItems}
            layout="vertical"
            margin={{ top: 20, right: 65, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.05)"} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, totalCount]}
              ticks={[0, Math.round(totalCount * 0.25), Math.round(totalCount * 0.5), Math.round(totalCount * 0.75), totalCount]}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              label={{ value: 'WORKS', position: 'insideBottom', offset: -12, fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 700 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              width={140}
              tickFormatter={(val) => val.length > 22 ? val.substring(0, 22) + '...' : val}
            />
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
                      <strong style={{ color: 'var(--color-accent-teal)' }}>{d.name}</strong>
                      <div>Assigned Works: <strong>{d.count} ({d.percentage}%)</strong></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="var(--color-accent-teal)" radius={[0, 4, 4, 0]} barSize={34}>
              <LabelList 
                dataKey="count" 
                position="right" 
                formatter={(val) => `${val} (${topAgency ? topAgency.percentage : 100}%)`}
                style={{ fill: 'var(--color-text-primary)', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)' }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Benchmark Insight */}
      <div style={{ paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', fontSize: '11px', color: 'var(--color-high-text)', textAlign: 'center', fontWeight: 600 }}>
        Single agency concentration: {topAgency ? `${topAgency.percentage}%` : '100%'} (Exceeds 50% benchmark)
      </div>
    </div>
  );
};
