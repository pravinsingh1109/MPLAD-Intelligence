import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

export const ErrorCard = ({ title = 'Failed to Load Data', message, onRetry }) => {
  return (
    <div
      className="card"
      style={{
        background: 'var(--color-critical-bg)',
        borderColor: 'var(--color-critical-border)',
        padding: 'var(--space-5)'
      }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
        <AlertOctagon size={20} color="var(--color-critical-text)" />
        <h3 className="text-section" style={{ color: 'var(--color-critical-text)', fontSize: '15px' }}>
          {title}
        </h3>
      </div>
      <p className="text-body" style={{ color: 'var(--color-text-primary)', marginBottom: onRetry ? 'var(--space-4)' : 0 }}>
        {message || 'An unexpected error occurred while communicating with the backend API service.'}
      </p>
      {onRetry && (
        <div>
          <button onClick={onRetry} className="btn btn-danger btn-sm flex items-center gap-2">
            <RotateCw size={13} />
            <span>Retry Request</span>
          </button>
        </div>
      )}
    </div>
  );
};
