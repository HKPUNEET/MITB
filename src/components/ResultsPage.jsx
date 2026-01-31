import React, { useEffect, useRef } from 'react';
import '../styles/ResultsPage.css';

const ResultsPage = ({ results }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (results) {
      generateHeatmap();
    }
  }, [results]);

  const generateHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !results) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Create heatmap overlay
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simulate heatmap (in real app, this would be from your model)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const hotspotRadius = canvas.width / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < hotspotRadius && results.diagnosis !== 'Normal') {
          const intensity = (1 - distance / hotspotRadius) * 0.6;
          data[i] = Math.min(255, data[i] + 255 * intensity);
          data[i + 1] = Math.max(0, data[i + 1] - 100 * intensity);
          data[i + 2] = Math.max(0, data[i + 2] - 100 * intensity);
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };
    
    img.src = results.image;
  };

  if (!results) {
    return (
      <div className="page-content active">
        <div className="page-header">
          <h1 className="page-title">Analysis Results</h1>
          <p className="page-description">
            View detailed AI analysis results and diagnostic insights
          </p>
        </div>
        <div className="card">
          <div className="no-results">
            <div className="no-results-icon">🔬</div>
            <h3>No Analysis Yet</h3>
            <p>Upload and analyze images to see results here</p>
          </div>
        </div>
      </div>
    );
  }

  const diagnosisClass = 
    results.diagnosis === 'Normal' ? 'diagnosis-normal' : 
    results.diagnosis === 'Bacterial Pneumonia' ? 'diagnosis-bacterial' : 
    'diagnosis-viral';

  return (
    <div className="page-content active">
      <div className="page-header">
        <h1 className="page-title">Analysis Results</h1>
        <p className="page-description">
          AI-powered diagnostic analysis completed
        </p>
      </div>

      <div className="results-grid">
        <div className="card">
          <h2 className="card-title">
            <span>🖼️</span>
            Original Image
          </h2>
          <div className="result-image-container">
            <img 
              id="originalImage" 
              src={results.image} 
              alt="Original X-Ray" 
              className="result-image"
            />
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">
            <span>🔥</span>
            AI Heatmap Analysis
          </h2>
          <div className="result-image-container">
            <canvas ref={canvasRef} className="heatmap-canvas"></canvas>
          </div>
          <p className="heatmap-note">
            Red areas indicate regions of concern identified by the AI model
          </p>
        </div>

        <div className="card diagnosis-card">
          <h2 className="card-title">
            <span>⚕️</span>
            Diagnosis
          </h2>
          <div className="diagnosis-content">
            <span className={`diagnosis-badge ${diagnosisClass}`}>
              {results.diagnosis}
            </span>
            
            <h4 style={{ margin: '1rem 0 0.5rem' }}>Confidence Level</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${results.confidence}%` }}
                  ></div>
                </div>
              </div>
              <div className="confidence-percentage">
                {results.confidence}%
              </div>
            </div>
            
            <div className="recommendation-box">
              <h4>📌 Recommendation</h4>
              <p>
                {results.diagnosis === 'Normal' 
                  ? 'No signs of pneumonia detected. Continue routine monitoring.' 
                  : 'Suspected pneumonia detected. Immediate doctor review recommended for confirmation and treatment plan.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;