import React from 'react';
import { SearchX, RefreshCcw } from 'lucide-react';

export const EmptyState = ({
  title = 'No Projects Found',
  message = 'No records match the selected category, severity band, or search keyword.',
  onClear
}) => {
  return (
    <div
      className="card"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-4)',
        background: 'var(--color-surface-card)',
        borderColor: 'var(--color-border-subtle)'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--color-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-3)',
          border: '1px solid var(--color-border-strong)'
        }}
      >
        <SearchX size={24} color="var(--color-text-muted)" />
      </div>
      <h3 className="text-section" style={{ fontSize: '15px', marginBottom: 'var(--space-1)' }}>
        {title}
      </h3>
      <p className="text-caption" style={{ maxWidth: '400px', marginBottom: onClear ? 'var(--space-4)' : 0 }}>
        {message}
      </p>
      {onClear && (
        <button onClick={onClear} className="btn btn-secondary btn-sm flex items-center gap-2">
          <RefreshCcw size={13} />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
};
