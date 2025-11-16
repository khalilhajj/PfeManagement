import React, { useState, useEffect } from 'react';
import { getTeacherInvitations, respondToInvitation } from '../../api';
import './PendingInvitation.css';

const PendingInvitation = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [actionType, setActionType] = useState('');
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getTeacherInvitations();
            setInvitations(response);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load invitations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (invitation, action) => {
        setSelectedInvitation(invitation);
        setActionType(action);
        setShowConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setSelectedInvitation(null);
        setActionType('');
    };

    const handleAccept = async () => {
        if (!selectedInvitation) return;

        setActionLoading(selectedInvitation.id);
        setError('');
        setSuccessMessage('');

        try {
            await respondToInvitation(selectedInvitation.id, 1);
            setSuccessMessage(`Invitation accepted! You are now supervising "${selectedInvitation.internship_title}"`);
            
            setInvitations(invitations.filter(inv => inv.id !== selectedInvitation.id));
            closeConfirmModal();
            
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to accept invitation');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selectedInvitation) return;

        setActionLoading(selectedInvitation.id);
        setError('');
        setSuccessMessage('');

        try {
            await respondToInvitation(selectedInvitation.id, 2);
            setSuccessMessage('Invitation declined.');
            
            // Remove from list
            setInvitations(invitations.filter(inv => inv.id !== selectedInvitation.id));
            closeConfirmModal();
            
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reject invitation');
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirm = () => {
        if (actionType === 'accept') {
            handleAccept();
        } else if (actionType === 'reject') {
            handleReject();
        }
    };

    const toggleCard = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    const getStatusBadge = (status) => {
        const badges = {
            0: { class: 'status-pending', text: 'Pending', icon: 'fa-clock' },
            1: { class: 'status-accepted', text: 'Accepted', icon: 'fa-check' },
            2: { class: 'status-rejected', text: 'Rejected', icon: 'fa-times' }
        };
        return badges[status] || badges[0];
    };

    // Filter only pending invitations
    const pendingInvitations = invitations.filter(inv => inv.status === 0);

    if (loading) {
        return (
            <div className="pending-invitations-container">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading invitations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pending-invitations-container">
            <div className="page-header">
                <div>
                    <h1><i className="fas fa-envelope"></i> Pending Invitations</h1>
                    <p>Review internship supervision requests from students</p>
                </div>
                <div className="stats-badge">
                    <span className="count">{pendingInvitations.length}</span>
                    <span className="label">Pending</span>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>
                    {successMessage}
                </div>
            )}

            {pendingInvitations.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <h3>No Pending Invitations</h3>
                    <p>You don't have any pending supervision requests at the moment</p>
                </div>
            ) : (
                <div className="invitations-grid">
                    {pendingInvitations.map(invitation => {
                        const statusBadge = getStatusBadge(invitation.status);
                        const isExpanded = expandedCard === invitation.id;

                        return (
                            <div 
                                key={invitation.id} 
                                className={`invitation-card ${isExpanded ? 'expanded' : ''}`}
                            >
                                <div className="card-header" onClick={() => toggleCard(invitation.id)}>
                                    <div className="header-left">
                                        <h3>{invitation.internship_title}</h3>
                                        <div className="student-info">
                                            <i className="fas fa-user"></i>
                                            <span>From: {invitation.student_name}</span>
                                        </div>
                                    </div>
                                    <div className="header-right">
                                        <span className={`status-badge ${statusBadge.class}`}>
                                            <i className={`fas ${statusBadge.icon}`}></i>
                                            {statusBadge.text}
                                        </span>
                                        <i className={`fas fa-chevron-down toggle-icon ${isExpanded ? 'rotated' : ''}`}></i>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="card-body">
                                        <div className="invitation-details">
                                            {invitation.message && (
                                                <div className="message-section">
                                                    <h4><i className="fas fa-comment"></i> Message from Student</h4>
                                                    <p className="message-text">{invitation.message}</p>
                                                </div>
                                            )}

                                            <div className="info-section">
                                                <h4><i className="fas fa-info-circle"></i> Internship Details</h4>
                                                <div className="info-grid">
                                                    <div className="info-item">
                                                        <span className="info-label">Student</span>
                                                        <span className="info-value">{invitation.student_name}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Internship Title</span>
                                                        <span className="info-value">{invitation.internship_title}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Received On</span>
                                                        <span className="info-value">
                                                            {new Date(invitation.created_at).toLocaleDateString('en-GB')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {invitation.status === 0 && (
                                            <div className="card-actions">
                                                <button
                                                    className="btn btn-accept"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openConfirmModal(invitation, 'accept');
                                                    }}
                                                    disabled={actionLoading === invitation.id}
                                                >
                                                    <i className="fas fa-check"></i>
                                                    Accept Invitation
                                                </button>
                                                <button
                                                    className="btn btn-decline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openConfirmModal(invitation, 'reject');
                                                    }}
                                                    disabled={actionLoading === invitation.id}
                                                >
                                                    <i className="fas fa-times"></i>
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedInvitation && (
                <div className="modal-overlay" onClick={closeConfirmModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <i className={`fas fa-${actionType === 'accept' ? 'check-circle' : 'times-circle'}`}></i>
                                {actionType === 'accept' ? 'Accept' : 'Decline'} Invitation
                            </h2>
                            <button className="modal-close" onClick={closeConfirmModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="invitation-summary">
                                <p><strong>Student:</strong> {selectedInvitation.student_name}</p>
                                <p><strong>Internship:</strong> {selectedInvitation.internship_title}</p>
                                {selectedInvitation.message && (
                                    <p><strong>Message:</strong> {selectedInvitation.message}</p>
                                )}
                            </div>

                            {actionType === 'accept' ? (
                                <p className="confirm-message">
                                    By accepting this invitation, you agree to supervise this student's internship. 
                                    You will be responsible for guiding them throughout their project.
                                </p>
                            ) : (
                                <p className="confirm-message">
                                    Are you sure you want to decline this invitation? 
                                    The student will be notified of your decision.
                                </p>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={closeConfirmModal}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn ${actionType === 'accept' ? 'btn-accept' : 'btn-decline'}`}
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
                                        <i className={`fas fa-${actionType === 'accept' ? 'check' : 'times'}`}></i>
                                        Confirm
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

export default PendingInvitation;