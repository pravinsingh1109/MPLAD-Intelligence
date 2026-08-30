import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, User, Clock, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

export const AuditLogTable = ({
  logs = [],
  isLoading,
  onResetFilters
}) => {
  const navigate = useNavigate();

  const handleWorkClick = (workId) => {
    navigate(`/project/${encodeURIComponent(workId)}`);
  };

  const getActionBadgeClass = (actionType) => {
    if (actionType.includes('FIELD')) return 'badge-critical';
    if (actionType.includes('NODAL')) return 'badge-high';
    if (actionType.includes('CLEARED')) return 'badge-normal';
    if (actionType.includes('NOTE')) return 'badge-info';
    return 'badge-neutral';
  };

  if (!isLoading && (!logs || logs.length === 0)) {
    return (
      <EmptyState
        title="No Audit Log Records"
        message="No audit actions match the specified Work ID or Action Type filter criteria."
        onClear={onResetFilters}
      />
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'right' }}>#</th>
            <th style={{ width: '150px' }}>Timestamp</th>
            <th style={{ width: '220px' }}>Target Work ID</th>
            <th style={{ width: '210px' }}>Action Type</th>
            <th style={{ width: '200px' }}>Status Transition</th>
            <th style={{ width: '160px' }}>Officer / Actor</th>
            <th>Justification &amp; Details</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <tr key={idx}>
                <td colSpan={7} style={{ padding: '12px' }}>
                  <SkeletonLoader rows={1} height="22px" />
                </td>
              </tr>
            ))
          ) : (
            logs.map((log) => (
              <tr key={log.id}>
                {/* ID */}
                <td className="text-mono text-muted" style={{ textAlign: 'right' }}>
                  {log.id}
                </td>

                {/* Timestamp */}
                <td className="text-caption text-secondary" style={{ whiteSpace: 'nowrap' }}>
                  <div className="flex items-center gap-1">
                    <Clock size={11} color="var(--color-text-muted)" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </td>

                {/* Target Work ID Link */}
                <td className="text-mono" style={{ fontSize: '12px', fontWeight: 600 }}>
                  <button
                    type="button"
                    onClick={() => handleWorkClick(log.work_id)}
                    className="flex items-center gap-1"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent-teal)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      padding: 0
                    }}
                    title="Open Project Intelligence"
                  >
                    <span>{log.work_id}</span>
                    <ExternalLink size={11} />
                  </button>
                </td>

                {/* Action Type */}
                <td>
                  <span className={`badge ${getActionBadgeClass(log.action_type)}`} style={{ fontSize: '10px' }}>
                    {log.action_type}
                  </span>
                </td>

                {/* Status Transition */}
                <td>
                  <div className="flex items-center gap-1 text-caption">
                    <span className="text-muted">{log.previous_status || 'INITIAL'}</span>
                    <ArrowRight size={10} color="var(--color-text-muted)" />
                    <strong style={{ color: 'var(--color-text-primary)' }}>{log.new_status}</strong>
                  </div>
                </td>

                {/* Actor */}
                <td className="text-caption">
                  <div className="flex items-center gap-1">
                    <User size={11} color="var(--color-accent-blue)" />
                    <span>{log.actor}</span>
                  </div>
                </td>

                {/* Details */}
                <td className="text-caption" style={{ color: 'var(--color-text-secondary)', maxWidth: '300px' }} title={log.details}>
                  <div className="truncate">{log.details}</div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
