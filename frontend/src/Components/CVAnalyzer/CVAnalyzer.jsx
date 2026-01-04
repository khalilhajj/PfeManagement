import React, { useState } from 'react';
import { analyzeCv } from '../../api';
import './CVAnalyzer.css';

const CVAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CV file first');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await analyzeCv(file);
      setAnalysis(response.analysis);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.response?.data?.message ||
        'Failed to analyze CV. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-analyzer-container">
      <div className="cv-analyzer-card">
        <h1 className="title">📄 AI CV Analyzer</h1>
        <p className="subtitle">
          Upload your CV and get AI-powered insights on what to keep, remove, and improve
        </p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="cv-file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="cv-file" className="file-label">
              {file ? (
                <span>✓ {file.name}</span>
              ) : (
                <span>📎 Choose PDF File</span>
              )}
            </label>
          </div>

          <button 
            type="submit" 
            disabled={!file || loading}
            className="analyze-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              '🚀 Analyze CV'
            )}
          </button>
        </form>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {loading && (
          <div className="loading-info">
            <p>🤖 AI is analyzing your CV with LLaMA 2...</p>
            <p className="loading-subtext">This may take 30-60 seconds</p>
          </div>
        )}

        {analysis && (
          <div className="analysis-results">
            <h2 className="results-title">Analysis Results</h2>

            <div className="result-section keep-section">
              <h3>✅ What to KEEP</h3>
              <ul>
                {analysis.keep.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="result-section remove-section">
              <h3>❌ What to REMOVE</h3>
              <ul>
                {analysis.remove.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="result-section improve-section">
              <h3>💡 What to IMPROVE</h3>
              <ul>
                {analysis.improve.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVAnalyzer;
