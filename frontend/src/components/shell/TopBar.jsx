import React from 'react';
import { Shield, Layers, User, ArrowRightLeft, Database, Activity, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CONSTITUENCY_INFO } from '../../api/constants';

export const TopBar = () => {
  const { healthStatus, activeWorkspace, theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  return (
    <header className="top-header">
      {/* Left Title / Context Identifier */}
      <div className="top-header-left">
        <Link to="/workspaces" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            MPLAD Intelligence
          </span>
          <span className="badge badge-info" style={{ fontSize: '9.5px', padding: '1px 6px' }}>
            SIH26102
          </span>
        </Link>
      </div>

      {/* Center: Active Workspace Context Capsule */}
      <div className="top-header-center">
        {activeWorkspace ? (
          <div className="workspace-capsule">
            <Database size={13} color="var(--color-accent-teal)" />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Context:</span>
            <strong style={{ color: 'var(--color-text-primary)', fontSize: '12px' }} className="truncate">
              {activeWorkspace.name}
            </strong>
            <span className={`badge ${activeWorkspace.is_demo ? 'badge-info' : (activeWorkspace.status === 'ACTIVE' ? 'badge-normal' : 'badge-warning')}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
              {activeWorkspace.is_demo ? 'DEMO' : activeWorkspace.status}
            </span>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => navigate('/workspaces')}
              style={{ fontSize: '11px', color: 'var(--color-accent-teal)', padding: '2px 8px', gap: '4px' }}
            >
              <ArrowRightLeft size={11} />
              Switch
            </button>
          </div>
        ) : (
          <div className="workspace-capsule" style={{ borderColor: 'var(--color-high-border)' }}>
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>No Workspace Loaded</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/workspaces')}>
              Select / Create Workspace
            </button>
          </div>
        )}
      </div>

      {/* Right: API Connectivity, Theme Switcher & User Role Capsule */}
      <div className="top-header-right">
        {/* Global Theme Toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px 10px',
            color: 'var(--color-text-primary)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            height: '28px'
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={13} color="#fbbf24" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={13} color="#6366f1" />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Backend API Live Status */}
        <div className="status-pill">
          <span className={`status-dot ${healthStatus === 'connected' ? 'connected' : 'offline'}`} />
          <span style={{ color: healthStatus === 'connected' ? 'var(--color-normal-text)' : 'var(--color-critical-text)', fontWeight: 600 }}>
            {healthStatus === 'connected' ? 'API Live' : 'API Offline'}
          </span>
        </div>

        {/* User Identity / Role */}
        <div className="user-capsule">
          <div 
            style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--color-accent-teal), var(--color-accent-indigo))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#042f2e',
              fontWeight: 800,
              fontSize: '11px'
            }}
          >
            SN
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            State Nodal Officer
          </span>
        </div>
      </div>
    </header>
  );
};
