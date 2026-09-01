export const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : ''
);

export const CATEGORY_OPTIONS = [
  'ALL',
  'Normal/Others',
  'Roads & Bridges',
  'Education & Schools',
  'Health & Sanitation',
  'Drinking Water'
];

export const SEVERITY_OPTIONS = [
  'ALL',
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'NORMAL',
  'ML_ANOMALY'
];

// Maps backend severity_band string -> CSS badge class
export const BAND_TO_CLASS = {
  'CRITICAL RISK PRIORITY': 'badge-critical',
  'HIGH RISK PRIORITY':     'badge-high',
  'MEDIUM RISK PRIORITY':   'badge-medium',
  'NORMAL RISK':            'badge-normal',
};

// Maps short severity code (from feature evidence matrix) -> CSS badge class
export const SEVERITY_SHORT_TO_CLASS = {
  'CRITICAL': 'badge-critical',
  'HIGH':     'badge-high',
  'MEDIUM':   'badge-medium',
  'NORMAL':   'badge-normal',
};

// Maps score value (0-100) -> CSS score-pill class
export const scoreClass = (score) => {
  if (score >= 80) return 'score-critical';
  if (score >= 60) return 'score-high';
  if (score >= 40) return 'score-medium';
  return 'score-normal';
};

// Maps sanction_delay_days -> color text class
export const delayClass = (days) => {
  if (days > 120) return 'text-critical';
  if (days > 75) return 'text-high';
  return '';
};

// Audited baseline constants for Ludhiana constituency
export const CONSTITUENCY_INFO = {
  name: 'LUDHIANA (07)',
  state: 'Punjab',
  mpName: 'AMRINDER SINGH RAJA WARRING',
  auditVersion: '2026-v2.1',
  problemId: 'SIH26102'
};

// Static IDA distribution (audited breakdown from dataset)
export const IDA_DISTRIBUTION = [
  { name: 'Ludhiana DC IDA', count: 206, percentage: 93.64, outlay_cr: 7.89, risk: 'HIGH' },
  { name: 'Sri Muktsar Sahib IDA', count: 11, percentage: 5.00, outlay_cr: 0.52, risk: 'NORMAL' },
  { name: 'Jalandhar IDA', count: 1, percentage: 0.45, outlay_cr: 0.05, risk: 'NORMAL' },
  { name: 'Ferozepur IDA', count: 1, percentage: 0.45, outlay_cr: 0.03, risk: 'NORMAL' },
  { name: 'Fazilka IDA', count: 1, percentage: 0.45, outlay_cr: 0.03, risk: 'NORMAL' }
];

// Static Category distribution breakdown
export const CATEGORY_DISTRIBUTION = [
  { category: 'Normal/Others', count: 185, outlay_cr: 7.21, percentage: 84.1 },
  { category: 'Roads & Bridges', count: 18, outlay_cr: 0.74, percentage: 8.2 },
  { category: 'Education & Schools', count: 9, outlay_cr: 0.32, percentage: 4.1 },
  { category: 'Health & Sanitation', count: 5, outlay_cr: 0.18, percentage: 2.3 },
  { category: 'Drinking Water', count: 3, outlay_cr: 0.07, percentage: 1.4 }
];
