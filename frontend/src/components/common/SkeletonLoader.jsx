import React from 'react';

export const SkeletonLoader = ({ rows = 3, height = '24px', width = '100%', style = {} }) => {
  return (
    <div className="flex-col gap-2" style={{ width: '100%' }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{
            height,
            width: Array.isArray(width) ? width[idx % width.length] : width,
            ...style
          }}
        />
      ))}
    </div>
  );
};
