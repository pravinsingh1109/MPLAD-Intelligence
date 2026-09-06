import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { ProjectHeader } from '../components/intelligence/ProjectHeader';
import { ScoreBreakdown } from '../components/intelligence/ScoreBreakdown';
import { ExecutiveSummary } from '../components/intelligence/ExecutiveSummary';
import { RuleSignalsPanel } from '../components/intelligence/RuleSignalsPanel';
import { FeatureEvidenceMatrix } from '../components/intelligence/FeatureEvidenceMatrix';
import { ForensicChronology } from '../components/intelligence/ForensicChronology';
import { ProjectMetadata } from '../components/intelligence/ProjectMetadata';
import { InvestigationWorkspace } from '../components/intelligence/InvestigationWorkspace';
import { InvestigationNotes } from '../components/intelligence/InvestigationNotes';
import { ErrorCard } from '../components/common/ErrorCard';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { Database, Sparkles } from 'lucide-react';

export const IntelligencePage = () => {
  const params = useParams();
  const location = useLocation();
  const rawId = params.workId || params['*'] || location.pathname.replace(/^\/project\/?/, '');
  const decodedId = decodeURIComponent(rawId || '').trim();

  const { activeWorkspaceId, setLastViewedProjectId, loadDemo } = useApp();
  const navigate = useNavigate();

  const [work, setWork] = useState(null);
  const [investigationCase, setInvestigationCase] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjectData = useCallback(async () => {
    if (!decodedId || !activeWorkspaceId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [intelRes, caseRes, notesRes] = await Promise.all([
        api.getIntelligence(activeWorkspaceId, decodedId),
        api.getInvestigation(activeWorkspaceId, decodedId).catch(() => null),
        api.getNotes(activeWorkspaceId, decodedId).catch(() => [])
      ]);
      setWork(intelRes);
      setInvestigationCase(caseRes);
      setNotes(notesRes || []);
      
      const canonicalId = intelRes.id || intelRes.work_id || decodedId;
      setLastViewedProjectId(canonicalId);
      // If work was accessed via an alias like LD-2023-089, smoothly update URL to canonical ID
      if (decodedId !== canonicalId && decodedId.toUpperCase().startsWith('LD-')) {
        navigate(`/project/${encodeURIComponent(canonicalId)}`, { replace: true });
      }
    } catch (err) {
      console.error('Failed to load project intelligence:', err);
      setError(err.message || `Work ID "${decodedId}" not found in active workspace.`);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, decodedId, setLastViewedProjectId, navigate]);

  useEffect(() => {
    if (!decodedId && activeWorkspaceId) {
      setIsLoading(true);
      api.getRiskQueue(activeWorkspaceId, { page: 1, pageSize: 1, sort: 'desc' })
        .then((queueRes) => {
          if (queueRes && queueRes.items && queueRes.items.length > 0) {
            const topId = queueRes.items[0].id || queueRes.items[0].work_id;
            navigate(`/project/${encodeURIComponent(topId)}`, { replace: true });
          } else {
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      fetchProjectData();
    }
  }, [decodedId, activeWorkspaceId, fetchProjectData, navigate]);

  const handleLoadTopProject = async () => {
    if (!activeWorkspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const queueRes = await api.getRiskQueue(activeWorkspaceId, { page: 1, pageSize: 1, sort: 'desc' });
      if (queueRes && queueRes.items && queueRes.items.length > 0) {
        const topId = queueRes.items[0].id || queueRes.items[0].work_id;
        navigate(`/project/${encodeURIComponent(topId)}`);
      } else {
        setError('No projects available in the current workspace.');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch top project.');
      setIsLoading(false);
    }
  };

  // Refresh case status after an action
  const handleActionSuccess = async () => {
    if (!activeWorkspaceId || !decodedId) return;
    try {
      const updatedCase = await api.getInvestigation(activeWorkspaceId, decodedId);
      setInvestigationCase(updatedCase);
    } catch (err) {
      console.error('Failed to refresh case:', err);
    }
  };

  // Refresh notes after a new note is added
  const handleNoteAdded = async () => {
    if (!activeWorkspaceId || !decodedId) return;
    try {
      const updatedNotes = await api.getNotes(activeWorkspaceId, decodedId);
      setNotes(updatedNotes || []);
    } catch (err) {
      console.error('Failed to refresh notes:', err);
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
          Select or load a workspace to review deep project intelligence records.
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

  if (isLoading) {
    return (
      <div className="flex-col gap-4" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div className="card"><SkeletonLoader rows={2} height="30px" /></div>
        <div className="grid-2">
          <div className="card"><SkeletonLoader rows={4} height="35px" /></div>
          <div className="card"><SkeletonLoader rows={4} height="35px" /></div>
        </div>
        <div className="card"><SkeletonLoader rows={6} height="25px" /></div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="flex-col gap-4" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <ErrorCard
          title="Project Intelligence Record Unavailable"
          message={error || `Work ID "${decodedId}" could not be retrieved.`}
          onRetry={fetchProjectData}
        />
        <div className="flex items-center gap-3">
          <button onClick={handleLoadTopProject} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Open Top Flagged Project</span>
          </button>
          <button onClick={() => navigate('/queue')} className="btn btn-secondary btn-sm">
            ← Return to Risk Queue
          </button>
        </div>
      </div>
    );
  }

  const explanation = work.explanation || {};
  const matrix = explanation.feature_evidence_matrix || explanation.feature_evidence || [];
  const ruleSignals = work.rule_signals || [];

  return (
    <div className="flex-col gap-4" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 1. Project Master Header */}
      <ProjectHeader work={work} />

      {/* 2. Top Decision Area: Risk Score Attribution & Executive Narrative */}
      <div className="grid-2" style={{ alignItems: 'stretch' }}>
        <ScoreBreakdown work={work} />
        <ExecutiveSummary explanation={explanation} />
      </div>

      {/* 3. Statutory Compliance Signals */}
      <RuleSignalsPanel ruleSignals={ruleSignals} />

      {/* 4. Multivariate Feature Evidence Matrix */}
      <FeatureEvidenceMatrix matrix={matrix} explanation={explanation} work={work} />

      {/* 5. Lifecycle Chronology & Operational Action Workspace */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <ForensicChronology work={work} />
        <InvestigationWorkspace
          work={work}
          workId={work.id}
          investigationCase={investigationCase}
          onActionSuccess={handleActionSuccess}
          onUpdate={handleActionSuccess}
        />
      </div>

      {/* 6. Technical Parameters & Investigation Notes */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <ProjectMetadata work={work} />
        <InvestigationNotes
          workId={work.id}
          notes={notes}
          onNoteAdded={handleNoteAdded}
        />
      </div>
    </div>
  );
};
