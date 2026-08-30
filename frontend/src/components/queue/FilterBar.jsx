import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { CATEGORY_OPTIONS, SEVERITY_OPTIONS } from '../../api/constants';

export const FilterBar = ({
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // 300ms debounced search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange('search', searchInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const handleReset = () => {
    setSearchInput('');
    onResetFilters();
  };

  return (
    <div 
      style={{ 
        padding: '14px 18px', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'var(--shadow-card)',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div className="flex-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} color="var(--color-accent-teal)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Filter &amp; Search Intelligence Queue
          </span>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-ghost btn-sm flex items-center gap-1"
          style={{ color: 'var(--color-text-secondary)', fontSize: '11.5px', padding: '2px 6px' }}
        >
          <RotateCcw size={11} />
          <span>Reset</span>
        </button>
      </div>

      {/* 4 Form Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, 1.2fr) minmax(130px, 1.2fr) minmax(160px, 2.5fr) minmax(80px, 0.7fr)', gap: '10px', alignItems: 'center', width: '100%', minWidth: 0 }}>
        {/* Category Filter */}
        <div style={{ minWidth: 0 }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '9.5px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sector / Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              padding: '0 8px',
              fontSize: '12px',
              outline: 'none',
              minWidth: 0
            }}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Band Filter */}
        <div style={{ minWidth: 0 }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '9.5px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Risk Severity Band
          </label>
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange('severity', e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              padding: '0 8px',
              fontSize: '12px',
              outline: 'none',
              minWidth: 0
            }}
          >
            {SEVERITY_OPTIONS.map((sev) => (
              <option key={sev.value} value={sev.value}>
                {sev.value === 'ALL' ? 'All Risk Levels' : sev.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Query */}
        <div style={{ minWidth: 0 }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '9.5px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Search Query
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
            <Search size={13} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search Work ID, description, or agency..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                padding: '0 10px 0 30px',
                fontSize: '12px',
                outline: 'none',
                minWidth: 0
              }}
            />
          </div>
        </div>

        {/* Rows Per Page */}
        <div style={{ minWidth: 0 }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '9.5px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Rows / Page
          </label>
          <select
            value={filters.page_size}
            onChange={(e) => onFilterChange('page_size', Number(e.target.value))}
            style={{
              width: '100%',
              height: '36px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              padding: '0 8px',
              fontSize: '12px',
              outline: 'none',
              minWidth: 0
            }}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
};
