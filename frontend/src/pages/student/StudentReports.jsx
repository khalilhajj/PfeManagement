import React, { useState, useEffect } from 'react';
import {
  getMyReports,
  getReportDetail,
  createReport,
  uploadReportVersion,
  submitVersionForReview,
  resolveComment
} from '../../api';
import './StudentReports.css';

const StudentReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [createFormData, setCreateFormData] = useState({
    internship: '',
    title: '',
    description: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyReports();
      setReports(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid file (PDF, DOC, or DOCX)');
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      setFilePreview({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type
      });
      setError('');
    }
  };

  const openCreateModal = () => {
    setCreateFormData({
      internship: '',
      title: '',
      description: ''
    });
    setError('');
    setShowCreateModal(true);
  };

  const openUploadModal = (report) => {
    setSelectedReport(report);
    setSelectedFile(null);
    setFilePreview(null);
    setError('');
    setShowUploadModal(true);
  };

  const openDetailModal = async (report) => {
    setActionLoading(true);
    try {
      const detailData = await getReportDetail(report.id);
      setSelectedReport(detailData);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report details');
    } finally {
      setActionLoading(false);
    }
  };

  const closeAllModals = () => {
    setShowCreateModal(false);
    setShowUploadModal(false);
    setShowDetailModal(false);
    setSelectedReport(null);
    setSelectedFile(null);
    setFilePreview(null);
    setError('');
    setUploadProgress(0);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await createReport(createFormData);
      setSuccessMessage(response.message || 'Report created successfully!');
      await fetchReports();
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(errorData?.error || 'Failed to create report');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadVersion = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    setUploadProgress(0);

    try {
      const response = await uploadReportVersion(selectedReport.id, selectedFile);
      setSuccessMessage(response.message || 'Version uploaded successfully!');
      await fetchReports();
      
      // Refresh the report detail
      if (showDetailModal) {
        const updatedReport = await getReportDetail(selectedReport.id);
        setSelectedReport(updatedReport);
      }
      
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(errorData?.error || 'Failed to upload version');
      }
    } finally {
      setActionLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmitForReview = async (versionId) => {
    if (!window.confirm('Submit this version for teacher review?')) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await submitVersionForReview(versionId);
      setSuccessMessage(response.message || 'Version submitted for review!');
      
      // Refresh report detail
      if (selectedReport) {
        const updatedReport = await getReportDetail(selectedReport.id);
        setSelectedReport(updatedReport);
      }
      
      await fetchReports();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit version');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveComment = async (commentId) => {
    setActionLoading(true);
    setError('');

    try {
      await resolveComment(commentId);
      
      // Refresh report detail
      const updatedReport = await getReportDetail(selectedReport.id);
      setSelectedReport(updatedReport);
      
      setSuccessMessage('Comment marked as resolved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resolve comment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'badge-draft', icon: 'fa-file', text: 'Draft' },
      pending: { class: 'badge-pending', icon: 'fa-clock', text: 'Pending Review' },
      approved: { class: 'badge-approved', icon: 'fa-check-circle', text: 'Approved' },
      rejected: { class: 'badge-rejected', icon: 'fa-times-circle', text: 'Needs Revision' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`badge ${config.class}`}>
        <i className={`fas ${config.icon}`}></i> {config.text}
      </span>
    );
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
      return <i className="fas fa-file-pdf" style={{ color: '#dc3545' }}></i>;
    } else if (extension === 'doc' || extension === 'docx') {
      return <i className="fas fa-file-word" style={{ color: '#2b579a' }}></i>;
    }
    return <i className="fas fa-file"></i>;
  };

  if (loading) {
    return (
      <div className="student-reports-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-reports-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1><i className="fas fa-file-alt"></i> My Reports</h1>
          <p>Manage your internship reports and versions</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="fas fa-plus"></i> Create New Report
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {/* Reports Grid */}
      <div className="reports-grid">
        {reports.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-file-alt"></i>
            <h3>No Reports Yet</h3>
            <p>Create your first report to get started</p>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <i className="fas fa-plus"></i> Create Report
            </button>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-card-header">
                <h3>{report.title}</h3>
                {report.is_final && (
                  <span className="badge badge-final">
                    <i className="fas fa-trophy"></i> Final
                  </span>
                )}
              </div>

              <div className="report-card-body">
                <div className="report-info">
                  <p><strong>Internship:</strong> {report.internship_title}</p>
                  <p><strong>Total Versions:</strong> {report.total_versions}</p>
                  {report.final_grade && (
                    <p><strong>Grade:</strong> {report.final_grade}/20</p>
                  )}
                </div>

                {report.current_version && (
                  <div className="current-version">
                    <h4>Current Version: v{report.current_version.version_number}</h4>
                    {getStatusBadge(report.current_version.status)}
                    
                    {report.current_version.unresolved_comments_count > 0 && (
                      <div className="comments-badge">
                        <i className="fas fa-comment"></i>
                        {report.current_version.unresolved_comments_count} unresolved comments
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="report-card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openDetailModal(report)}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
                
                {!report.is_final && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => openUploadModal(report)}
                  >
                    <i className="fas fa-upload"></i> Upload Version
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-plus"></i> Create New Report</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateReport}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
                  </div>
                )}

                <div className="form-group">
                  <label>Internship ID <span className="required">*</span></label>
                  <input
                    type="number"
                    name="internship"
                    value={createFormData.internship}
                    onChange={handleCreateInputChange}
                    required
                    placeholder="Enter internship ID"
                  />
                  <small>Enter the ID of your approved internship</small>
                </div>

                <div className="form-group">
                  <label>Report Title <span className="required">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={createFormData.title}
                    onChange={handleCreateInputChange}
                    required
                    maxLength={255}
                    placeholder="Enter report title"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={createFormData.description}
                    onChange={handleCreateInputChange}
                    rows={4}
                    placeholder="Enter report description (optional)"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Create Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Version Modal */}
      {showUploadModal && selectedReport && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-upload"></i> Upload New Version</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleUploadVersion}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
                  </div>
                )}

                <div className="upload-info">
                  <p><strong>Report:</strong> {selectedReport.title}</p>
                  <p><strong>Next Version:</strong> v{selectedReport.total_versions + 1}</p>
                </div>

                <div className="form-group">
                  <label>Select File <span className="required">*</span></label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx"
                    required
                  />
                  <small>PDF, DOC, or DOCX. Maximum 50MB</small>
                </div>

                {filePreview && (
                  <div className="file-preview">
                    <div className="file-icon-large">
                      {getFileIcon(filePreview.name)}
                    </div>
                    <div className="file-info">
                      <p><strong>{filePreview.name}</strong></p>
                      <p>Size: {filePreview.size}</p>
                    </div>
                  </div>
                )}

                {uploadProgress > 0 && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p>{uploadProgress}%</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading || !selectedFile}
                >
                  {actionLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload"></i>
                      Upload Version
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Detail Modal - Continue in next file... */}
      {showDetailModal && selectedReport && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-file-alt"></i> {selectedReport.title}</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Report Info */}
              <div className="report-detail-section">
                <h3>Report Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Internship:</span>
                    <span className="detail-value">{selectedReport.internship_title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Versions:</span>
                    <span className="detail-value">{selectedReport.total_versions}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {selectedReport.is_final ? (
                        <span className="badge badge-final">
                          <i className="fas fa-trophy"></i> Final
                        </span>
                      ) : (
                        <span className="badge badge-in-progress">
                          <i className="fas fa-clock"></i> In Progress
                        </span>
                      )}
                    </span>
                  </div>
                  {selectedReport.final_grade && (
                    <div className="detail-item">
                      <span className="detail-label">Final Grade:</span>
                      <span className="detail-value grade-display">
                        {selectedReport.final_grade}/20
                      </span>
                    </div>
                  )}
                  {selectedReport.description && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value">{selectedReport.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Versions List */}
              <div className="report-detail-section">
                <h3>Version History</h3>
                
                {selectedReport.versions && selectedReport.versions.length > 0 ? (
                  <div className="versions-list">
                    {selectedReport.versions.map(version => (
                      <div key={version.id} className={`version-item ${version.is_final ? 'final-version' : ''}`}>
                        <div className="version-header">
                          <div className="version-title">
                            <h4>
                              Version {version.version_number}
                              {version.is_final && (
                                <span className="badge badge-final-small">
                                  <i className="fas fa-trophy"></i> Final
                                </span>
                              )}
                            </h4>
                            {getStatusBadge(version.status)}
                          </div>
                          
                          <div className="version-actions">
                            {version.file && (
                              <a
                                href={`${BACKEND_URL}${version.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-icon btn-download"
                                title="Download"
                              >
                                <i className="fas fa-download"></i>
                              </a>
                            )}
                            
                            {version.status === 'draft' && (
                              <button
                                className="btn btn-icon btn-submit"
                                onClick={() => handleSubmitForReview(version.id)}
                                disabled={actionLoading}
                                title="Submit for Review"
                              >
                                <i className="fas fa-paper-plane"></i>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="version-details">
                          <div className="version-meta">
                            {version.file && (
                              <span>
                                {getFileIcon(version.file)}
                                <strong>{version.file.split('/').pop()}</strong>
                                ({version.file_size} MB)
                              </span>
                            )}
                            <span>
                              <i className="fas fa-calendar"></i>
                              Created: {new Date(version.created_at).toLocaleString('en-GB')}
                            </span>
                            {version.submitted_at && (
                              <span>
                                <i className="fas fa-paper-plane"></i>
                                Submitted: {new Date(version.submitted_at).toLocaleString('en-GB')}
                              </span>
                            )}
                            {version.reviewed_at && (
                              <span>
                                <i className="fas fa-user-check"></i>
                                Reviewed by {version.reviewed_by_name} on{' '}
                                {new Date(version.reviewed_at).toLocaleString('en-GB')}
                              </span>
                            )}
                          </div>

                          {/* Comments Section */}
                          {version.comments && version.comments.length > 0 && (
                            <div className="comments-section">
                              <h5>
                                <i className="fas fa-comments"></i>
                                Teacher Comments ({version.comments.length})
                              </h5>
                              
                              <div className="comments-list">
                                {version.comments.map(comment => (
                                  <div
                                    key={comment.id}
                                    className={`comment-item ${comment.is_resolved ? 'resolved' : ''}`}
                                  >
                                    <div className="comment-header">
                                      <div>
                                        <strong>{comment.teacher_name}</strong>
                                        <span className="comment-date">
                                          {new Date(comment.created_at).toLocaleString('en-GB')}
                                        </span>
                                      </div>
                                      
                                      {!comment.is_resolved && (
                                        <button
                                          className="btn btn-xs btn-resolve"
                                          onClick={() => handleResolveComment(comment.id)}
                                          disabled={actionLoading}
                                        >
                                          <i className="fas fa-check"></i> Resolve
                                        </button>
                                      )}
                                      
                                      {comment.is_resolved && (
                                        <span className="resolved-badge">
                                          <i className="fas fa-check-circle"></i> Resolved
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="comment-body">
                                      {comment.page_number && (
                                        <span className="page-ref">
                                          <i className="fas fa-file-alt"></i> Page {comment.page_number}
                                        </span>
                                      )}
                                      {comment.section && (
                                        <span className="section-ref">
                                          <i className="fas fa-bookmark"></i> {comment.section}
                                        </span>
                                      )}
                                      <p>{comment.comment}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {version.comments_count === 0 && version.status === 'pending' && (
                            <div className="no-comments">
                              <i className="fas fa-clock"></i>
                              <p>Waiting for teacher review...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-small">
                    <i className="fas fa-inbox"></i>
                    <p>No versions uploaded yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeAllModals}>
                Close
              </button>
              {!selectedReport.is_final && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    closeAllModals();
                    setTimeout(() => openUploadModal(selectedReport), 100);
                  }}
                >
                  <i className="fas fa-upload"></i> Upload New Version
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReports;