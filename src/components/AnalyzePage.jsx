import React, { useState, useRef } from 'react';
import UploadZone from './UploadZone';
import ImagePreview from './ImagePreview';
import LoadingSpinner from './LoadingSpinner';
import '../styles/AnalyzePage.css';

const AnalyzePage = ({ uploadedImages, setUploadedImages, onAnalysisComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    const imagePromises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setUploadedImages(images);
    });
  };

  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  const analyzeImages = () => {
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const diagnoses = ['Normal', 'Bacterial Pneumonia', 'Viral Pneumonia'];
      const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
      const confidence = (85 + Math.random() * 13).toFixed(1);

      const results = {
        image: uploadedImages[0],
        diagnosis: diagnosis,
        confidence: confidence
      };

      setIsLoading(false);
      onAnalysisComplete(results);
    }, 3000);
  };

  return (
    <div className="page-content active" id="analyze">
      <div className="page-header">
        <h1 className="page-title">Analyze X-Ray Images</h1>
        <p className="page-description">
          Upload chest X-ray images for AI-powered pneumonia detection. 
          Our advanced neural network provides rapid, accurate analysis to assist medical professionals.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">
          <span>📤</span>
          Upload Medical Images
        </h2>
        
        <UploadZone 
          onFilesSelected={handleFiles}
          fileInputRef={fileInputRef}
        />

        {uploadedImages.length > 0 && (
          <ImagePreview 
            images={uploadedImages}
            onRemoveImage={removeImage}
          />
        )}

        <button 
          className="analyze-btn"
          onClick={analyzeImages}
          disabled={uploadedImages.length === 0 || isLoading}
        >
          {isLoading ? 'Analyzing...' : '🔬 Analyze Images'}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <LoadingSpinner isActive={isLoading} />
    </div>
  );
};

export default AnalyzePage;