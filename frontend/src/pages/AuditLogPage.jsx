import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { AuditLogFilters } from '../components/audit/AuditLogFilters';
import { AuditLogTable } from '../components/audit/AuditLogTable';
import { Pagination } from '../components/common/Pagination';
import { ErrorCard } from '../components/common/ErrorCard';
import { ShieldCheck, Database, Sparkles } from 'lucide-react';

export const AuditLogPage = () => {
  const navigate = useNavigate();
  const { activeWorkspaceId, activeWorkspace, loadDemo } = useApp();

  const [filters, setFilters] = useState({
    work_id: '',
    action_type: '',
    page_size: 25
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    items: [],
    total: 0,
    total_pages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (!activeWorkspaceId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getAuditLogs(activeWorkspaceId, {
        page,
        page_size: filters.page_size,
        work_id: filters.work_id,
        action_type: filters.action_type
      });
      setData({
        items: res.items || [],
        total: res.total || 0,
        total_pages: res.total_pages || 1
      });
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Error fetching system audit trail.');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      work_id: '',
      action_type: '',
      page_size: 25
    });
    setPage(1);
  };

  const handleClearLogs = async () => {
    if (!activeWorkspaceId) return;
    if (window.confirm('Are you sure you want to clear session audit trail logs for this workspace?')) {
      try {
        await api.clearAuditLogs(activeWorkspaceId);
        fetchLogs();
      } catch (err) {
        alert(`Failed to clear logs: ${err.message}`);
      }
    }
  };

  if (!activeWorkspaceId) {
    return (
      <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center', maxWidth: '640px', margin: '40px auto' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', border: '1px solid var(--color-border-strong)' }}>
          <Database size={28} color="var(--color-accent-teal)" />
        </div>
        <h2 className="text-heading-2" style={{ marginBottom: 'var(--space-2)' }}>No Active Workspace Selected</h2>
        <p className="text-body-secondary" style={{ marginBottom: 'var(--space-6)' }}>
          Select or load a workspace to view its official audit logs and investigation trails.
        </p>
        <div className="flex justify-center gap-3">
          <button className="btn btn-secondary" onClick={() => loadDemo()}>
            <Sparkles size={16} color="var(--color-accent-teal)" style={{ marginRight: '6px' }} />
            Load Demo Dataset
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/workspaces')}>
            Open Workspaces Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col gap-4">
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-display">Official Audit Trail &amp; Forensic Log</h1>
          <p className="text-caption" style={{ marginTop: '2px' }}>
            Tracking context: <strong style={{ color: 'var(--color-text-primary)' }}>{activeWorkspace?.name || activeWorkspaceId}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-normal" style={{ fontSize: '11px' }}>
            <ShieldCheck size={12} />
            <span>Immutable Relational Log</span>
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <AuditLogFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onClearLogs={handleClearLogs}
        totalRecords={data.total}
      />

      {/* Audit Log Table or Error */}
      {error ? (
        <ErrorCard title="Failed to Fetch Audit Log" message={error} onRetry={fetchLogs} />
      ) : (
        <>
          <AuditLogTable
            logs={data.items}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
          />

          {!isLoading && data.total > 0 && (
            <Pagination
              page={page}
              totalPages={data.total_pages}
              totalRecords={data.total}
              pageSize={filters.page_size}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </>
      )}
    </div>
  );
};
