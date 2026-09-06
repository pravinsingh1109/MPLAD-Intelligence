import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [healthStatus, setHealthStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(() => {
    return localStorage.getItem('mplad_active_workspace_id') || 'demo-ludhiana';
  });
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('mplad_theme') || 'dark';
  });
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [lastViewedProjectId, setLastViewedProjectIdState] = useState(() => {
    return localStorage.getItem('mplad_last_viewed_project') || null;
  });
  const [toastMessage, setToastMessage] = useState(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const setLastViewedProjectId = useCallback((id) => {
    setLastViewedProjectIdState(id);
    if (id) {
      localStorage.setItem('mplad_last_viewed_project', id);
    } else {
      localStorage.removeItem('mplad_last_viewed_project');
    }
  }, []);

  // Sync theme attribute on document root and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('mplad_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  }, []);

  // Set active workspace and persist to localStorage
  const setActiveWorkspaceId = useCallback((id) => {
    setActiveWorkspaceIdState(id);
    if (id) {
      localStorage.setItem('mplad_active_workspace_id', id);
    } else {
      localStorage.removeItem('mplad_active_workspace_id');
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await api.health();
      if (res && res.status === 'ok') {
        setHealthStatus('connected');
      } else {
        setHealthStatus('offline');
      }
    } catch {
      setHealthStatus('offline');
    }
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    try {
      setLoadingWorkspaces(true);
      const res = await api.getWorkspaces();
      const items = (res && res.items) ? res.items : [];
      setWorkspaces(items);

      // Check if active workspace is in the list
      if (items.length > 0) {
        const found = items.find((w) => w.id === activeWorkspaceId);
        if (found) {
          setActiveWorkspace(found);
        } else {
          // Default to the first workspace or demo
          const fallback = items.find((w) => w.is_demo) || items[0];
          setActiveWorkspaceId(fallback.id);
          setActiveWorkspace(fallback);
        }
      } else {
        setActiveWorkspace(null);
        setActiveWorkspaceId(null);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [activeWorkspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    checkHealth();
    refreshWorkspaces();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth, refreshWorkspaces]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadDemo = async () => {
    try {
      showToast('Seeding baseline Demo Workspace...', 'info');
      const ws = await api.loadDemoWorkspace();
      await refreshWorkspaces();
      setActiveWorkspaceId(ws.id);
      setActiveWorkspace(ws);
      showToast(`Loaded "${ws.name}" successfully!`, 'success');
      return ws;
    } catch (err) {
      showToast(`Failed to load demo workspace: ${err.message}`, 'error');
      throw err;
    }
  };

  const clearActiveDataset = async (workspaceId) => {
    const targetId = workspaceId || activeWorkspaceId;
    if (!targetId) return;
    try {
      await api.clearWorkspaceDataset(targetId);
      await refreshWorkspaces();
      showToast('Workspace dataset cleared.', 'info');
    } catch (err) {
      showToast(`Failed to clear dataset: ${err.message}`, 'error');
      throw err;
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      await api.deleteWorkspace(workspaceId);
      if (activeWorkspaceId === workspaceId) {
        setActiveWorkspaceId(null);
        setActiveWorkspace(null);
      }
      await refreshWorkspaces();
      showToast('Workspace permanently deleted.', 'info');
    } catch (err) {
      showToast(`Failed to delete workspace: ${err.message}`, 'error');
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        healthStatus,
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        setActiveWorkspaceId,
        loadingWorkspaces,
        refreshWorkspaces,
        loadDemo,
        clearActiveDataset,
        deleteWorkspace,
        lastViewedProjectId,
        setLastViewedProjectId,
        showToast,
        toastMessage,
        checkHealth,
        theme,
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
