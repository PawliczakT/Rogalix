import React from 'react';

const LoadingSpinner = ({ size = 48 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#1976d2"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
      />
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  </div>
);

export default LoadingSpinner;
