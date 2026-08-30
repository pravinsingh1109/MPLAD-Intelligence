import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange
}) => {
  if (totalRecords === 0) return null;

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalRecords);

  // Generate numbered pages list (up to 5 page numbers + ellipsis)
  const renderPageButtons = () => {
    const pages = [];
    const maxVisible = 5;
    const effectiveTotal = Math.max(totalPages, 1);

    for (let i = 1; i <= Math.min(maxVisible, effectiveTotal); i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center gap-1.5">
        <button
          className="btn btn-ghost btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ 
            width: '32px', 
            height: '32px', 
            padding: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '6px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            color: page <= 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)'
          }}
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p) => {
          const isActive = p === page;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: isActive ? 800 : 500,
                background: isActive ? 'var(--color-accent-teal)' : 'var(--color-surface-elevated)',
                color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                border: `1px solid ${isActive ? 'var(--color-accent-teal)' : 'var(--color-border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p}
            </button>
          );
        })}

        {effectiveTotal > maxVisible && (
          <span style={{ padding: '0 4px', color: 'var(--color-text-muted)', fontSize: '12px' }}>...</span>
        )}

        <button
          className="btn btn-ghost btn-sm"
          disabled={page >= effectiveTotal}
          onClick={() => onPageChange(page + 1)}
          style={{ 
            width: '32px', 
            height: '32px', 
            padding: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '6px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            color: page >= effectiveTotal ? 'var(--color-text-muted)' : 'var(--color-text-primary)'
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex-between items-center" style={{ padding: '12px 4px 0' }}>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Showing {startRecord} to {endRecord} of {totalRecords} results
      </div>

      {renderPageButtons()}
    </div>
  );
};
