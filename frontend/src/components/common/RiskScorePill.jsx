import React from 'react';
import { scoreClass } from '../../api/constants';

export const RiskScorePill = ({ score }) => {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;
  const pillClass = scoreClass(numericScore);

  return (
    <span className={`score-pill ${pillClass}`}>
      {numericScore.toFixed(1)}
    </span>
  );
};
