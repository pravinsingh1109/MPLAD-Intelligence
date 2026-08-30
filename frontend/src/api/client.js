// Centralized API Client Module (Strict Contextualization)
import { BASE_URL } from './constants';

/**
 * URL-encodes work IDs that contain slashes (e.g., WS/MP18157/2024-2025/163249)
 */
export const encodeWorkId = (workId) => {
  if (!workId) return '';
  return encodeURIComponent(workId.trim());
};

const handleResponse = async (res) => {
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(`API Error [${res.status}]: ${errorDetail}`);
  }
  return res.json();
};

export const api = {
  /**
   * Health check heartbeat
   */
  health: async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    return handleResponse(res);
  },

  // ==================================================
  // WORKSPACE LIFECYCLE API
  // ==================================================

  /**
   * List all workspaces
   */
  getWorkspaces: async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces`);
    return handleResponse(res);
  },

  /**
   * Create a new workspace session
   * @param {Object} payload - { name, description }
   */
  createWorkspace: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  /**
   * Get single workspace metadata
   * @param {string} workspaceId
   */
  getWorkspace: async (workspaceId) => {
    const res = await fetch(`${BASE_URL}/api/workspaces/${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Seed / Reset baseline Demo Workspace
   */
  loadDemoWorkspace: async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/demo`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  /**
   * Clear dataset inside a workspace
   * @param {string} workspaceId
   */
  clearWorkspaceDataset: async (workspaceId) => {
    const res = await fetch(`${BASE_URL}/api/workspaces/${encodeURIComponent(workspaceId)}/clear`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  /**
   * Delete historical workspace completely
   * @param {string} workspaceId
   */
  deleteWorkspace: async (workspaceId) => {
    const res = await fetch(`${BASE_URL}/api/workspaces/${encodeURIComponent(workspaceId)}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // ==================================================
  // INGESTION & ML EXECUTION
  // ==================================================

  /**
   * Upload CSV datasets for automated cleaning and ingestion
   * @param {string} workspaceId
   * @param {FormData} formData
   */
  uploadDataset: async (workspaceId, formData) => {
    const res = await fetch(`${BASE_URL}/api/workspaces/${encodeURIComponent(workspaceId)}/upload`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  },

  /**
   * Run synchronous ML anomaly scoring & statutory rule engine
   * @param {string} workspaceId
   */
  runAnalysis: async (workspaceId) => {
    const res = await fetch(`${BASE_URL}/api/workspaces/${encodeURIComponent(workspaceId)}/analyze`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // ==================================================
  // CONTEXTUAL DECISION SUPPORT ENDPOINTS
  // ==================================================

  /**
   * Overview KPI metrics
   * @param {string} workspaceId
   */
  getKpis: async (workspaceId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const res = await fetch(`${BASE_URL}/api/overview/kpis?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Dynamic Implementing Agency (IDA) Concentration
   * @param {string} workspaceId
   */
  getIdaDistribution: async (workspaceId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const res = await fetch(`${BASE_URL}/api/overview/ida-distribution?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Filtered, paginated risk queue
   * @param {string} workspaceId
   * @param {Object} params - { page, page_size, category, severity, search }
   */
  getRiskQueue: async (workspaceId, params = {}) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const q = new URLSearchParams();
    q.set('workspace_id', workspaceId);
    if (params.page) q.set('page', params.page);
    if (params.page_size) q.set('page_size', params.page_size);
    if (params.category && params.category !== 'ALL') q.set('category', params.category);
    if (params.severity && params.severity !== 'ALL') q.set('severity', params.severity);
    if (params.search && params.search.trim()) q.set('search', params.search.trim());

    const res = await fetch(`${BASE_URL}/api/projects/risk-queue?${q.toString()}`);
    return handleResponse(res);
  },

  /**
   * Project Intelligence deep dive
   * @param {string} workspaceId
   * @param {string} workId - Raw work ID (will be URL-encoded)
   */
  getIntelligence: async (workspaceId, workId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const encoded = encodeWorkId(workId);
    const res = await fetch(`${BASE_URL}/api/projects/${encoded}/intelligence?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Get investigation case status
   * @param {string} workspaceId
   * @param {string} workId
   */
  getInvestigation: async (workspaceId, workId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const encoded = encodeWorkId(workId);
    const res = await fetch(`${BASE_URL}/api/projects/${encoded}/investigation?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Post official investigation action
   * @param {string} workspaceId
   * @param {string} workId
   * @param {Object} payload - { action, details, actor }
   */
  postInvestigationAction: async (workspaceId, workId, payload) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const encoded = encodeWorkId(workId);
    const res = await fetch(`${BASE_URL}/api/projects/${encoded}/investigation-action?workspace_id=${encodeURIComponent(workspaceId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  /**
   * Get all investigation notes for a work
   * @param {string} workspaceId
   * @param {string} workId
   */
  getNotes: async (workspaceId, workId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const encoded = encodeWorkId(workId);
    const res = await fetch(`${BASE_URL}/api/projects/${encoded}/notes?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Post new investigation note
   * @param {string} workspaceId
   * @param {string} workId
   * @param {Object} payload - { note_text, officer_name }
   */
  postNote: async (workspaceId, workId, payload) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const encoded = encodeWorkId(workId);
    const res = await fetch(`${BASE_URL}/api/projects/${encoded}/notes?workspace_id=${encodeURIComponent(workspaceId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  /**
   * Paginated system audit logs
   * @param {string} workspaceId
   * @param {Object} params - { page, page_size, work_id, action_type }
   */
  getAuditLogs: async (workspaceId, params = {}) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const q = new URLSearchParams();
    q.set('workspace_id', workspaceId);
    if (params.page) q.set('page', params.page);
    if (params.page_size) q.set('page_size', params.page_size);
    if (params.work_id && params.work_id.trim()) q.set('work_id', params.work_id.trim());
    if (params.action_type && params.action_type.trim()) q.set('action_type', params.action_type.trim());

    const res = await fetch(`${BASE_URL}/api/audit-logs?${q.toString()}`);
    return handleResponse(res);
  },

  /**
   * Clear session audit logs
   * @param {string} workspaceId
   */
  clearAuditLogs: async (workspaceId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const res = await fetch(`${BASE_URL}/api/audit-logs?workspace_id=${encodeURIComponent(workspaceId)}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  /**
   * Download official PDF forensic dossier for a work
   * @param {string} workspaceId
   * @param {string} workId
   */
  downloadProjectPdf: async (workspaceId, workId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const encoded = encodeWorkId(workId);
    const res = await fetch(`${BASE_URL}/api/projects/${encoded}/pdf?workspace_id=${encodeURIComponent(workspaceId)}`);
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errJson = await res.json();
        if (errJson && errJson.detail) errorDetail = errJson.detail;
      } catch {
        // ignore
      }
      throw new Error(`PDF Export Failed [${res.status}]: ${errorDetail}`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanId = workId.replace(/[^a-zA-Z0-9_\-]+/g, '_');
    a.download = `MPLADS_Intelligence_Report_${cleanId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Proactive Early Warning Signals
   * @param {string} workspaceId
   */
  getEarlyWarnings: async (workspaceId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const res = await fetch(`${BASE_URL}/api/overview/early-warnings?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Contractor Intelligence aggregation
   * @param {string} workspaceId
   */
  getContractors: async (workspaceId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const res = await fetch(`${BASE_URL}/api/contractors?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * District & Implementing Agency Cross-tabulation Matrix
   * @param {string} workspaceId
   */
  getDistrictIdaMatrix: async (workspaceId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const res = await fetch(`${BASE_URL}/api/matrix/district-ida?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Alias for getDistrictIdaMatrix
   */
  getDistrictMatrix: async (workspaceId) => {
    return api.getDistrictIdaMatrix(workspaceId);
  },

  /**
   * Alias for postInvestigationAction
   */
  createInvestigationAction: async (workspaceId, workId, payload) => {
    return api.postInvestigationAction(workspaceId, workId, {
      action: payload.action_type || payload.action || 'REVIEW',
      details: payload.notes || payload.details || 'Investigation action updated',
      actor: payload.officer_name || payload.actor || 'State Nodal Officer'
    });
  },

  /**
   * Traceable Data Lineage for a specific work
   * @param {string} workspaceId
   * @param {string} workId
   */
  getDataLineage: async (workspaceId, workId) => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const encoded = encodeWorkId(workId);
    const res = await fetch(`${BASE_URL}/api/lineage/${encoded}?workspace_id=${encodeURIComponent(workspaceId)}`);
    return handleResponse(res);
  },

  /**
   * Download Executive Command Summary PDF
   * @param {string} workspaceId
   * @param {string} workspaceName
   */
  downloadExecutivePdf: async (workspaceId, workspaceName = 'Workspace') => {
    if (!workspaceId) throw new Error('Active workspace_id is required');
    const res = await fetch(`${BASE_URL}/api/reports/executive/pdf?workspace_id=${encodeURIComponent(workspaceId)}`);
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errJson = await res.json();
        if (errJson && errJson.detail) errorDetail = errJson.detail;
      } catch {
        // ignore
      }
      throw new Error(`Executive PDF Export Failed [${res.status}]: ${errorDetail}`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = workspaceName.replace(/[^a-zA-Z0-9_\-]+/g, '_');
    a.download = `MPLADS_Executive_Report_${cleanName}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
