import React, { useState, useRef } from 'react';
import '../styles/ReportsPage.css';

const ReportsPage = ({ onPageChange }) => {
  const [uploadedReport, setUploadedReport] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastApiCall, setLastApiCall] = useState(0);
  const fileInputRef = useRef(null);

  // Rate limiting: wait at least 10 seconds between API calls
  const RATE_LIMIT_DELAY = 10000;

  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedReport({
        name: file.name,
        uploadDate: new Date().toLocaleString()
      });
      
      // Start analysis
      await analyzeReport(file);
    }
  };

  const analyzeReport = async (file) => {
    setIsAnalyzing(true);
    
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    
    if (timeSinceLastCall < RATE_LIMIT_DELAY) {
      const waitTime = Math.ceil((RATE_LIMIT_DELAY - timeSinceLastCall) / 1000);
      setAnalysisResult(`Rate limit protection: Please wait ${waitTime} seconds before making another request.`);
      setIsAnalyzing(false);
      return;
    }
    
    setLastApiCall(now);
    
    try {
      // Read file content
      const fileData = await readFileContent(file);
      console.log('File content read successfully');
      
      // Call Gemini API
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('API Key available:', !!apiKey);
      console.log('API Key length:', apiKey?.length);
      console.log('Making API call...');
      
      if (!apiKey) {
        setAnalysisResult('API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
        setIsAnalyzing(false);
        return;
      }
      
      let requestBody;
      
      if (fileData.type === 'pdf') {
        // For PDFs, send as base64
        requestBody = {
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: fileData.mimeType,
                  data: fileData.data
                }
              },
              {
                text: `\n\nAnalyze this medical report PDF and provide a structured summary in the following format:
              
              **ABNORMALITIES:**
              - List any abnormal findings like fever, chest pain, breathing difficulties, etc.
              - Include duration and severity if mentioned
              
              **RISK FACTORS:**
              - Identify any risk factors like asthma, COPD, smoking, etc.
              - Note any chronic conditions
              
              **PNEUMONIA INDICATORS:**
              - Assess if there are signs suggesting pneumonia
              - Mention specific symptoms or findings
              
              **RECOMMENDATIONS:**
              - If pneumonia is suspected, recommend: "Check and diagnose with X-ray"
              - Include any other relevant recommendations`
              }
            ]
          }]
        };
      } else {
        // For text files, send as text
        requestBody = {
          contents: [{
            parts: [{
              text: `Analyze this medical report and provide a structured summary in the following format:
              
              **ABNORMALITIES:**
              - List any abnormal findings like fever, chest pain, breathing difficulties, etc.
              - Include duration and severity if mentioned
              
              **RISK FACTORS:**
              - Identify any risk factors like asthma, COPD, smoking, etc.
              - Note any chronic conditions
              
              **PNEUMONIA INDICATORS:**
              - Assess if there are signs suggesting pneumonia
              - Mention specific symptoms or findings
              
              **RECOMMENDATIONS:**
              - If pneumonia is suspected, recommend: "Check and diagnose with X-ray"
              - Include any other relevant recommendations
              
              Report text: ${fileData.data}`
            }]
          }]
        };
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        setAnalysisResult(data.candidates[0].content.parts[0].text);
      }
    } catch (error) {
      console.error('Error analyzing report:', error);
      setAnalysisResult('Error analyzing report. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      console.log('Reading file:', file.name);
      console.log('File type:', file.type);
      console.log('File size:', file.size, 'bytes');
      
      // Handle PDF files differently
      if (file.type === 'application/pdf') {
        // For PDFs, we need to read as base64 and send to Gemini
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target.result.split(',')[1]; // Remove data URL prefix
          console.log('PDF read as base64, length:', base64Data.length);
          resolve({
            type: 'pdf',
            data: base64Data,
            mimeType: 'application/pdf'
          });
        };
        reader.onerror = (error) => {
          console.error('PDF FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(file);
      } else {
        // For text files, read as text and tokenize
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          console.log('Text file content length:', content.length);
          const tokenizedContent = tokenizeMedicalText(content);
          console.log('Tokenized content preview:', tokenizedContent.substring(0, 500) + '...');
          resolve({
            type: 'text',
            data: tokenizedContent
          });
        };
        reader.onerror = (error) => {
          console.error('Text FileReader error:', error);
          reject(error);
        };
        reader.readAsText(file);
      }
    });
  };

  const tokenizeMedicalText = (text) => {
    // Medical tokenization - extract meaningful medical terms and patterns
    let tokenized = text;
    
    // Normalize medical abbreviations and terms
    const medicalAbbreviations = {
      'bp': 'blood pressure',
      'hr': 'heart rate',
      'rr': 'respiratory rate',
      'temp': 'temperature',
      'wbc': 'white blood cell',
      'rbc': 'red blood cell',
      'cxr': 'chest x-ray',
      'ct': 'computed tomography',
      'mri': 'magnetic resonance imaging',
      'ecg': 'electrocardiogram',
      'ekg': 'electrocardiogram'
    };
    
    // Replace abbreviations with full terms
    Object.entries(medicalAbbreviations).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      tokenized = tokenized.replace(regex, full);
    });
    
    // Extract and highlight medical measurements
    tokenized = tokenized.replace(
      /(\d+(?:\.\d+)?\s*(?:mmhg|bpm|°f|°c|mg\/dl|\/mm|\/ul|%))/gi,
      'MEASUREMENT:$1'
    );
    
    // Extract medications
    tokenized = tokenized.replace(
      /\b(amoxicillin|azithromycin|levofloxacin|prednisone|albuterol|lisinopril|metoprolol|aspirin|ibuprofen|acetaminophen)\b/gi,
      'MEDICATION:$1'
    );
    
    // Extract symptoms
    const symptoms = [
      'cough', 'fever', 'chest pain', 'shortness of breath', 'dyspnea',
      'wheezing', 'fatigue', 'weakness', 'headache', 'nausea', 'vomiting',
      'diarrhea', 'constipation', 'dizziness', 'confusion', 'sore throat'
    ];
    
    symptoms.forEach(symptom => {
      const regex = new RegExp(`\\b${symptom}\\b`, 'gi');
      tokenized = tokenized.replace(regex, `SYMPTOM:${symptom}`);
    });
    
    // Extract conditions
    const conditions = [
      'pneumonia', 'asthma', 'copd', 'bronchitis', 'influenza', 'covid-19',
      'hypertension', 'diabetes', 'heart failure', 'arrhythmia', 'anemia'
    ];
    
    conditions.forEach(condition => {
      const regex = new RegExp(`\\b${condition}\\b`, 'gi');
      tokenized = tokenized.replace(regex, `CONDITION:${condition}`);
    });
    
    // Extract time patterns
    tokenized = tokenized.replace(
      /(\d+\s*(?:days?|weeks?|months?|years?|hours?))/gi,
      'DURATION:$1'
    );
    
    // Extract severity indicators
    tokenized = tokenized.replace(
      /\b(mild|moderate|severe|acute|chronic|stable|unstable)\b/gi,
      'SEVERITY:$1'
    );
    
    return tokenized;
  };

  const checkForPneumonia = (analysisText) => {
    const lowerText = analysisText.toLowerCase();
    console.log('Checking for pneumonia in:', lowerText);
    
    // Debug: Show first 500 characters to see formatting
    console.log('First 500 chars:', lowerText.substring(0, 500));
    
    // Check all possible variations of recommendations header
    const variations = [
      '**recommendations**:',
      '**recommendations:**',
      '** recommendations **:',
      '** recommendations :**',
      'recommendations:',
      'recommendations'
    ];
    
    console.log('Checking header variations:');
    variations.forEach(variant => {
      const found = lowerText.includes(variant);
      console.log(`  "${variant}": ${found}`);
    });
    
    // Extract the recommendations section specifically (try both formats)
    let recommendationsMatch = lowerText.match(/\*\*recommendations\*\*:([\s\S]*?)(?=\*\*|\*$|$)/i);
    if (!recommendationsMatch) {
      recommendationsMatch = lowerText.match(/\*\*recommendations:\*\*([\s\S]*?)(?=\*\*|\*$|$)/i);
    }
    const recommendationsText = recommendationsMatch ? recommendationsMatch[1] : '';
    
    console.log('Recommendations match:', recommendationsMatch);
    console.log('Recommendations section:', recommendationsText);
    
    // If regex fails, try a simpler approach (try both formats)
    if (!recommendationsText) {
      let altMatch = lowerText.split('**recommendations**:');
      if (altMatch.length === 1) {
        altMatch = lowerText.split('**recommendations:**');
      }
      if (altMatch.length === 1) {
        altMatch = lowerText.split('recommendations:');
      }
      if (altMatch.length > 1) {
        const afterRecommendations = altMatch[1];
        const nextSection = afterRecommendations.split('**')[0];
        const fallbackText = nextSection.trim();
        console.log('Fallback recommendations section:', fallbackText);
        
        // Look for pneumonia-related recommendations in fallback text
        const pneumoniaRecommendations = [
          'check and diagnose with x-ray',
          'x-ray recommended',
          'chest x-ray',
          'radiographic evaluation',
          'imaging recommended',
          'pneumonia treatment',
          'antibiotic therapy',
          'hospital admission',
          'oxygen therapy'
        ];
        
        const hasRecommendation = pneumoniaRecommendations.some(rec => {
          const found = fallbackText.includes(rec);
          if (found) console.log('Found pneumonia recommendation (fallback):', rec);
          return found;
        });
        
        console.log('Pneumonia detected (fallback):', hasRecommendation);
        return hasRecommendation;
      }
    }
    
    // Look for pneumonia-related recommendations
    const pneumoniaRecommendations = [
      'check and diagnose with x-ray',
      'x-ray recommended',
      'chest x-ray',
      'radiographic evaluation',
      'imaging recommended',
      'pneumonia treatment',
      'antibiotic therapy',
      'hospital admission',
      'oxygen therapy'
    ];
    
    // Look for explicit pneumonia diagnosis in other sections
    const explicitPneumonia = [
      'pneumonia detected',
      'pneumonia confirmed', 
      'pneumonia diagnosed',
      'consolidation detected',
      'consolidation present',
      'infiltrates detected',
      'infiltrates present'
    ];
    
    // Check recommendations for pneumonia-related actions
    const hasRecommendation = pneumoniaRecommendations.some(rec => {
      const found = recommendationsText.includes(rec);
      if (found) console.log('Found pneumonia recommendation:', rec);
      return found;
    });
    
    // Check for explicit pneumonia diagnosis
    const hasDiagnosis = explicitPneumonia.some(diagnosis => {
      const found = lowerText.includes(diagnosis);
      if (found) console.log('Found explicit pneumonia diagnosis:', diagnosis);
      return found;
    });
    
    // Look for negative indicators that rule out pneumonia
    const negativeIndicators = [
      'no pneumonia',
      'no evidence of pneumonia',
      'pneumonia ruled out',
      'unlikely pneumonia',
      'no imaging needed',
      'no x-ray required',
      'conservative management'
    ];
    
    const hasNegative = negativeIndicators.some(indicator => {
      const found = lowerText.includes(indicator);
      if (found) console.log('Found negative indicator:', indicator);
      return found;
    });
    
    // Detect pneumonia if: (has recommendation OR has diagnosis) AND no negative indicators
    const result = (hasRecommendation || hasDiagnosis) && !hasNegative;
    console.log('Pneumonia detected:', result);
    console.log('  - Has recommendation:', hasRecommendation);
    console.log('  - Has diagnosis:', hasDiagnosis);
    console.log('  - Has negative:', hasNegative);
    
    return result;
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
        <h2 className="card-title">📊 AI Analysis Summary</h2>
        <div id="reportSummary">
          {!uploadedReport ? (
            <div className="no-reports">
              <p>No reports uploaded yet</p>
            </div>
          ) : (
            <div className="report-info">
              <h4>📄 {uploadedReport.name}</h4>
              <p className="upload-date">Uploaded: {uploadedReport.uploadDate}</p>
              
              {isAnalyzing ? (
                <div className="analyzing">
                  <div className="spinner"></div>
                  <p>Analyzing report with AI...</p>
                </div>
              ) : analysisResult ? (
                <div className="ai-analysis">
                  <div className="analysis-header">
                    <h4>🤖 Medical Analysis Results</h4>
                  </div>
                  <div className="analysis-content">
                    {analysisResult.split('\n').map((line, index) => {
                      if (line.startsWith('**')) {
                        return <h5 key={index} className="analysis-section">{line.replace(/\*\*/g, '')}</h5>;
                      } else if (line.startsWith('-')) {
                        return <li key={index} className="analysis-item">{line.substring(1).trim()}</li>;
                      } else if (line.trim()) {
                        return <p key={index} className="analysis-text">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <div className="analysis-actions">
                    {checkForPneumonia(analysisResult) ? (
                      <div className="pneumonia-detected">
                        <p className="pneumonia-warning">⚠️ Pneumonia indicators detected</p>
                        <button className="analyze-images-btn pneumonia-btn" onClick={() => window.location.href = '#analyze'}>
                          🩻 Analyze with X-ray
                        </button>
                      </div>
                    ) : (
                      <div className="no-pneumonia">
                        <p className="no-pneumonia-text">✅ No pneumonia indicators detected - No imaging needed</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="report-summary-box">
                  <h5>Analysis Complete</h5>
                  <p>Report has been processed. AI analysis will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;