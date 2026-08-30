import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Confirm Investigation Action',
  description = 'This administrative action will update project status and record a permanent entry in the official audit trail.',
  actionKey,
  onConfirm,
  onClose,
  isSubmitting = false
}) => {
  const [details, setDetails] = useState('');
  const [actor, setActor] = useState('State Nodal Officer (Punjab)');

  useEffect(() => {
    if (isOpen) {
      setDetails('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const isDetailsValid = details.trim().length >= 15;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isDetailsValid || isSubmitting) return;
    onConfirm({ details: details.trim(), actor: actor.trim() });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div className="modal-title" id="modal-title">
            <AlertTriangle size={18} color="var(--color-high)" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ padding: '4px', color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="text-body" style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              {description}
            </p>

            <div className="form-group">
              <label className="form-label">
                Official Action Reason / Justification <span style={{ color: 'var(--color-critical-text)' }}>*</span>
              </label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Enter mandatory justification details (minimum 15 characters)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
              <div className="flex-between text-caption" style={{ marginTop: '2px' }}>
                <span style={{ color: isDetailsValid ? 'var(--color-normal-text)' : 'var(--color-text-muted)' }}>
                  {details.trim().length} / 15 chars minimum
                </span>
                {!isDetailsValid && (
                  <span style={{ color: 'var(--color-critical-text)' }}>Required for audit compliance</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Officer In-Charge Name</label>
              <input
                type="text"
                className="input"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isDetailsValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Recording Audit Entry...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Confirm Action</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
