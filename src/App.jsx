import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AnalyzePage from './components/AnalyzePage';
import ResultsPage from './components/ResultsPage';
import ReportsPage from './components/ReportsPage';
import QuizComponent from './components/QuizComponent';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('assesment');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentResults, setCurrentResults] = useState(null);

  const handlePageChange = (pageName) => {
    setCurrentPage(pageName);
  };

  const handleAnalysisComplete = (results) => {
    setCurrentResults(results);
    setCurrentPage('results');
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="main-content">
        {currentPage === 'analyze' && (
          <AnalyzePage 
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}
        {currentPage === 'results' && (
          <ResultsPage results={currentResults} />
        )}
        {currentPage === 'assesment' && (
          <QuizComponent onPageChange={handlePageChange} />
        )}
        {currentPage === 'reports' && (
          <ReportsPage />
        )}
      </div>
    </div>
  );
}

export default App;