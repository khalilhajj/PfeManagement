import React, { useState, useEffect } from 'react';
import { getMyInternships, getInternshipDetail } from '../../api';
import AddInternshipModal from './AddInternshipModal';
import InviteTeacherModal from './InviteTeacherModal';
import './StudentInternships.css';

const StudentInternships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    useEffect(() => {
        fetchInternships();
    }, []);

    const fetchInternships = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyInternships();
            setInternships(data);
        } catch (err) {
            setError('Failed to load internships');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSuccess = () => {
        setShowAddModal(false);
        fetchInternships();
    };

    const handleInviteSuccess = () => {
        setShowInviteModal(false);
        fetchInternships();
    };

    const openInviteModal = (internship) => {
        setSelectedInternship(internship);
        setShowInviteModal(true);
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            0: { 
                text: 'Pending Admin Approval', 
                class: 'status-pending',
                icon: 'fas fa-clock',
                description: 'Your internship is awaiting admin approval'
            },
            1: { 
                text: 'Approved', 
                class: 'status-approved',
                icon: 'fas fa-check-circle',
                description: 'Approved! You can now invite a teacher'
            },
            2: { 
                text: 'Rejected', 
                class: 'status-rejected',
                icon: 'fas fa-times-circle',
                description: 'Your internship was rejected'
            },
            3: { 
                text: 'In Progress', 
                class: 'status-progress',
                icon: 'fas fa-spinner',
                description: 'Your internship is currently in progress'
            },
            4: { 
                text: 'Completed', 
                class: 'status-completed',
                icon: 'fas fa-graduation-cap',
                description: 'Your internship has been completed'
            }
        };
        return statusMap[status] || { 
            text: 'Unknown', 
            class: 'status-unknown',
            icon: 'fas fa-question-circle',
            description: 'Status unknown'
        };
    };

    const toggleCard = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    if (loading) {
        return (
            <div className="student-internships">
                <div className="section-header">
                    <h2><i className="fas fa-briefcase"></i> My Internships</h2>
                </div>
                <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading internships...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="student-internships">
            <div className="section-header">
                <div>
                    <h2><i className="fas fa-briefcase"></i> My Internships</h2>
                    <p className="section-description">Track and manage your internships</p>
                </div>
                <button 
                    className="btn btn-primary btn-sm"
                    id="add-internship-button"
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="fas fa-plus"></i>
                    Add Internship
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            {internships.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-briefcase"></i>
                    <h3>No internships yet</h3>
                    <p>Start by adding your first internship</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Add Your First Internship
                    </button>
                </div>
            ) : (
                <div className="internships-list">
                    {internships.map(internship => {
                        const statusInfo = getStatusInfo(internship.status);
                        const isExpanded = expandedCard === internship.id;
                        
                        return (
                            <div 
                                key={internship.id}
                                id={`internship-card-${internship.id}`}
                                className={`internship-card ${isExpanded ? 'expanded' : ''}`}
                            >
                                <div 
                                    id={`open-card-${internship.id}`}
                                    className="card-header"
                                    onClick={() => toggleCard(internship.id)}
                                >                                    
                                    <div className="header-left">
                                        <h3>{internship.title}</h3>
                                        <span className="company-name">
                                            <i className="fas fa-building"></i>
                                            {internship.company_name}
                                        </span>
                                    </div>
                                    <div className="header-right">
                                        <span className={`status-badge ${statusInfo.class}`}>
                                            <i className={statusInfo.icon}></i>
                                            {statusInfo.text}
                                        </span>
                                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} toggle-icon`}></i>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="card-body">
                                        <div className="status-description">
                                            <i className="fas fa-info-circle"></i>
                                            {statusInfo.description}
                                        </div>

                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="info-label">Type</span>
                                                <span className="info-value">{internship.type_display}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">Duration</span>
                                                <span className="info-value">
                                                    {new Date(internship.start_date).toLocaleDateString()} - 
                                                    {new Date(internship.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {internship.teacher_name && (
                                                <div className="info-item full-width">
                                                    <span className="info-label">Supervisor</span>
                                                    <span className="info-value">
                                                        <i className="fas fa-user-tie"></i>
                                                        {internship.teacher_name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {internship.description && (
                                            <div className="description-section">
                                                <h4>Description</h4>
                                                <p>{internship.description}</p>
                                            </div>
                                        )}

                                        <div className="card-actions">
                                            {internship.status === 1 && !internship.teacher_id && (
                                                <button 
                                                    id={`invite-teacher-${internship.id}`}
                                                    className="btn btn-primary btn-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openInviteModal(internship);
                                                    }}
                                                >
                                                    <i className="fas fa-paper-plane"></i>
                                                    Invite Teacher
                                                </button>
                                            )}
                                            {internship.cahier_de_charges && (
                                                <a 
                                                    href={`${BACKEND_URL}${internship.cahier_de_charges}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <i className="fas fa-file-pdf"></i>
                                                    View Document
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showAddModal && (
                <AddInternshipModal 
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}

            {showInviteModal && selectedInternship && (
                <InviteTeacherModal
                    internship={selectedInternship}
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={handleInviteSuccess}
                />
            )}
        </div>
    );
};

export default StudentInternships;