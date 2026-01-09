import React, { useState, useEffect } from 'react';
import { getPendingInternships, approveInternship, rejectInternship } from '../../api';
import './PendingInternships.css';

const PendingInternships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [actionType, setActionType] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchPendingInternships();
    }, []);

    const fetchPendingInternships = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getPendingInternships();
            setInternships(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load pending internships');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (internship, action) => {
        setSelectedInternship(internship);
        setActionType(action);
        setShowConfirmModal(true);
        setRejectReason('');
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setSelectedInternship(null);
        setActionType('');
        setRejectReason('');
    };

    const handleApprove = async () => {
        if (!selectedInternship) return;

        setActionLoading(selectedInternship.id);
        setError('');
        setSuccessMessage('');

        try {
            await approveInternship(selectedInternship.id);
            setSuccessMessage(`Internship "${selectedInternship.title}" approved successfully!`);
            
            // Remove from list
            setInternships(internships.filter(int => int.id !== selectedInternship.id));
            closeConfirmModal();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to approve internship');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selectedInternship) return;

        setActionLoading(selectedInternship.id);
        setError('');
        setSuccessMessage('');

        try {
            await rejectInternship(selectedInternship.id, rejectReason);
            setSuccessMessage(`Internship "${selectedInternship.title}" rejected.`);
            
            // Remove from list
            setInternships(internships.filter(int => int.id !== selectedInternship.id));
            closeConfirmModal();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reject internship');
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirm = () => {
        if (actionType === 'approve') {
            handleApprove();
        } else if (actionType === 'reject') {
            handleReject();
        }
    };

    if (loading) {
        return (
            <div className="pending-internships-container">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading pending internships...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pending-internships-container">
            <div className="page-header">
                <div>
                    <h1><i className="fas fa-clock"></i> Pending Internships</h1>
                    <p>Review and manage internship requests</p>
                </div>
                <div className="stats-badge">
                    <span className="count">{internships.length}</span>
                    <span className="label">Pending</span>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show">
                    <i className="fas fa-check-circle"></i>
                    {successMessage}
                </div>
            )}

            {internships.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <h3>No Pending Internships</h3>
                    <p>All internships have been reviewed</p>
                </div>
            ) : (
                <div className="internships-table-container">
                    <table className="internships-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Title</th>
                                <th>Company</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Submitted</th>
                                <th>Documents</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {internships.map(internship => (
                                <tr key={internship.id}>
                                    <td>
                                        <div className="student-info">
                                            <strong>{internship.student_name}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="internship-title">
                                            {internship.title}
                                        </div>
                                    </td>
                                    <td>{internship.company_name}</td>
                                    <td>
                                        <span className="type-badge">
                                            {internship.type_display}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="duration">
                                            {new Date(internship.start_date).toLocaleDateString('en-GB')}
                                            <br />
                                            <small>to</small>
                                            <br />
                                            {new Date(internship.end_date).toLocaleDateString('en-GB')}
                                        </div>
                                    </td>
                                    <td>
                                        <small>
                                            {new Date(internship.created_at).toLocaleDateString('en-GB')}
                                        </small>
                                    </td>
                                    <td>
                                        {internship.cahier_de_charges && (
                                            <a
                                                href={`${BACKEND_URL}${internship.cahier_de_charges}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="doc-link"
                                            >
                                                <i className="fas fa-file-pdf"></i>
                                                View
                                            </a>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-approve"
                                                id="admin-approve-button"
                                                onClick={() => openConfirmModal(internship, 'approve')}
                                                disabled={actionLoading === internship.id}
                                            >
                                                <i className="fas fa-check"></i>
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-reject"
                                                id="admin-reject-button"
                                                onClick={() => openConfirmModal(internship, 'reject')}
                                                disabled={actionLoading === internship.id}
                                            >
                                                <i className="fas fa-times"></i>
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedInternship && (
                <div className="modal-overlay" onClick={closeConfirmModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <i className={`fas fa-${actionType === 'approve' ? 'check-circle' : 'times-circle'}`}></i>
                                {actionType === 'approve' ? 'Approve' : 'Reject'} Internship
                            </h2>
                            <button className="modal-close" onClick={closeConfirmModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="internship-details">
                                <p><strong>Student:</strong> {selectedInternship.student_name}</p>
                                <p><strong>Title:</strong> {selectedInternship.title}</p>
                                <p><strong>Company:</strong> {selectedInternship.company_name}</p>
                                <p><strong>Type:</strong> {selectedInternship.type_display}</p>
                            </div>

                            {actionType === 'approve' ? (
                                <p className="confirm-message">
                                    Are you sure you want to approve this internship? 
                                    The student will be able to send invitations to teachers.
                                </p>
                            ) : (
                                <>
                                    <p className="confirm-message">
                                        Are you sure you want to reject this internship?
                                    </p>
                                    <div className="form-group">
                                        <label htmlFor="reason">Reason (Optional)</label>
                                        <textarea
                                            id="reason"
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            placeholder="Provide a reason for rejection..."
                                            rows="3"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                id="cancel-internship-button"
                                className="btn btn-secondary"
                                onClick={closeConfirmModal}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                id={actionType === 'approve' ? 'approve-internship-button' : 'reject-internship-button'}
                                className={`btn ${actionType === 'approve' ? 'btn-approve' : 'btn-reject'}`}
                                onClick={handleConfirm}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className={`fas fa-${actionType === 'approve' ? 'check' : 'times'}`}></i>
                                        {actionType === 'approve' ? 'Approve' : 'Reject'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingInternships;