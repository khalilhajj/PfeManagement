import React, { useState, useEffect } from 'react';
import { getTeachersList, sendTeacherInvitation } from '../../api';
import './InviteTeacherModal.css';

const InviteTeacherModal = ({ internship, onClose, onSuccess }) => {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setFetchLoading(true);
        try {
            const data = await getTeachersList();
            setTeachers(data);
        } catch (err) {
            setError('Failed to load teachers');
            console.error(err);
        } finally {
            setFetchLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(teacher => 
        teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedTeacher) {
            setError('Please select a teacher');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await sendTeacherInvitation({
                internship: internship.id,
                teacher: selectedTeacher,
                message: message
            });
            
            setSuccessMessage('Invitation sent successfully!');
            
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            console.error('Error sending invitation:', err);
            const errorMessage = err.response?.data?.error ||
                               err.response?.data?.message ||
                               'Failed to send invitation. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><i className="fas fa-paper-plane"></i> Invite Teacher</h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
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

                <div className="internship-info">
                    <h3>{internship.title}</h3>
                    <p>
                        <i className="fas fa-building"></i> {internship.company_name}
                    </p>
                </div>

                {fetchLoading ? (
                    <div className="loading-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading teachers...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search teachers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="teachers-list">
                            {filteredTeachers.length === 0 ? (
                                <p className="no-results">No teachers found</p>
                            ) : (
                                filteredTeachers.map(teacher => (
                                    <div
                                        key={teacher.id}
                                        className={`teacher-item ${selectedTeacher === teacher.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedTeacher(teacher.id)}
                                    >
                                        <input
                                            type="radio"
                                            name="teacher"
                                            value={teacher.id}
                                            checked={selectedTeacher === teacher.id}
                                            onChange={() => setSelectedTeacher(teacher.id)}
                                        />
                                        <img
                                            src={
                                                teacher.profile_picture 
                                                    ? teacher.profile_picture.startsWith('http')
                                                        ? teacher.profile_picture
                                                        : `${BACKEND_URL}${teacher.profile_picture}`
                                                    : '/default-avatar.png'
                                            }
                                            alt={teacher.full_name}
                                            className="teacher-avatar"
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                        <div className="teacher-details">
                                            <h4>{teacher.full_name}</h4>
                                            <p>{teacher.email}</p>
                                        </div>
                                        {selectedTeacher === teacher.id && (
                                            <i className="fas fa-check-circle selected-icon"></i>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message (Optional)</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Add a personal message to the teacher..."
                                rows="3"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !selectedTeacher}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane"></i>
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InviteTeacherModal;