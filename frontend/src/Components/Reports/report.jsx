import React, { useState, useEffect } from 'react';
import { getMyReports } from '../../api';
import './reports.css';

const Report = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch all final reports (public archive)
                const data = await getMyReports();
                
                // Filter only final reports for archive
                const finalReports = data.filter(report => report.is_final === true);
                setReports(finalReports);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch archived reports');
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        // Search filter
        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch = !searchLower || 
            report.title?.toLowerCase().includes(searchLower) ||
            report.internship_title?.toLowerCase().includes(searchLower) ||
            report.student_name?.toLowerCase().includes(searchLower);
        
        // Grade filter
        let matchesFilter = true;
        const hasGrade = report.final_grade !== null && report.final_grade !== undefined;
        
        if (filterStatus === 'graded') {
            matchesFilter = hasGrade;
        } else if (filterStatus === 'ungraded') {
            matchesFilter = !hasGrade;
        } else if (filterStatus === 'passed') {
            matchesFilter = hasGrade && parseFloat(report.final_grade) >= 10;
        } else if (filterStatus === 'failed') {
            matchesFilter = hasGrade && parseFloat(report.final_grade) < 10;
        } else if (filterStatus === 'excellent') {
            matchesFilter = hasGrade && parseFloat(report.final_grade) >= 16;
        }
        
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            
            return date.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const getFileIcon = (fileName) => {
        if (!fileName || typeof fileName !== 'string') return 'fa-file';
        
        const parts = fileName.split('.');
        if (parts.length < 2) return 'fa-file';
        
        const extension = parts[parts.length - 1].toLowerCase();
        
        const iconMap = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'xls': 'fa-file-excel',
            'xlsx': 'fa-file-excel',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'png': 'fa-file-image',
            'gif': 'fa-file-image'
        };
        
        return iconMap[extension] || 'fa-file';
    };

    const sanitizeUrl = (url) => {
        if (!url || typeof url !== 'string') return '#';
        
        // Ensure URL starts with expected backend URL
        if (!url.startsWith('/') && !url.startsWith('http')) {
            return '#';
        }
        
        // If it's a relative path, prepend backend URL
        if (url.startsWith('/')) {
            return `${BACKEND_URL}${url}`;
        }
        
        // If it's an absolute URL, verify it's from our backend
        try {
            const urlObj = new URL(url);
            const backendUrlObj = new URL(BACKEND_URL);
            
            if (urlObj.origin === backendUrlObj.origin) {
                return url;
            }
        } catch (e) {
            console.error('Invalid URL:', e);
        }
        
        return '#';
    };

    const getGradeBadge = (grade) => {
        if (grade === null || grade === undefined) {
            return <span className="grade-badge ungraded">Not Graded</span>;
        }
        
        const gradeNum = parseFloat(grade);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) {
            return <span className="grade-badge ungraded">Invalid Grade</span>;
        }
        
        if (gradeNum >= 16) {
            return <span className="grade-badge excellent">{gradeNum.toFixed(2)}/20</span>;
        } else if (gradeNum >= 14) {
            return <span className="grade-badge good">{gradeNum.toFixed(2)}/20</span>;
        } else if (gradeNum >= 10) {
            return <span className="grade-badge pass">{gradeNum.toFixed(2)}/20</span>;
        } else {
            return <span className="grade-badge fail">{gradeNum.toFixed(2)}/20</span>;
        }
    };

    const sanitizeText = (text, maxLength = 150) => {
        if (!text || typeof text !== 'string') return 'No description available';
        
        // Remove HTML tags using a safer approach
        // Limit input length first to prevent ReDoS
        const limitedText = text.substring(0, Math.min(text.length, 10000));
        
        // Simple character whitelist approach instead of regex
        let sanitized = '';
        let inTag = false;
        
        for (let i = 0; i < limitedText.length; i++) {
            const char = limitedText[i];
            if (char === '<') {
                inTag = true;
            } else if (char === '>') {
                inTag = false;
            } else if (!inTag) {
                sanitized += char;
            }
        }
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        if (sanitized.length <= maxLength) return sanitized;
        return sanitized.substring(0, maxLength) + '...';
    };

    const calculateAverageGrade = () => {
        const gradedReports = reports.filter(r => r.final_grade !== null && r.final_grade !== undefined);
        if (gradedReports.length === 0) return 'N/A';
        
        const sum = gradedReports.reduce((acc, r) => {
            const grade = parseFloat(r.final_grade);
            return isNaN(grade) ? acc : acc + grade;
        }, 0);
        
        const average = sum / gradedReports.length;
        return isNaN(average) ? 'N/A' : average.toFixed(2);
    };

    return (
        <div className="report-container">
            <div className="report-header">
                <h1><i className="fas fa-archive"></i> Archived Reports</h1>
                <p>Browse completed and graded internship reports from all students</p>
            </div>

            {/* Controls Section */}
            <div className="report-controls">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by title, internship, or student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        maxLength={100}
                        aria-label="Search reports"
                    />
                </div>
                
                <div className="filter-controls">
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        aria-label="Filter by grade"
                    >
                        <option value="all">All Reports</option>
                        <option value="excellent">Excellent (≥16)</option>
                        <option value="graded">Graded</option>
                        <option value="ungraded">Not Graded</option>
                        <option value="passed">Passed (≥10)</option>
                        <option value="failed">Failed (&lt;10)</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading archived reports...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="error-state">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            )}

            {/* Reports Grid */}
            {!loading && !error && (
                <div className="reports-grid">
                    {filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-folder-open"></i>
                            <h3>No Archived Reports</h3>
                            <p>
                                {reports.length === 0 
                                    ? 'No finalized reports available yet'
                                    : 'No reports match your search criteria'}
                            </p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div key={report.id} className="report-card">
                                <div className="card-header-section">
                                    <div className="report-badge">
                                        <i className="fas fa-trophy"></i>
                                        Final
                                    </div>
                                    {getGradeBadge(report.final_grade)}
                                </div>

                                <div className="report-main-info">
                                    <h3 title={report.title}>
                                        {sanitizeText(report.title, 60)}
                                    </h3>
                                    
                                    {/* Student Info */}
                                    {report.student_name && (
                                        <div className="student-badge">
                                            <i className="fas fa-user-graduate"></i>
                                            <span>{sanitizeText(report.student_name, 40)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="report-meta">
                                        <span className="meta-item">
                                            <i className="fas fa-briefcase"></i>
                                            {sanitizeText(report.internship_title, 40)}
                                        </span>
                                        <span className="meta-item">
                                            <i className="fas fa-calendar"></i>
                                            {formatDate(report.updated_at)}
                                        </span>
                                    </div>
                                </div>
                                
                                {report.description && (
                                    <div className="report-description">
                                        <p>{sanitizeText(report.description, 120)}</p>
                                    </div>
                                )}

                                {/* Final Version File Info */}
                                {report.approved_version?.file && (
                                    <div className="file-info-box">
                                        <div className="file-details">
                                            <i className={`fas ${getFileIcon(report.approved_version.file)}`}></i>
                                            <div className="file-text">
                                                <span className="file-name">
                                                    {report.approved_version.file.split('/').pop()}
                                                </span>
                                                {report.approved_version.file_size && (
                                                    <span className="file-size">
                                                        {report.approved_version.file_size} MB
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {report.approved_version.reviewed_by_name && (
                                            <div className="reviewer-info">
                                                <i className="fas fa-user-check"></i>
                                                <span>{sanitizeText(report.approved_version.reviewed_by_name, 30)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="report-actions">
                                    {report.approved_version?.file && (
                                        <a 
                                            href={sanitizeUrl(report.approved_version.file)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="download-btn"
                                            onClick={(e) => {
                                                const url = sanitizeUrl(report.approved_version.file);
                                                if (url === '#') {
                                                    e.preventDefault();
                                                    alert('Invalid file URL');
                                                }
                                            }}
                                            aria-label={`Download ${report.title}`}
                                        >
                                            <i className="fas fa-download"></i>
                                            Download Report
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Summary */}
            {!loading && !error && filteredReports.length > 0 && (
                <div className="report-summary">
                    <div className="summary-stats">
                        <span>
                            <i className="fas fa-archive"></i>
                            Showing {filteredReports.length} of {reports.length} archived reports
                        </span>
                        {reports.filter(r => r.final_grade !== null).length > 0 && (
                            <span>
                                <i className="fas fa-star"></i>
                                Average Grade: {calculateAverageGrade()}/20
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report;