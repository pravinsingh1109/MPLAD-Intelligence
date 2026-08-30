import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FolderKanban, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldAlert, 
  FileSearch, 
  ScrollText, 
  Database,
  Building2,
  Grid,
  GitCommit,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CONSTITUENCY_INFO } from '../../api/constants';

export const Sidebar = () => {
  const { lastViewedProjectId, activeWorkspace } = useApp();
  const hasActiveWorkspace = !!activeWorkspace;

  return (
    <aside className="sidebar-shell">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--color-accent-teal), var(--color-accent-indigo))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 2px 10px var(--color-accent-teal-glow)'
          }}
        >
          <Layers size={18} color="#042f2e" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', lineHeight: '1.2' }}>
            MPLAD Intelligence
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-accent-teal)', fontWeight: 600, letterSpacing: '0.04em' }}>
            SIH26102 · DECISION SUPPORT
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 'var(--space-3)', overflowY: 'auto' }}>
        {/* Workspace & Data */}
        <div className="sidebar-nav-group">
          <div className="sidebar-group-title">Workspace & Data</div>
          
          <NavLink
            to="/workspaces"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2">
              <FolderKanban size={16} />
              <span>Workspaces Hub</span>
            </div>
          </NavLink>

          <NavLink
            to="/new-analysis"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2">
              <PlusCircle size={16} color="var(--color-accent-teal)" />
              <span style={{ color: 'var(--color-accent-teal)', fontWeight: 600 }}>New Analysis</span>
            </div>
          </NavLink>

          <NavLink
            to="/data-lineage"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} ${!hasActiveWorkspace ? 'disabled' : ''}`}
            title={!hasActiveWorkspace ? 'Select a workspace first' : ''}
          >
            <div className="flex items-center gap-2">
              <GitCommit size={16} />
              <span>Data Lineage</span>
            </div>
          </NavLink>
        </div>

        {/* Intelligence Core */}
        <div className="sidebar-nav-group">
          <div className="sidebar-group-title">Intelligence Core</div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} ${!hasActiveWorkspace ? 'disabled' : ''}`}
            title={!hasActiveWorkspace ? 'Select a workspace first' : ''}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard size={16} />
              <span>Command Center</span>
            </div>
          </NavLink>

          <NavLink
            to="/queue"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} ${!hasActiveWorkspace ? 'disabled' : ''}`}
            title={!hasActiveWorkspace ? 'Select a workspace first' : ''}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>Risk Queue</span>
            </div>
            {activeWorkspace && activeWorkspace.total_sanctioned_works > 0 && (
              <span className="sidebar-badge">{activeWorkspace.total_sanctioned_works}</span>
            )}
          </NavLink>

          <NavLink
            to="/contractors"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} ${!hasActiveWorkspace ? 'disabled' : ''}`}
            title={!hasActiveWorkspace ? 'Select a workspace first' : ''}
          >
            <div className="flex items-center gap-2">
              <Building2 size={16} />
              <span>Contractor Intel</span>
            </div>
          </NavLink>

          <NavLink
            to="/district-matrix"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} ${!hasActiveWorkspace ? 'disabled' : ''}`}
            title={!hasActiveWorkspace ? 'Select a workspace first' : ''}
          >
            <div className="flex items-center gap-2">
              <Grid size={16} />
              <span>District & IDA Matrix</span>
            </div>
          </NavLink>

          {lastViewedProjectId && hasActiveWorkspace ? (
            <NavLink
              to={`/project/${encodeURIComponent(lastViewedProjectId)}`}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="flex items-center gap-2">
                <FileSearch size={16} />
                <span>Project Intelligence</span>
              </div>
            </NavLink>
          ) : (
            <div className="sidebar-nav-link disabled" title="Select a project from the Risk Queue to view intelligence">
              <div className="flex items-center gap-2">
                <FileSearch size={16} />
                <span>Project Intelligence</span>
              </div>
            </div>
          )}
        </div>

        {/* Governance & Audit */}
        <div className="sidebar-nav-group">
          <div className="sidebar-group-title">Governance & Audit</div>

          <NavLink
            to="/audit-log"
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''} ${!hasActiveWorkspace ? 'disabled' : ''}`}
            title={!hasActiveWorkspace ? 'Select a workspace first' : ''}
          >
            <div className="flex items-center gap-2">
              <ScrollText size={16} />
              <span>Audit Trail Log</span>
            </div>
          </NavLink>
        </div>
      </nav>

      {/* Footer Status Box */}
      <div className="sidebar-footer-box" style={{ marginTop: 'auto', flexShrink: 0, background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '12px 14px' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-normal-text)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '0.04em' }}>
            ALL SYSTEMS NOMINAL
          </span>
        </div>
        <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Data sync • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST
        </div>
      </div>
    </aside>
  );
};
