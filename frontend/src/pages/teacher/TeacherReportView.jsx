import React, { useState, useEffect } from 'react';
import {
  getPendingVersions,
  getReportDetail,
  reviewVersion,
  addComment,
  assignFinalGrade
} from '../../api';
import './TeacherReportReview.css';

const TeacherReportReview = () => {
  const [pendingVersions, setPendingVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [actionLoading, setActionLoading] = useState(false);
  
  const [reviewFormData, setReviewFormData] = useState({
    action: 'approve',
    is_final: false,
    comment: ''
  });
  
  const [commentFormData, setCommentFormData] = useState({
    comment: '',
    page_number: '',
    section: ''
  });
  
  const [gradeFormData, setGradeFormData] = useState({
    final_grade: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPendingVersions();
  }, []);

  const fetchPendingVersions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPendingVersions();
      setPendingVersions(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pending versions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCommentInputChange = (e) => {
    const { name, value } = e.target;
    setCommentFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGradeInputChange = (e) => {
    const { name, value } = e.target;
    setGradeFormData(prev => ({ ...prev, [name]: value }));
  };

  const openReviewModal = (version) => {
    setSelectedVersion(version);
    setReviewFormData({
      action: 'approve',
      is_final: false,
      comment: ''
    });
    setError('');
    setShowReviewModal(true);
  };

  const openCommentModal = (version) => {
    setSelectedVersion(version);
    setCommentFormData({
      comment: '',
      page_number: '',
      section: ''
    });
    setError('');
    setShowCommentModal(true);
  };

  const openGradeModal = (report) => {
    setSelectedReport(report);
    setGradeFormData({
      final_grade: report.final_grade || ''
    });
    setError('');
    setShowGradeModal(true);
  };

  const openDetailModal = async (version) => {
    setActionLoading(true);
    try {
      const detailData = await getReportDetail(version.report);
      setSelectedReport(detailData);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report details');
    } finally {
      setActionLoading(false);
    }
  };

  const closeAllModals = () => {
    setShowReviewModal(false);
    setShowCommentModal(false);
    setShowGradeModal(false);
    setShowDetailModal(false);
    setSelectedVersion(null);
    setSelectedReport(null);
    setError('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await reviewVersion(
        selectedVersion.id,
        reviewFormData.action,
        reviewFormData.is_final,
        reviewFormData.comment
      );
      setSuccessMessage(response.message || 'Version reviewed successfully!');
      await fetchPendingVersions();
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object' && !errorData.error) {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(errorData?.error || 'Failed to review version');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const commentData = {
        comment: commentFormData.comment,
        page_number: commentFormData.page_number ? parseInt(commentFormData.page_number) : null,
        section: commentFormData.section || null
      };

      const response = await addComment(selectedVersion.id, commentData);
      setSuccessMessage(response.message || 'Comment added successfully!');
      await fetchPendingVersions();
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object' && !errorData.error) {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(errorData?.error || 'Failed to add comment');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const grade = parseFloat(gradeFormData.final_grade);
      
      if (isNaN(grade) || grade < 0 || grade > 20) {
        setError('Grade must be a number between 0 and 20');
        setActionLoading(false);
        return;
      }

      const response = await assignFinalGrade(selectedReport.id, grade);
      setSuccessMessage(response.message || 'Grade assigned successfully!');
      
      // Refresh detail if modal is open
      if (showDetailModal) {
        const updatedReport = await getReportDetail(selectedReport.id);
        setSelectedReport(updatedReport);
      }
      
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object' && !errorData.error) {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(errorData?.error || 'Failed to assign grade');
      }
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
      <div className="teacher-review-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading pending versions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-review-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1><i className="fas fa-clipboard-check"></i> Pending Reviews</h1>
          <p>Review student report submissions</p>
        </div>
        <div className="header-stats">
          <span className="stat-badge">
            <i className="fas fa-clock"></i>
            {pendingVersions.length} pending
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="fas fa-exclamation-circle"></i>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {/* Pending Versions List */}
      <div className="versions-container">
        {pendingVersions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <h3>No Pending Reviews</h3>
            <p>All report versions have been reviewed</p>
          </div>
        ) : (
          <div className="versions-list">
            {pendingVersions.map(version => (
              <div key={version.id} className="version-review-card">
                <div className="card-header">
                  <div className="version-info">
                    <h3>
                      {version.report.title}
                      <span className="version-number">v{version.version_number}</span>
                    </h3>
                    <p className="student-info">
                      <i className="fas fa-user"></i>
                      <strong>{version.report.student_name}</strong>
                    </p>
                  </div>
                  {getStatusBadge(version.status)}
                </div>

                <div className="card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <i className="fas fa-briefcase"></i>
                      <span>{version.report.internship_title}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-calendar"></i>
                      <span>Submitted: {new Date(version.submitted_at).toLocaleString('en-GB')}</span>
                    </div>
                    {version.file && (
                      <div className="info-item">
                        {getFileIcon(version.file)}
                        <span>{version.file.split('/').pop()} ({version.file_size} MB)</span>
                      </div>
                    )}
                    {version.comments_count > 0 && (
                      <div className="info-item">
                        <i className="fas fa-comments"></i>
                        <span>{version.comments_count} comments</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  {version.file && (
                    <a
                      href={`${BACKEND_URL}${version.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="fas fa-download"></i> Download
                    </a>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openDetailModal(version)}
                  >
                    <i className="fas fa-eye"></i> View Details
                  </button>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => openCommentModal(version)}
                  >
                    <i className="fas fa-comment"></i> Add Comment
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => openReviewModal(version)}
                  >
                    <i className="fas fa-clipboard-check"></i> Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVersion && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-clipboard-check"></i> Review Version</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-circle"></i>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
                  </div>
                )}

                <div className="review-info">
                  <p><strong>Report:</strong> {selectedVersion.report.title}</p>
                  <p><strong>Version:</strong> v{selectedVersion.version_number}</p>
                  <p><strong>Student:</strong> {selectedVersion.report.student_name}</p>
                </div>

                <div className="form-group">
                  <label>Decision <span className="required">*</span></label>
                  <select
                    name="action"
                    value={reviewFormData.action}
                    onChange={handleReviewInputChange}
                    required
                  >
                    <option value="approve">Approve</option>
                    <option value="reject">Reject (Needs Revision)</option>
                  </select>
                </div>

                {reviewFormData.action === 'approve' && (
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_final"
                        checked={reviewFormData.is_final}
                        onChange={handleReviewInputChange}
                      />
                      <span>Mark as Final Version</span>
                    </label>
                    <small>Check this if this is the final approved version</small>
                  </div>
                )}

                <div className="form-group">
                  <label>Review Comment</label>
                  <textarea
                    name="comment"
                    value={reviewFormData.comment}
                    onChange={handleReviewInputChange}
                    rows={5}
                    placeholder="Add your review comments here..."
                    maxLength={5000}
                  />
                  <small>Optional feedback for the student</small>
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
                  className={`btn ${reviewFormData.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${reviewFormData.action === 'approve' ? 'fa-check' : 'fa-times'}`}></i>
                      {reviewFormData.action === 'approve' ? 'Approve' : 'Reject'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedVersion && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-comment"></i> Add Comment</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCommentSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-circle"></i>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
                  </div>
                )}

                <div className="review-info">
                  <p><strong>Version:</strong> {selectedVersion.report.title} v{selectedVersion.version_number}</p>
                </div>

                <div className="form-group">
                  <label>Comment <span className="required">*</span></label>
                  <textarea
                    name="comment"
                    value={commentFormData.comment}
                    onChange={handleCommentInputChange}
                    rows={5}
                    required
                    placeholder="Enter your comment..."
                    maxLength={5000}
                  />
                  <small>Maximum 5000 characters</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Page Number</label>
                    <input
                      type="number"
                      name="page_number"
                      value={commentFormData.page_number}
                      onChange={handleCommentInputChange}
                      min="1"
                      placeholder="e.g., 5"
                    />
                    <small>Optional</small>
                  </div>

                  <div className="form-group">
                    <label>Section</label>
                    <input
                      type="text"
                      name="section"
                      value={commentFormData.section}
                      onChange={handleCommentInputChange}
                      maxLength={255}
                      placeholder="e.g., Introduction"
                    />
                    <small>Optional</small>
                  </div>
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-comment"></i>
                      Add Comment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedReport && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-star"></i> Assign Grade</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleGradeSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-circle"></i>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
                  </div>
                )}

                {!selectedReport.is_final && (
                  <div className="alert alert-warning alert-dismissible fade show">
                    <i className="fas fa-exclamation-triangle"></i>
                    Warning: This report is not marked as final yet.
                  </div>
                )}

                <div className="review-info">
                  <p><strong>Report:</strong> {selectedReport.title}</p>
                  <p><strong>Student:</strong> {selectedReport.student_name}</p>
                </div>

                <div className="form-group">
                  <label>Final Grade <span className="required">*</span></label>
                  <input
                    type="number"
                    name="final_grade"
                    value={gradeFormData.final_grade}
                    onChange={handleGradeInputChange}
                    required
                    min="0"
                    max="20"
                    step="0.01"
                    placeholder="Enter grade (0-20)"
                  />
                  <small>Grade must be between 0 and 20</small>
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
                  className="btn btn-success"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Assign Grade
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <span className="detail-label">Student:</span>
                    <span className="detail-value">{selectedReport.student_name}</span>
                  </div>
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
                  {selectedReport.final_grade !== null && (
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
                            {version.reviewed_at && version.reviewed_by_name && (
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
                                Comments ({version.comments.length})
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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-small">
                    <i className="fas fa-inbox"></i>
                    <p>No versions available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeAllModals}>
                Close
              </button>
              {selectedReport.is_final && selectedReport.final_grade === null && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    closeAllModals();
                    setTimeout(() => openGradeModal(selectedReport), 100);
                  }}
                >
                  <i className="fas fa-star"></i> Assign Grade
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherReportReview;