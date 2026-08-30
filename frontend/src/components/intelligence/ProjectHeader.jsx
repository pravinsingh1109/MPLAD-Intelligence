import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Tag, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

export const ProjectHeader = ({ work = {} }) => {
  const navigate = useNavigate();
  const { activeWorkspaceId, showToast } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!work || !work.id || !activeWorkspaceId) return;

    try {
      setIsDownloading(true);
      showToast('Generating official PDF forensic dossier...', 'info');
      await api.downloadProjectPdf(activeWorkspaceId, work.id);
      showToast('PDF report downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to download PDF report.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const isCritical = work?.severity_band?.includes('CRITICAL');
  const isHigh = work?.severity_band?.includes('HIGH');

  return (
    <div 
      style={{ 
        padding: '20px 24px', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Top Action Bar */}
      <div className="flex-between items-center flex-wrap gap-2">
        <button
          onClick={() => navigate('/queue')}
          className="btn btn-ghost btn-sm flex items-center gap-1.5"
          style={{ padding: '0', color: 'var(--color-accent-teal)', fontSize: '12.5px', fontWeight: 600 }}
        >
          <ArrowLeft size={14} />
          <span>Back to Risk Queue</span>
        </button>

        <div className="flex items-center gap-3">
          <span 
            className="badge" 
            style={{ 
              fontSize: '10.5px', 
              fontWeight: 800, 
              padding: '3px 10px',
              borderRadius: '9999px',
              background: isCritical ? 'var(--color-critical-bg)' : (isHigh ? 'var(--color-high-bg)' : 'var(--color-normal-bg)'),
              border: `1px solid ${isCritical ? 'var(--color-critical-border)' : (isHigh ? 'var(--color-high-border)' : 'var(--color-normal-border)')}`,
              color: isCritical ? 'var(--color-critical-text)' : (isHigh ? 'var(--color-high-text)' : 'var(--color-normal-text)')
            }}
          >
            {work.severity_band || 'CRITICAL'}
          </span>
          
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="btn-cyan-cta flex items-center gap-1.5"
            style={{ 
              padding: '6px 16px', 
              fontSize: '12px',
              fontWeight: 700
            }}
            title="Download Official Forensic PDF Report"
          >
            {isDownloading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} strokeWidth={2.5} />
            )}
            <span>{isDownloading ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Title Section */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '4px' }}>
          Project Intelligence Dashboard
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {work.id}
        </h1>
      </div>

      {/* Metadata Row */}
      <div 
        className="flex items-center gap-5 flex-wrap" 
        style={{ 
          fontSize: '12px',
          color: 'var(--color-text-secondary)', 
          borderTop: '1px solid var(--color-border-subtle)', 
          paddingTop: '12px' 
        }}
      >
        <div className="flex items-center gap-1.5">
          <MapPin size={13} color="var(--color-accent-teal)" />
          <span>{work.district || 'Ludhiana'}, {work.state || 'Punjab'} ({work.constituency || 'Ludhiana'})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Building2 size={13} color="var(--color-text-muted)" />
          <span title={work.ida}>{(work.ida || 'DEPUTY COMMISSIONER LUDHIANA').replace(/_IDA\)?$/, '').replace(/^\(/, '')}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Tag size={13} color="var(--color-text-muted)" />
          <span>Category: <strong style={{ color: 'var(--color-text-primary)' }}>{work.category || 'Normal/Others'}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} color="var(--color-normal-text)" />
          <span>Status: <strong style={{ color: 'var(--color-text-primary)' }}>{work.status || 'Completed'}</strong></span>
        </div>
      </div>
    </div>
  );
};
