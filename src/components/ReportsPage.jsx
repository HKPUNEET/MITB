import React, { useState, useRef } from 'react';
import '../styles/ReportsPage.css';

const ReportsPage = () => {
  const [uploadedReport, setUploadedReport] = useState(null);
  const fileInputRef = useRef(null);

  const handleReportUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedReport({
        name: file.name,
        uploadDate: new Date().toLocaleString()
      });
    }
  };

  return (
    <div className="page-content active">
      <div className="page-header">
        <h1 className="page-title">Medical Reports</h1>
        <p className="page-description">
          Upload and manage medical reports for comprehensive patient analysis
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">
          <span>📎</span>
          Upload Report
        </h2>
        <div 
          className="upload-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📄</div>
          <div className="upload-text">
            <strong>Click to upload</strong> medical reports
          </div>
          <div className="upload-subtext">
            PDF, DOC, DOCX files supported
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx"
          onChange={handleReportUpload}
        />
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">📊 Report Summary</h2>
        <div id="reportSummary">
          {!uploadedReport ? (
            <div className="no-reports">
              <p>No reports uploaded yet</p>
            </div>
          ) : (
            <div className="report-info">
              <h4>📄 {uploadedReport.name}</h4>
              <p className="upload-date">Uploaded: {uploadedReport.uploadDate}</p>
              <div className="report-summary-box">
                <h5>Summary</h5>
                <p>
                  Report analysis would appear here. In a production system, this would extract 
                  key information from the uploaded medical report document.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;