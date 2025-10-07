import React from 'react';

/**
 * Loading spinner component with progress
 */
export function LoadingSpinner({ progress, message = "Loading customers..." }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-text">{message}</div>
      {progress && <div className="loading-progress">{progress}%</div>}
    </div>
  );
}
