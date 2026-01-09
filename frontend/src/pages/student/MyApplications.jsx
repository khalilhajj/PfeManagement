import React, { useState, useEffect } from 'react';
import { getMyApplications, selectInterviewSlot } from '../../api';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingSlot, setSelectingSlot] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = async (applicationId, slotId) => {
    try {
      await selectInterviewSlot(applicationId, slotId);
      alert('Interview time slot confirmed!');
      setSelectingSlot(null);
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to select slot');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: 'Pending Review', class: 'badge-warning', icon: '⏳' },
      1: { label: 'Interview', class: 'badge-info', icon: '🎤' },
      2: { label: 'Accepted', class: 'badge-success', icon: '✅' },
      3: { label: 'Rejected', class: 'badge-danger', icon: '❌' }
    };
    const statusInfo = statusMap[status] || { label: 'Unknown', class: 'badge-secondary', icon: '?' };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.icon} {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="my-applications-container">
      <div className="page-header">
        <h1>📋 My Applications</h1>
        <p className="subtitle">Track your internship applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Browse internships and start applying!</p>
          <a href="/browse-internships" className="btn-browse">Browse Internships</a>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app.id} className={`application-card status-${app.status}`}>
              <div className="app-header">
                <div className="offer-info">
                  <img 
                    src={app.offer_info?.company_info?.profile_picture || '/default-company.png'} 
                    alt="Company" 
                    className="company-avatar"
                  />
                  <div>
                    <h3>{app.offer_info?.title}</h3>
                    <p className="company-name">{app.offer_info?.company_info?.full_name}</p>
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <div className="app-details">
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span>{app.offer_info?.type_display}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Duration:</span>
                  <span>{app.offer_info?.start_date} - {app.offer_info?.end_date}</span>
                </div>
                {app.offer_info?.location && (
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span>{app.offer_info.location}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Applied:</span>
                  <span>{new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Pending - waiting for company review */}
              {app.status === 0 && (
                <div className="status-message pending">
                  <p> Your application is under review. We'll notify you when the company responds.</p>
                </div>
              )}

              {/* Interview - need to select slot */}
              {app.status === 1 && !app.selected_slot_info && (
                <div className="interview-section">
                  <div className="interview-message">
                    <h4> Congratulations! You've been selected for an interview!</h4>
                    <p>Please select a time slot that works for you:</p>
                  </div>
                  
                  {app.available_slots && app.available_slots.length > 0 ? (
                    <div className="slots-grid">
                      {app.available_slots.map(slot => (
                        <div 
                          key={slot.id} 
                          className={`slot-card ${selectingSlot === slot.id ? 'selected' : ''}`}
                          onClick={() => setSelectingSlot(slot.id)}
                        >
                          <div className="slot-date">📅 {slot.date}</div>
                          <div className="slot-time">🕐 {slot.start_time} - {slot.end_time}</div>
                          {slot.location && (
                            <div className="slot-location">📍 {slot.location}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-slots-message">
                      <p>⏳ The company hasn't set up interview time slots yet. Please check back later.</p>
                    </div>
                  )}

                  {selectingSlot && (
                    <div className="confirm-slot">
                      <button 
                        className="btn-confirm"
                        onClick={() => handleSelectSlot(app.id, selectingSlot)}
                      >
                        Confirm This Time Slot
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => setSelectingSlot(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Interview scheduled */}
              {app.status === 1 && app.selected_slot_info && (
                <div className="interview-scheduled">
                  <h4>📅 Interview Scheduled</h4>
                  <div className="scheduled-details">
                    <p><strong>Date:</strong> {app.selected_slot_info.date}</p>
                    <p><strong>Time:</strong> {app.selected_slot_info.start_time} - {app.selected_slot_info.end_time}</p>
                    {app.selected_slot_info.location && (
                      <p><strong>Location:</strong> {app.selected_slot_info.location}</p>
                    )}
                  </div>
                  <p className="interview-tip">💡 Tip: Be prepared with questions about the role and company!</p>
                </div>
              )}

              {/* Accepted */}
              {app.status === 2 && (
                <div className="status-message success">
                  <h4>🎉 Congratulations! You've been accepted!</h4>
                  <p>Your internship has been created and added to your dashboard.</p>
                  {app.company_feedback && (
                    <div className="feedback">
                      <strong>Company message:</strong> {app.company_feedback}
                    </div>
                  )}
                </div>
              )}

              {/* Rejected */}
              {app.status === 3 && (
                <div className="status-message rejected">
                  <p>Unfortunately, your application was not selected.</p>
                  {app.company_feedback && (
                    <div className="feedback">
                      <strong>Feedback:</strong> {app.company_feedback}
                    </div>
                  )}
                  <p className="encouragement">Don't give up! Keep applying to other opportunities.</p>
                </div>
              )}

              {/* Show CV if uploaded */}
              {app.cv_file && (
                <div className="app-documents">
                  <a href={app.cv_file} target="_blank" rel="noopener noreferrer" className="cv-link">
                    📄 View Submitted CV
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
