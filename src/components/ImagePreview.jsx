import React from 'react';
import '../styles/ImagePreview.css';

const ImagePreview = ({ images, onRemoveImage }) => {
  return (
    <div className="image-preview-container">
      {images.map((image, index) => (
        <div key={index} className="image-preview">
          <img src={image} className="preview-img" alt="X-Ray Preview" />
          <button 
            className="remove-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onRemoveImage(index);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;