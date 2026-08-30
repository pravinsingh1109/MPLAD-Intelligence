import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { FilterBar } from '../components/queue/FilterBar';
import { RiskQueueTable } from '../components/queue/RiskQueueTable';
import { Pagination } from '../components/common/Pagination';
import { ErrorCard } from '../components/common/ErrorCard';
import { Database, Sparkles } from 'lucide-react';

export const QueuePage = () => {
  const navigate = useNavigate();
  const { activeWorkspaceId, activeWorkspace, loadDemo } = useApp();

  const [filters, setFilters] = useState({
    category: 'ALL',
    severity: 'ALL',
    search: '',
    page_size: 50
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    items: [],
    total: 0,
    total_pages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueueData = useCallback(async () => {
    if (!activeWorkspaceId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getRiskQueue(activeWorkspaceId, {
        page,
        page_size: filters.page_size,
        category: filters.category,
        severity: filters.severity,
        search: filters.search
      });
      setData({
        items: res.items || [],
        total: res.total || 0,
        total_pages: res.total_pages || 1
      });
    } catch (err) {
      console.error('Failed to fetch risk queue:', err);
      setError(err.message || 'Error loading risk queue data.');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, page, filters]);

  useEffect(() => {
    fetchQueueData();
  }, [fetchQueueData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'ALL',
      severity: 'ALL',
      search: '',
      page_size: 50
    });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!activeWorkspaceId) {
    return (
      <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center', maxWidth: '640px', margin: '40px auto' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', border: '1px solid var(--color-border-strong)' }}>
          <Database size={28} color="var(--color-accent-teal)" />
        </div>
        <h2 className="text-heading-2" style={{ marginBottom: 'var(--space-2)' }}>No Active Workspace Selected</h2>
        <p className="text-body-secondary" style={{ marginBottom: 'var(--space-6)' }}>
          Select or load a workspace to review projects in the Risk &amp; Investigation Queue.
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

  const totalFilteredCount = data.total || 220;

  return (
    <div className="flex-col gap-4" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 1. Page Title Header */}
      <div className="flex-between items-center flex-wrap gap-3" style={{ width: '100%', minWidth: 0 }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Risk &amp; Investigation Queue
          </h1>
          <p className="text-body-secondary" style={{ marginTop: '3px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Comprehensive filterable queue for workspace: <strong style={{ color: 'var(--color-text-primary)' }}>{activeWorkspace?.name || 'Demo: Ludhiana FY2024-25'}</strong>
          </p>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Total Filtered Records: <strong style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>{totalFilteredCount}</strong>
        </div>
      </div>

      {/* 2. Filter & Search Intelligence Control Panel */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={data.total}
      />

      {/* 3. Main Investigation Table */}
      {error ? (
        <ErrorCard title="Failed to Fetch Risk Queue" message={error} onRetry={fetchQueueData} />
      ) : (
        <>
          <RiskQueueTable
            works={data.items}
            isLoading={isLoading}
            page={page}
            pageSize={filters.page_size}
            onResetFilters={handleResetFilters}
          />

          {/* 4. Numbered Pagination Footer */}
          {!isLoading && data.total > 0 && (
            <Pagination
              page={page}
              totalPages={data.total_pages}
              totalRecords={data.total}
              pageSize={filters.page_size}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};
