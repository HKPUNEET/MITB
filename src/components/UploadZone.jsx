import React, { useState } from 'react';
import '../styles/UploadZone.css';

const UploadZone = ({ onFilesSelected, fileInputRef }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onFilesSelected(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="upload-icon">📁</div>
      <div className="upload-text">
        <strong>Click to upload</strong> or drag and drop
      </div>
      <div className="upload-subtext">
        JPEG, PNG, DICOM files supported
      </div>
    </div>
  );
};

export default UploadZone;