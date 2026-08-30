import React, { useState } from 'react';
import { ShieldAlert, ClipboardList } from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const InvestigationWorkspace = ({ 
  work = {}, 
  workId, 
  investigationCase, 
  onActionSuccess, 
  onUpdate 
}) => {
  const { activeWorkspaceId, showToast } = useApp();
  const [activeModal, setActiveModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveWorkId = workId || work?.id || work?.work_id || '';
  const currentStatus = investigationCase?.current_status || work?.investigation_status || 'UNDER REVIEW';
  const lastUpdated = (investigationCase?.updated_at || work?.updated_at)
    ? new Date(investigationCase?.updated_at || work?.updated_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : '29/08/2026, 14:19';

  const actionConfigs = {
    MARK_FOR_FIELD_VERIFICATION: {
      title: 'Initiate Formal Field Verification',
      description: `Are you sure you want to flag project ${effectiveWorkId} for physical site inspection and dispatch the audit team?`,
      newStatus: 'UNDER_INVESTIGATION'
    },
    REQUEST_NODAL_AGENCY_AUDIT: {
      title: 'Request Nodal Agency Audit',
      description: `Submit a formal demand for an administrative compliance audit to the State Nodal Department for project ${effectiveWorkId}?`,
      newStatus: 'UNDER_INVESTIGATION'
    },
    CLEAR_AFTER_REVIEW: {
      title: 'Clear Project After Review',
      description: `Mark project ${effectiveWorkId} as verified and cleared of all anomalous risk triggers?`,
      newStatus: 'RESOLVED'
    }
  };

  const handleConfirmAction = async (notes) => {
    if (!activeModal || !activeWorkspaceId || !effectiveWorkId) return;

    try {
      setIsSubmitting(true);
      const action = actionConfigs[activeModal];

      await api.postInvestigationAction(activeWorkspaceId, effectiveWorkId, {
        action: activeModal,
        details: notes || `Action triggered from Intelligence Dossier: ${action?.title || activeModal}`,
        actor: 'State Nodal Officer'
      });

      showToast(`Action "${action?.title || activeModal}" logged successfully!`, 'success');
      setActiveModal(null);
      if (onActionSuccess) onActionSuccess();
      if (onUpdate) onUpdate();
    } catch (err) {
      showToast(err.message || 'Failed to submit investigation action.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{ 
        padding: '20px 22px', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-border-subtle)', 
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header */}
      <div className="flex-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} color="var(--color-accent-teal)" />
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Operator Investigation Workspace
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
          Administrative Authority
        </span>
      </div>

      {/* Current Official Decision Status */}
      <div
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Current Case Status
          </span>
          <div style={{ marginTop: '3px' }}>
            <span 
              style={{ 
                fontSize: '10.5px', 
                fontWeight: 800, 
                padding: '3px 9px', 
                borderRadius: '6px',
                background: 'var(--color-accent-teal-glow)',
                border: '1px solid var(--color-border-accent)',
                color: 'var(--color-accent-teal)'
              }}
            >
              {currentStatus}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Last Updated</span>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {lastUpdated}
          </div>
        </div>
      </div>

      {/* Action Trigger Buttons */}
      <div className="flex-col gap-2">
        <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Authorized Administrative Actions
        </span>

        {/* Action 1: Start Formal Verification */}
        <button
          onClick={() => setActiveModal('MARK_FOR_FIELD_VERIFICATION')}
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
        >
          <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '12.5px' }}>
            <ClipboardList size={14} color="var(--color-accent-teal)" />
            <span>Start Formal Verification</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Dispatch CA/ADA Wing
          </span>
        </button>

        {/* Action 2: Request Nodal Agency Audit */}
        <button
          onClick={() => setActiveModal('REQUEST_NODAL_AGENCY_AUDIT')}
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
        >
          <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '12.5px' }}>
            <ClipboardList size={14} color="var(--color-accent-teal)" />
            <span>Request Nodal Agency Audit</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Scan Planning Dept
          </span>
        </button>

        {/* Action 3: Clear Project After Review */}
        <button
          onClick={() => setActiveModal('CLEAR_AFTER_REVIEW')}
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
        >
          <div className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '12.5px' }}>
            <ClipboardList size={14} color="var(--color-accent-teal)" />
            <span>Clear Project After Review</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Close Case
          </span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {activeModal && (
        <ConfirmModal
          isOpen={Boolean(activeModal)}
          title={actionConfigs[activeModal]?.title || 'Confirm Action'}
          description={actionConfigs[activeModal]?.description || ''}
          actionKey={activeModal}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmAction}
          onCancel={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};
