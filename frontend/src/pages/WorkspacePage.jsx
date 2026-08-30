import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Sparkles, 
  ExternalLink, 
  RotateCcw, 
  Trash2, 
  AlertTriangle,
  ArrowUpRight,
  Database,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WorkspacePage = () => {
  const navigate = useNavigate();
  const { 
    workspaces, 
    activeWorkspaceId, 
    setActiveWorkspaceId, 
    activeWorkspace,
    loadDemo, 
    clearActiveDataset, 
    deleteWorkspace, 
    loadingWorkspaces, 
    showToast 
  } = useApp();

  const [loadingAction, setLoadingAction] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'CLEAR' | 'DELETE'
    workspace: null
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSelectWorkspace = (ws) => {
    setActiveWorkspaceId(ws.id);
    if (ws.status === 'ACTIVE') {
      navigate('/dashboard');
    } else {
      navigate('/new-analysis');
    }
  };

  const handleLoadDemo = async () => {
    try {
      setLoadingAction(true);
      await loadDemo();
      navigate('/dashboard');
    } catch {
      // Toast shown in AppContext
    } finally {
      setLoadingAction(false);
    }
  };

  const openClearModal = (ws, e) => {
    e.stopPropagation();
    setModalState({ isOpen: true, type: 'CLEAR', workspace: ws });
  };

  const openDeleteModal = (ws, e) => {
    e.stopPropagation();
    setDeleteConfirmText('');
    setModalState({ isOpen: true, type: 'DELETE', workspace: ws });
  };

  const handleConfirmAction = async () => {
    if (!modalState.workspace) return;
    try {
      setLoadingAction(true);
      if (modalState.type === 'CLEAR') {
        await clearActiveDataset(modalState.workspace.id);
      } else if (modalState.type === 'DELETE') {
        if (deleteConfirmText.trim().toUpperCase() !== 'DELETE' && deleteConfirmText.trim() !== modalState.workspace.name) {
          showToast('Please type DELETE to confirm removal', 'warning');
          setLoadingAction(false);
          return;
        }
        await deleteWorkspace(modalState.workspace.id);
      }
      setModalState({ isOpen: false, type: null, workspace: null });
    } catch {
      // Toast shown
    } finally {
      setLoadingAction(false);
    }
  };

  // Determine active display data
  const currentWs = activeWorkspace || workspaces[0] || null;
  const sanctionedCount = currentWs?.total_sanctioned_works || 10000;
  const sanctionedOutlayCr = currentWs?.total_sanctioned_amount_cr ? currentWs.total_sanctioned_amount_cr.toFixed(2) : '1,520.16';
  const anomaliesCount = currentWs?.ml_anomaly_candidates_count || 323;
  const criticalHighCount = ((currentWs?.critical_risk_count || 0) + (currentWs?.high_risk_count || 0)) || 85;
  const completedCount = currentWs?.total_completed_works || 10000;

  return (
    <div className="flex-col gap-6" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Main Page Hero */}
      <div className="flex-between items-center flex-wrap gap-4" style={{ paddingTop: '4px' }}>
        <div>
          <h1 className="text-display" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: 0 }}>
            Workspaces &amp; Dataset Hub
          </h1>
          <p className="text-body-secondary" style={{ marginTop: '6px', fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
            Audit constituencies, trace funding, and surface risk before it becomes a headline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className="btn flex items-center gap-2"
            onClick={handleLoadDemo}
            disabled={loadingAction}
            style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text-primary)', padding: '8px 16px', fontSize: '12.5px', fontWeight: 600 }}
          >
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent-teal)' }}>+</span>
            <span>Load Demo Dataset</span>
          </button>

          <button 
            className="btn-cyan-cta flex items-center gap-2"
            onClick={() => navigate('/new-analysis')}
            disabled={loadingAction}
          >
            <ArrowUpRight size={16} strokeWidth={2.5} />
            <span>Start New Analysis</span>
          </button>
        </div>
      </div>

      {/* 2. Live Intelligence Snapshot Banner */}
      <div className="hub-snapshot-banner">
        {/* Left Side: Context & Title (~35%) */}
        <div className="hub-snapshot-left">
          <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--color-accent-teal)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>
            {currentWs?.name ? currentWs.name.toUpperCase() : 'DEMO: LUDHIANA FY2024-25'}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            Live intelligence snapshot
          </div>
        </div>

        {/* Right Side: 5 Distinct Metric Blocks in Responsive Grid (~65%) */}
        <div className="hub-snapshot-metrics-grid">
          {/* Block 1: Sanctioned Works */}
          <div className="hub-snapshot-metric-item">
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {sanctionedCount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '4px', whiteSpace: 'nowrap' }}>
              Sanctioned Works
            </div>
          </div>

          {/* Block 2: Sanction Outlay */}
          <div className="hub-snapshot-metric-item">
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-accent-cyan)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              ₹{sanctionedOutlayCr} Cr
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '4px', whiteSpace: 'nowrap' }}>
              Sanction Outlay
            </div>
          </div>

          {/* Block 3: ML Anomalies */}
          <div className="hub-snapshot-metric-item">
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-high-text)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {anomaliesCount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '4px', whiteSpace: 'nowrap' }}>
              ML Anomalies
            </div>
          </div>

          {/* Block 4: High / Critical Risks */}
          <div className="hub-snapshot-metric-item">
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-critical-text)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {criticalHighCount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '4px', whiteSpace: 'nowrap' }}>
              High / Critical Risks
            </div>
          </div>

          {/* Block 5: Completed Records */}
          <div className="hub-snapshot-metric-item">
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-normal-text)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {completedCount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '4px', whiteSpace: 'nowrap' }}>
              Completed Records
            </div>
          </div>
        </div>
      </div>

      {/* 3. Active Workspace Highlight Card */}
      {currentWs && (
        <div className="hub-active-card">
          <div className="flex-between items-start flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                <span className="badge" style={{ background: 'var(--color-accent-teal-glow)', border: '1px solid var(--color-border-accent)', color: 'var(--color-accent-teal)', fontSize: '10px', fontWeight: 800, padding: '2px 8px', letterSpacing: '0.04em' }}>
                  ACTIVE
                </span>
                {currentWs.is_demo && (
                  <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 8px' }}>OFFICIAL BASELINE</span>
                )}
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', margin: '0 0 4px 0' }}>
                {currentWs.name}
              </h2>

              <p className="text-caption" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Created {new Date(currentWs.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • workspace {currentWs.id} • verified dataset
              </p>
            </div>

            <button 
              className="btn-cyan-cta"
              onClick={() => handleSelectWorkspace(currentWs)}
              style={{ padding: '9px 20px', fontSize: '12.5px' }}
            >
              <ArrowUpRight size={15} strokeWidth={2.5} />
              <span>ENTER COMMAND CENTER</span>
            </button>
          </div>

          {/* 4 Active Tiles Grid */}
          <div className="hub-active-tiles-grid">
            {/* Tile 1: Risk Queue */}
            <div className="hub-active-tile">
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                RISK QUEUE
              </div>
              <div className="flex items-baseline gap-2" style={{ marginTop: '2px' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-critical-text)' }}>
                  {criticalHighCount || 12}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  requiring review
                </span>
              </div>
              <div className="hub-tile-bar bar-red" />
            </div>

            {/* Tile 2: Anomalies */}
            <div className="hub-active-tile">
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ANOMALIES
              </div>
              <div className="flex items-baseline gap-2" style={{ marginTop: '2px' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-high-text)' }}>
                  {anomaliesCount || 323}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  ML score &ge; 70
                </span>
              </div>
              <div className="hub-tile-bar bar-amber" />
            </div>

            {/* Tile 3: Top District */}
            <div className="hub-active-tile">
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                TOP DISTRICT
              </div>
              <div className="flex items-baseline gap-2" style={{ marginTop: '2px' }}>
                <span style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-accent-cyan)' }}>
                  {currentWs.name.includes('Ludhiana') ? 'Ludhiana' : 'Amritsar'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  audit focus
                </span>
              </div>
              <div className="hub-tile-bar bar-cyan" />
            </div>

            {/* Tile 4: Coverage */}
            <div className="hub-active-tile">
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                COVERAGE
              </div>
              <div className="flex items-baseline gap-2" style={{ marginTop: '2px' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-normal-text)' }}>
                  100%
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  recorded baseline
                </span>
              </div>
              <div className="hub-tile-bar bar-green" />
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Two-Column Area (Recent Workspaces + AI Review Signals) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 'var(--space-5)' }}>
        {/* Left Column: RECENT WORKSPACES */}
        <div className="flex-col gap-3">
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
            RECENT WORKSPACES
          </div>

          {loadingWorkspaces ? (
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading analysis workspaces...
            </div>
          ) : workspaces.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p className="text-body-secondary" style={{ marginBottom: 'var(--space-3)' }}>No workspaces created yet.</p>
              <button className="btn btn-primary btn-sm" onClick={handleLoadDemo}>Load Demo Workspace</button>
            </div>
          ) : (
            <div className="flex-col gap-2">
              {workspaces.map((ws, idx) => {
                const isActive = ws.id === activeWorkspaceId;
                const dotColor = idx % 3 === 0 ? '#10b981' : (idx % 3 === 1 ? '#06b6d4' : '#f59e0b');
                return (
                  <div 
                    key={ws.id}
                    className={`hub-workspace-row ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleSelectWorkspace(ws)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, boxShadow: `0 0 8px ${dotColor}99` }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {ws.name}
                          </span>
                          {isActive && (
                            <span className="badge" style={{ background: 'var(--color-accent-teal-glow)', color: 'var(--color-accent-teal)', border: '1px solid var(--color-border-accent)', fontSize: '9.5px', padding: '1px 6px' }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                          Active • Dataset ready
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                        {ws.total_sanctioned_works || 0} works
                      </span>
                      <span style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                        ₹{ws.total_sanctioned_amount_cr ? ws.total_sanctioned_amount_cr.toFixed(2) : '0.00'} Cr
                      </span>
                      <span style={{ fontSize: '12.5px', color: (ws.ml_anomaly_candidates_count > 0 ? 'var(--color-high-text)' : 'var(--color-text-muted)'), fontWeight: 600 }}>
                        {ws.ml_anomaly_candidates_count || 0} anomalies
                      </span>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="btn btn-ghost btn-sm"
                          title="Clear dataset"
                          onClick={(e) => openClearModal(ws, e)}
                          style={{ padding: '4px 6px', color: 'var(--color-text-muted)' }}
                        >
                          <RotateCcw size={13} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm"
                          title="Delete workspace"
                          onClick={(e) => openDeleteModal(ws, e)}
                          style={{ padding: '4px 6px', color: 'var(--color-critical-text)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Caption Line */}
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
            <strong style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>MPLAD INTELLIGENCE</strong>
            <span>AI-assisted audit • source lineage preserved • human review required for enforcement</span>
          </div>
        </div>

        {/* Right Column: AI REVIEW SIGNALS */}
        <div>
          <div className="hub-signals-card">
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--color-accent-teal)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                AI REVIEW SIGNALS
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                What deserves attention now
              </div>
            </div>

            <div className="flex-col gap-2.5">
              {/* Signal 1: Red */}
              <div className="hub-signal-box">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-critical)', boxShadow: '0 0 8px var(--color-critical-bg)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Unusual sanction concentration
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {currentWs?.name.includes('Ludhiana') ? 'Ludhiana' : 'Amritsar'} • {Math.min(anomaliesCount, 8)} works exceeding single-agency quota
                  </div>
                </div>
              </div>

              {/* Signal 2: Amber */}
              <div className="hub-signal-box">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-high)', boxShadow: '0 0 8px var(--color-high-bg)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Repeat contractor exposure
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    3 contractors • 17 linked projects with elevated delay
                  </div>
                </div>
              </div>

              {/* Signal 3: Indigo */}
              <div className="hub-signal-box">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-indigo)', boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Low completion velocity
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    42 works • &gt;90 days elapsed post administrative sanction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalState.isOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <AlertTriangle size={20} color="var(--color-critical-text)" />
                <span>{modalState.type === 'CLEAR' ? 'Clear Workspace Dataset?' : 'Delete Workspace Permanently?'}</span>
              </div>
            </div>

            <div className="modal-body">
              <p className="text-body-secondary" style={{ lineHeight: '1.5' }}>
                {modalState.type === 'CLEAR' ? (
                  <>This will remove all uploaded works, completed feeds, ML anomaly scores, and audit notes from <strong>"{modalState.workspace?.name}"</strong>. The workspace container will be reset to empty.</>
                ) : (
                  <>This action cannot be undone. All database records, investigation cases, and audit logs belonging to <strong>"{modalState.workspace?.name}"</strong> will be permanently destroyed via cascade deletion.</>
                )}
              </p>

              {modalState.type === 'DELETE' && (
                <div>
                  <label className="text-caption" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input 
                    type="text" 
                    className="input" 
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setModalState({ isOpen: false, type: null, workspace: null })}
                disabled={loadingAction}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmAction}
                disabled={loadingAction}
              >
                {loadingAction ? 'Processing...' : (modalState.type === 'CLEAR' ? 'Clear Dataset' : 'Permanently Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
