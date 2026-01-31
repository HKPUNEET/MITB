import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="loading active">
      <div className="spinner"></div>
      <h3>Analyzing X-Ray Images...</h3>
      <p>Our AI is processing your medical images</p>
      <div className="loading-steps">
        <div className="step">✓ Image preprocessing</div>
        <div className="step">✓ Feature extraction</div>
        <div className="step active">⟳ Neural network analysis</div>
        <div className="step">○ Generating results</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;