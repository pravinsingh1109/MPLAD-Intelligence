import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { KpiCards } from '../components/dashboard/KpiCards';
import { DataNoticeBanner } from '../components/dashboard/DataNoticeBanner';
import { EarlyWarningBanner } from '../components/dashboard/EarlyWarningBanner';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { IdaDistributionChart } from '../components/dashboard/IdaDistributionChart';
import { PreviewQueueTable } from '../components/dashboard/PreviewQueueTable';
import { ErrorCard } from '../components/common/ErrorCard';
import { Database, PlusCircle, Sparkles, ArrowRightLeft, FileDown, Loader2 } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { activeWorkspaceId, activeWorkspace, loadDemo } = useApp();

  const [kpis, setKpis] = useState(null);
  const [previewWorks, setPreviewWorks] = useState([]);
  const [earlyWarnings, setEarlyWarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (!activeWorkspaceId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [kpiRes, queueRes, ewRes] = await Promise.all([
        api.getKpis(activeWorkspaceId),
        api.getRiskQueue(activeWorkspaceId, { page: 1, page_size: 10 }),
        api.getEarlyWarnings(activeWorkspaceId).catch(() => ({ warnings: [] }))
      ]);
      setKpis(kpiRes);
      setPreviewWorks(queueRes.items || []);
      setEarlyWarnings(ewRes.warnings || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to connect to backend REST API.');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleDownloadExecutivePdf = async () => {
    if (!activeWorkspaceId || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await api.downloadExecutivePdf(activeWorkspaceId, activeWorkspace?.name || 'Ludhiana');
    } catch (err) {
      console.error('Executive PDF Export Error:', err);
      alert(`Executive PDF Export Failed: ${err.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!activeWorkspaceId) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--color-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', border: '1px solid var(--color-border-strong)' }}>
          <Database size={26} color="var(--color-accent-teal)" />
        </div>
        <h2 className="text-heading-2" style={{ marginBottom: 'var(--space-2)' }}>No Active Workspace Selected</h2>
        <p className="text-body-secondary" style={{ marginBottom: 'var(--space-6)' }}>
          Select an existing analysis workspace from the Hub or load the official demo baseline to view the National Command Center.
        </p>
        <div className="flex justify-center gap-3">
          <button className="btn btn-secondary" onClick={() => loadDemo()}>
            <Sparkles size={15} color="var(--color-accent-teal)" />
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
    <div className="flex-col gap-5" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 1. Main Page Header */}
      <div className="flex-between items-center flex-wrap gap-3" style={{ width: '100%', minWidth: 0 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              National Command Center
            </h1>
            <span className="lineage-verified-badge" style={{ fontSize: '10px', padding: '3px 9px' }}>
              ● LIVE AUDIT
            </span>
          </div>
          <p className="text-body-secondary truncate" style={{ marginTop: '4px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Active Audit Context: <strong style={{ color: 'var(--color-text-primary)' }}>{activeWorkspace?.name || 'Demo: Ludhiana FY2024-25'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap" style={{ flexShrink: 0 }}>
          <button
            className="btn btn-secondary flex items-center gap-2"
            onClick={handleDownloadExecutivePdf}
            disabled={isExportingPdf}
            title="Download official executive summary report PDF"
            style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600 }}
          >
            {isExportingPdf ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <FileDown size={13} color="var(--color-accent-teal)" />
            )}
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Download Executive Report'}</span>
          </button>

          <button 
            className="btn btn-secondary flex items-center gap-1.5" 
            onClick={() => navigate('/workspaces')}
            style={{ padding: '7px 12px', fontSize: '12px', fontWeight: 600 }}
          >
            <ArrowRightLeft size={12} />
            <span>Switch</span>
          </button>

          <button 
            className="btn-cyan-cta flex items-center gap-1.5" 
            onClick={() => navigate('/new-analysis')}
            style={{ padding: '7px 16px', fontSize: '12px' }}
          >
            <PlusCircle size={14} strokeWidth={2.5} />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {error ? (
        <ErrorCard
          title="Backend Connection Error"
          message={error}
          onRetry={loadDashboardData}
        />
      ) : (
        <>
          {/* 2. Empirically Audited Dataset Strip */}
          <DataNoticeBanner
            totalSanctioned={kpis?.total_sanctioned_works}
            totalRecommended={kpis?.total_recommended_works}
            totalCompleted={kpis?.total_completed_works}
            outlayCr={kpis?.total_sanctioned_amount_cr?.toFixed(2)}
          />

          {/* 3. Proactive Early Warnings Strip */}
          <EarlyWarningBanner warnings={earlyWarnings} />

          {/* 4. KPI Metrics Cards & Secondary Feed Strip */}
          <KpiCards kpis={kpis} isLoading={isLoading} />

          {/* 5. 2 Analytics Visualizations: Donut + Bar Chart */}
          <div className="grid-2" style={{ width: '100%', minWidth: 0 }}>
            <RiskDistributionChart kpis={kpis} isLoading={isLoading} />
            <IdaDistributionChart />
          </div>

          {/* 6. Top 10 High Priority Operational Queue */}
          <PreviewQueueTable works={previewWorks} totalCount={kpis?.total_sanctioned_works} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};
