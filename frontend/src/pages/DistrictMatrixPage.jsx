import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { ErrorCard } from '../components/common/ErrorCard';
import { Grid, Building2, MapPin, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const DistrictMatrixPage = () => {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useApp();

  const [matrixData, setMatrixData] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const loadMatrix = useCallback(async () => {
    if (!activeWorkspaceId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getDistrictMatrix(activeWorkspaceId);
      setMatrixData(res);
    } catch (err) {
      console.error('Failed to load district matrix:', err);
      setError(err.message || 'Error loading district & IDA concentration matrix.');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  if (!activeWorkspaceId) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', border: '1px solid var(--color-border-strong)' }}>
          <Grid size={26} color="var(--color-accent-teal)" />
        </div>
        <h2 className="text-heading-2" style={{ marginBottom: 'var(--space-2)' }}>No Active Workspace Selected</h2>
        <p className="text-body-secondary" style={{ marginBottom: 'var(--space-6)' }}>
          Select or load an active workspace to view the District &amp; IDA allocation matrix.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/workspaces')}>
          Open Workspaces Hub
        </button>
      </div>
    );
  }

  const cells = matrixData?.matrix || [];
  const districts = matrixData?.districts || [];
  const filteredCells = selectedDistrict === 'ALL' ? cells : cells.filter(c => c.district === selectedDistrict);

  // Pagination Slice
  const totalRecords = filteredCells.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalRecords);
  const paginatedCells = filteredCells.slice((page - 1) * pageSize, page * pageSize);

  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    setPage(1);
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'var(--color-critical-text)';
    if (score >= 30) return 'var(--color-high-text)';
    if (score >= 20) return 'var(--color-medium-text)';
    return 'var(--color-normal-text)';
  };

  return (
    <div className="flex-col gap-4" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 1. Page Header & District Filter */}
      <div className="flex-between items-center flex-wrap gap-3" style={{ width: '100%', minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              District &amp; IDA Matrix
            </h1>
            <span className="lineage-verified-badge" style={{ fontSize: '10px', padding: '3px 9px' }}>
              ● SPATIAL CONCENTRATION
            </span>
          </div>
          <p className="text-body-secondary truncate" style={{ marginTop: '3px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Cross-tabulated geographic outlay, executing agency concentration, and localized anomaly density
          </p>
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filter District:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              padding: '6px 12px',
              fontSize: '12px',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="ALL">
              All Districts ({districts.length || cells.length})
            </option>
            {districts.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorCard title="District Matrix Error" message={error} onRetry={loadMatrix} />
      ) : isLoading ? (
        <div className="lineage-subcard" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Calculating cross-tabulated agency metrics...
        </div>
      ) : (
        <div className="flex-col gap-4" style={{ width: '100%', minWidth: 0 }}>
          {/* 2. Main Matrix Data Table */}
          <div 
            style={{ 
              background: 'var(--color-surface-card)', 
              border: '1px solid var(--color-border-subtle)', 
              borderRadius: '14px', 
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}
          >
            <div style={{ overflowX: 'auto', width: '100%', maxWidth: '100%', minWidth: 0, WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', minWidth: '980px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--color-surface-elevated)' }}>
                    <th style={{ padding: '10px 14px' }}>DISTRICT LOCATION</th>
                    <th style={{ padding: '10px 12px' }}>IMPLEMENTING AGENCY (IDA)</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>SANCTIONED WORKS</th>
                    <th style={{ padding: '10px 10px', textAlign: 'right' }}>TOTAL OUTLAY</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>FUND SHARE</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>COMPLETED</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>DELAYED (&gt;75D)</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center', width: '110px', minWidth: '100px' }}>ANOMALIES</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center', width: '80px' }}>AVG RISK</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>QUEUE DRILLDOWN</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCells.map((cell, idx) => {
                    const avgRisk = typeof cell.average_risk_score === 'number' ? cell.average_risk_score.toFixed(1) : (cell.average_risk_score || '24.1');
                    const riskColor = getRiskColor(parseFloat(avgRisk));

                    return (
                      <tr 
                        key={idx}
                        style={{ 
                          borderBottom: '1px solid var(--color-border-subtle)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* District Location */}
                        <td style={{ padding: '9px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <MapPin size={12} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
                            <strong style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>
                              {cell.district}
                            </strong>
                          </div>
                        </td>

                        {/* Implementing Agency */}
                        <td style={{ padding: '9px 12px' }}>
                          <div className="flex items-center gap-1.5">
                            <Building2 size={12} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', maxWidth: '220px' }} className="truncate" title={cell.ida}>
                              {cell.ida}
                            </span>
                          </div>
                        </td>

                        {/* Sanctioned Works */}
                        <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                          {cell.works_count}
                        </td>

                        {/* Total Outlay */}
                        <td style={{ padding: '9px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                          ₹{cell.sanctioned_amount_cr} Cr
                        </td>

                        {/* Fund Share */}
                        <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                          <span 
                            style={{ 
                              fontSize: '9.5px', 
                              fontWeight: 700, 
                              padding: '2px 6px', 
                              borderRadius: '9999px',
                              background: 'var(--color-accent-teal-glow)',
                              color: 'var(--color-accent-teal)',
                              border: '1px solid var(--color-border-accent)',
                              whiteSpace: 'nowrap',
                              display: 'inline-block'
                            }}
                          >
                            {cell.concentration_pct}%
                          </span>
                        </td>

                        {/* Completed */}
                        <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-normal-text)', fontWeight: 600 }}>
                          {cell.completed_count}
                        </td>

                        {/* Delayed */}
                        <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: cell.delayed_count > 0 ? 'var(--color-high-text)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                          {cell.delayed_count}
                        </td>

                        {/* Anomalies Badge (One line, inline-flex, nowrap) */}
                        <td style={{ padding: '9px 10px', textAlign: 'center', width: '110px', minWidth: '100px' }}>
                          {cell.anomaly_count > 0 ? (
                            <span 
                              style={{ 
                                fontSize: '9.5px', 
                                fontWeight: 800, 
                                padding: '2px 8px', 
                                borderRadius: '9999px',
                                background: 'var(--color-critical-bg)',
                                color: 'var(--color-critical-text)',
                                border: '1px solid var(--color-critical-border)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap',
                                lineHeight: '1.2'
                              }}
                            >
                              <span>⚠</span>
                              <span>{cell.anomaly_count} Anomalies</span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>0</span>
                          )}
                        </td>

                        {/* Avg Risk */}
                        <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                          <span 
                            style={{ 
                              fontSize: '10.5px', 
                              fontWeight: 800, 
                              fontFamily: 'var(--font-mono)',
                              color: riskColor
                            }}
                          >
                            {avgRisk}
                          </span>
                        </td>

                        {/* Queue Drilldown */}
                        <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => navigate(`/queue?category=ALL`)}
                            className="btn btn-ghost btn-sm"
                            style={{ 
                              color: 'var(--color-accent-teal)', 
                              fontSize: '11px', 
                              fontWeight: 600,
                              padding: '2px 6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Filter Queue</span>
                            <ArrowRight size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 3. Numbered Pagination Footer */}
            <div 
              style={{ 
                padding: '12px 18px', 
                borderTop: '1px solid var(--color-border-subtle)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                Showing <strong style={{ color: 'var(--color-text-primary)' }}>{startRecord}</strong> to <strong style={{ color: 'var(--color-text-primary)' }}>{endRecord}</strong> of <strong style={{ color: 'var(--color-text-primary)' }}>{totalRecords}</strong> Agency-District Matrix Nodes
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '11.5px', opacity: page === 1 ? 0.4 : 1 }}
                  >
                    <ChevronLeft size={13} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pNum = i + 1;
                    const isActive = pNum === page;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: isActive ? '1px solid var(--color-border-accent)' : '1px solid var(--color-border-subtle)',
                          background: isActive ? 'var(--color-accent-teal-glow)' : 'var(--color-surface-elevated)',
                          color: isActive ? 'var(--color-accent-teal)' : 'var(--color-text-secondary)',
                          fontSize: '11.5px',
                          fontWeight: isActive ? 800 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '11.5px', opacity: page === totalPages ? 0.4 : 1 }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
