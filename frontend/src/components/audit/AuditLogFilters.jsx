import React, { useState, useEffect } from 'react';
import { Search, RefreshCcw, Trash2, X, SlidersHorizontal } from 'lucide-react';

export const AuditLogFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  onClearLogs,
  totalRecords
}) => {
  const [workIdInput, setWorkIdInput] = useState(filters.work_id || '');
  const [actionInput, setActionInput] = useState(filters.action_type || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (workIdInput !== filters.work_id) {
        onFilterChange('work_id', workIdInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [workIdInput, filters.work_id, onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (actionInput !== filters.action_type) {
        onFilterChange('action_type', actionInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [actionInput, filters.action_type, onFilterChange]);

  const handleReset = () => {
    setWorkIdInput('');
    setActionInput('');
    onResetFilters();
  };

  return (
    <div 
      className="card" 
      style={{ 
        padding: 'var(--space-4)', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}
    >
      <div className="flex-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} color="var(--color-accent-teal)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Filter Audit Trail Records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-ghost btn-sm flex items-center gap-1"
            title="Reset audit search filters"
          >
            <RefreshCcw size={11} />
            <span>Reset</span>
          </button>

          {onClearLogs && (
            <button
              type="button"
              onClick={onClearLogs}
              className="btn btn-secondary btn-sm flex items-center gap-1"
              style={{ color: 'var(--color-critical-text)' }}
              title="Clear session audit trail from database"
            >
              <Trash2 size={12} />
              <span>Clear Session Logs</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-3" style={{ width: '100%' }}>
        {/* Work ID Filter */}
        <div style={{ minWidth: '220px', flex: '1 1 220px' }}>
          <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Filter by Work ID
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input text-mono"
              style={{ paddingLeft: '30px', paddingRight: workIdInput ? '30px' : '12px' }}
              placeholder="e.g. WS/MP18157/..."
              value={workIdInput}
              onChange={(e) => setWorkIdInput(e.target.value)}
            />
            {workIdInput && (
              <button
                type="button"
                onClick={() => setWorkIdInput('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Action Type Filter */}
        <div style={{ minWidth: '200px', flex: '1 1 200px' }}>
          <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Filter by Action Type
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '30px', paddingRight: actionInput ? '30px' : '12px' }}
              placeholder="e.g. VERIFICATION, NOTE..."
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
            />
            {actionInput && (
              <button
                type="button"
                onClick={() => setActionInput('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Page Size Selector */}
        <div style={{ width: '100px', flex: '0 0 100px' }}>
          <label className="text-caption" style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Rows / Page
          </label>
          <select
            className="select"
            value={filters.page_size}
            onChange={(e) => onFilterChange('page_size', Number(e.target.value))}
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
};
