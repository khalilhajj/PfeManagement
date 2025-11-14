import React, { useState, useEffect } from 'react';
import {  getreports } from '../../api';
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
                const data = await getreports();
                setReports(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return 'fa-file-pdf';
        if (fileType?.includes('word') || fileType?.includes('doc')) return 'fa-file-word';
        if (fileType?.includes('excel') || fileType?.includes('xls')) return 'fa-file-excel';
        if (fileType?.includes('image')) return 'fa-file-image';
        return 'fa-file';
    };

    return (
        <div className="report-container">
            <div className="report-header">
                <h1><i className="fas fa-archive"></i> Archived Reports</h1>
                <p>Manage and access your archived reports</p>
            </div>

            {/* Controls Section */}
            <div className="report-controls">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-controls">
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading reports...</p>
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
                            <h3>No reports found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div key={report.id} className="report-card">
                                <div className="report-header">
                                    <div className="file-icon">
                                        <i className={`fas ${getFileIcon(report.file_type)}`}></i>
                                    </div>
                                    <div className="report-info">
                                        <h3>{report.name}</h3>
                                        <span className="report-date">
                                            {report.created_at ? formatDate(report.created_at) : 'Unknown date'}
                                        </span>
                                    </div>
                                    <div className="report-status">
                                        <span className={`status-badge ${report.status || 'archived'}`}>
                                            {report.status || 'Archived'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="report-description">
                                    <p>{report.description || 'No description available'}</p>
                                </div>
                                
                                <div className="report-actions">
                                    {report.file_path && (
                                        <a 
                                            href={`${BACKEND_URL}${report.file_path}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="download-btn"
                                        >
                                            <i className="fas fa-download"></i>
                                            Download
                                        </a>
                                    )}
                                    <button className="details-btn">
                                        <i className="fas fa-info-circle"></i>
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Summary */}
            {!loading && !error && filteredReports.length > 0 && (
                <div className="report-summary">
                    <p>Showing {filteredReports.length} of {reports.length} reports</p>
                </div>
            )}
        </div>
    );
};

export default Report;