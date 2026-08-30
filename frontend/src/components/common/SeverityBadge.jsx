import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { BAND_TO_CLASS, SEVERITY_SHORT_TO_CLASS } from '../../api/constants';

export const SeverityBadge = ({ band, showIcon = true, size = 'md' }) => {
  if (!band) return null;

  const upperBand = String(band).toUpperCase().trim();
  
  // Resolve class name
  let badgeClass = BAND_TO_CLASS[upperBand] || SEVERITY_SHORT_TO_CLASS[upperBand] || 'badge-neutral';
  
  // Resolve short display label
  let label = upperBand;
  if (upperBand.includes('CRITICAL')) label = 'CRITICAL';
  else if (upperBand.includes('HIGH')) label = 'HIGH';
  else if (upperBand.includes('MEDIUM')) label = 'MEDIUM';
  else if (upperBand.includes('NORMAL')) label = 'NORMAL';

  const iconSize = size === 'sm' ? 10 : 12;

  const renderIcon = () => {
    if (!showIcon) return null;
    if (upperBand.includes('CRITICAL')) {
      return <AlertTriangle size={iconSize} strokeWidth={2.5} />;
    }
    if (upperBand.includes('HIGH')) {
      return <AlertTriangle size={iconSize} strokeWidth={2.5} />;
    }
    if (upperBand.includes('MEDIUM')) {
      return <AlertCircle size={iconSize} strokeWidth={2.5} />;
    }
    if (upperBand.includes('NORMAL')) {
      return <CheckCircle size={iconSize} strokeWidth={2.5} />;
    }
    return <Info size={iconSize} strokeWidth={2} />;
  };

  return (
    <span className={`badge ${badgeClass}`} style={size === 'sm' ? { fontSize: '10px', padding: '1px 5px' } : {}}>
      {renderIcon()}
      <span>{label}</span>
    </span>
  );
};
