import React, { useState, useEffect } from 'react';
import { 
  getOfferApplications, 
  reviewApplication, 
  interviewDecision,
  getCompanyOffers,
  getInterviewSlots,
  createInterviewSlot,
  deleteInterviewSlot,
  calculateApplicationMatch,
  batchCalculateMatches
} from '../../api';
import CustomModal from '../../Components/common/CustomModal';
import './CompanyApplications.css';

const CompanyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [expandedApp, setExpandedApp] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [decisionId, setDecisionId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  
  // AI Match scoring
  const [calculatingMatch, setCalculatingMatch] = useState(null);
  const [batchCalculating, setBatchCalculating] = useState(null);
  
  // Inline slot management
  const [managingSlotsFor, setManagingSlotsFor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    date: '',
    start_time: '',
    end_time: '',
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [offersData, appsData] = await Promise.all([
        getCompanyOffers(),
        getOfferApplications()
      ]);
      setOffers(offersData);
      setApplications(appsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (offerId) => {
    try {
      const slotsData = await getInterviewSlots(offerId);
      setSlots(slotsData);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const toggleSlotManagement = async (offerId) => {
    if (managingSlotsFor === offerId) {
      setManagingSlotsFor(null);
      setSlots([]);
    } else {
      setManagingSlotsFor(offerId);
      await fetchSlots(offerId);
    }
  };

  const handleReview = async (applicationId, status) => {
    try {
      await reviewApplication(applicationId, status, feedback);
      setModal({ isOpen: true, title: 'Success!', message: status === 1 ? 'Student invited to interview!' : 'Application rejected.', type: 'success', onConfirm: null });
      setReviewingId(null);
      setFeedback('');
      fetchData();
    } catch (error) {
      setModal({ isOpen: true, title: 'Error', message: error.response?.data?.error || 'Failed to review application', type: 'danger', onConfirm: null });
    }
  };

  const handleFinalDecision = async (applicationId, status) => {
    try {
      await interviewDecision(applicationId, status, interviewNotes, feedback);
      setModal({ isOpen: true, title: 'Success!', message: status === 2 ? 'Student accepted! Internship created.' : 'Application rejected after interview.', type: 'success', onConfirm: null });
      setDecisionId(null);
      setFeedback('');
      setInterviewNotes('');
      fetchData();
    } catch (error) {
      setModal({ isOpen: true, title: 'Error', message: error.response?.data?.error || 'Failed to make decision', type: 'danger', onConfirm: null });
    }
  };

  const handleCreateSlot = async (e, offerId) => {
    e.preventDefault();
    try {
      await createInterviewSlot(offerId, newSlot);
      setNewSlot({ date: '', start_time: '', end_time: '', location: '' });
      fetchSlots(offerId);
    } catch (error) {
      setModal({ isOpen: true, title: 'Error', message: error.response?.data?.error || 'Failed to create slot', type: 'danger', onConfirm: null });
    }
  };

  const handleDeleteSlot = async (slotId, offerId) => {
    setModal({
      isOpen: true,
      title: 'Delete Time Slot',
      message: 'Are you sure you want to delete this time slot?',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteInterviewSlot(slotId);
          fetchSlots(offerId);
        } catch (error) {
          setModal({ isOpen: true, title: 'Error', message: error.response?.data?.error || 'Failed to delete slot', type: 'danger', onConfirm: null });
        }
      }
    });
  };

  const handleRejectApplication = (appId, isAfterInterview = false) => {
    setModal({
      isOpen: true,
      title: 'Reject Application',
      message: 'Are you sure you want to reject this application?',
      type: 'confirm',
      onConfirm: () => {
        if (isAfterInterview) {
          handleFinalDecision(appId, 3);
        } else {
          handleReview(appId, 3);
        }
      }
    });
  };

  const handleCalculateMatch = async (applicationId) => {
    setCalculatingMatch(applicationId);
    try {
      await calculateApplicationMatch(applicationId);
      setModal({ 
        isOpen: true, 
        title: 'Success!', 
        message: 'AI match score calculated successfully!', 
        type: 'success', 
        onConfirm: null 
      });
      fetchData(); // Refresh to show new match score
    } catch (error) {
      setModal({ 
        isOpen: true, 
        title: 'Error', 
        message: error.response?.data?.error || 'Failed to calculate match score', 
        type: 'danger', 
        onConfirm: null 
      });
    } finally {
      setCalculatingMatch(null);
    }
  };

  const handleBatchCalculate = async (offerId) => {
    setBatchCalculating(offerId);
    try {
      const result = await batchCalculateMatches(offerId);
      setModal({ 
        isOpen: true, 
        title: 'Success!', 
        message: result.message || 'Match scores calculated for all applications!', 
        type: 'success', 
        onConfirm: null 
      });
      fetchData(); // Refresh to show new match scores
    } catch (error) {
      setModal({ 
        isOpen: true, 
        title: 'Error', 
        message: error.response?.data?.error || 'Failed to calculate match scores', 
        type: 'danger', 
        onConfirm: null 
      });
    } finally {
      setBatchCalculating(null);
    }
  };

  const getMatchScoreColor = (score) => {
    if (!score) return 'gray';
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: 'Pending', class: 'badge-warning' },
      1: { label: 'Interview', class: 'badge-info' },
      2: { label: 'Accepted', class: 'badge-success' },
      3: { label: 'Rejected', class: 'badge-danger' }
    };
    const statusInfo = statusMap[status] || { label: 'Unknown', class: 'badge-secondary' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const filteredApplications = selectedOffer
    ? applications.filter(app => app.offer === selectedOffer)
    : applications;

  // Group applications by offer
  const groupedByOffer = filteredApplications.reduce((acc, app) => {
    const offerId = app.offer;
    if (!acc[offerId]) {
      acc[offerId] = { offer: app.offer_info, applications: [] };
    }
    acc[offerId].applications.push(app);
    return acc;
  }, {});

  const pendingCount = applications.filter(a => a.status === 0).length;
  const interviewCount = applications.filter(a => a.status === 1).length;

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="applications-container">
      <div className="page-header">
        <h1> Student Applications</h1>
        <div className="stats-badges">
          <span className="stat-badge pending">{pendingCount} Pending</span>
          <span className="stat-badge interview">{interviewCount} In Interview</span>
          <span className="stat-badge total">{applications.length} Total</span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Filter by Position:</label>
          <select 
            value={selectedOffer || ''} 
            onChange={(e) => setSelectedOffer(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Positions</option>
            {offers.map(offer => (
              <option key={offer.id} value={offer.id}>{offer.title}</option>
            ))}
          </select>
        </div>
      </div>

      {Object.keys(groupedByOffer).length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"></span>
          <h3>No applications yet</h3>
          <p>Applications will appear here when students apply to your positions.</p>
        </div>
      ) : (
        Object.values(groupedByOffer).map(group => (
          <div key={group.offer?.id} className="offer-group">
            <div className="offer-group-header">
              <div className="offer-title-section">
                <h2>{group.offer?.title}</h2>
                <span className="app-count">{group.applications.length} application(s)</span>
              </div>
              <div className="header-actions">
                <button 
                  className={`btn-ai-match ${batchCalculating === group.offer?.id ? 'loading' : ''}`}
                  onClick={() => handleBatchCalculate(group.offer?.id)}
                  disabled={batchCalculating === group.offer?.id || group.applications.length === 0}
                >
                  {batchCalculating === group.offer?.id ? '🔄 Calculating...' : '🤖 AI Match All'}
                </button>
                <button 
                  className={`btn-slots ${managingSlotsFor === group.offer?.id ? 'active' : ''}`}
                  onClick={() => toggleSlotManagement(group.offer?.id)}
                >
                   {managingSlotsFor === group.offer?.id ? 'Hide' : 'Manage'} Interview Slots
                </button>
              </div>
            </div>

            {/* Inline Slot Management */}
            {managingSlotsFor === group.offer?.id && (
              <div className="inline-slots-panel">
                <div className="slots-form-section">
                  <h4> Add Time Slot</h4>
                  <form className="slot-form-inline" onSubmit={(e) => handleCreateSlot(e, group.offer?.id)}>
                    <input type="date" value={newSlot.date} onChange={(e) => setNewSlot({...newSlot, date: e.target.value})} required />
                    <input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})} required />
                    <input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})} required />
                    <input type="text" placeholder="Location / Link" value={newSlot.location} onChange={(e) => setNewSlot({...newSlot, location: e.target.value})} />
                    <button type="submit" className="btn-add-slot">+ Add</button>
                  </form>
                </div>
                
                {slots.length > 0 && (
                  <div className="slots-list-section">
                    <h4> Available Slots ({slots.filter(s => !s.is_booked).length} open)</h4>
                    <div className="slots-mini-table">
                      {slots.map(slot => (
                        <div key={slot.id} className={`slot-row ${slot.is_booked ? 'booked' : ''}`}>
                          <span className="slot-date">{slot.date}</span>
                          <span className="slot-time">{slot.start_time} - {slot.end_time}</span>
                          <span className="slot-location">{slot.location || '-'}</span>
                          <span className={`slot-status ${slot.is_booked ? 'booked' : 'open'}`}>
                            {slot.is_booked ? ' Booked' : ' Open'}
                          </span>
                          {!slot.is_booked && (
                            <button className="btn-delete-slot" onClick={() => handleDeleteSlot(slot.id, group.offer?.id)} title="Delete"></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {slots.length === 0 && <p className="no-slots-msg">No slots yet. Add above for students to book.</p>}
              </div>
            )}

            {/* Applications Table */}
            <div className="table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>AI Match</th>
                    <th>Contact</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th>Interview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.applications.map(app => (
                    <React.Fragment key={app.id}>
                      <tr className={`app-row status-${app.status}`}>
                        <td className="student-cell">
                          <div className="student-info">
                            <img src={app.student_info?.profile_picture || '/default-avatar.png'} alt="" className="avatar-small" />
                            <div>
                              <strong>{app.student_info?.full_name}</strong>
                              {app.cv_file && <a href={app.cv_file} target="_blank" rel="noopener noreferrer" className="cv-link-inline">📄 CV</a>}
                            </div>
                          </div>
                        </td>
                        <td className="match-cell">
                          {app.match_score ? (
                            <div className="match-score-display">
                              <div 
                                className="match-circle" 
                                style={{ 
                                  background: `conic-gradient(${getMatchScoreColor(app.match_score)} ${app.match_score * 3.6}deg, #e5e7eb 0deg)` 
                                }}
                              >
                                <span className="match-percentage">{Math.round(app.match_score)}%</span>
                              </div>
                              {app.match_analysis && (
                                <button 
                                  className="btn-view-analysis" 
                                  onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                                  title="View AI Analysis"
                                >
                                  📊
                                </button>
                              )}
                            </div>
                          ) : (
                            <button 
                              className={`btn-calculate-match ${calculatingMatch === app.id ? 'loading' : ''}`}
                              onClick={() => handleCalculateMatch(app.id)}
                              disabled={calculatingMatch === app.id}
                              title="Calculate AI Match"
                            >
                              {calculatingMatch === app.id ? '⏳' : '🤖'}
                            </button>
                          )}
                        </td>
                        <td className="contact-cell">
                          <div className="contact-info">
                            <span className="email">{app.student_info?.email}</span>
                            {app.student_info?.phone && <span className="phone"> {app.student_info.phone}</span>}
                          </div>
                        </td>
                        <td className="date-cell">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td className="interview-cell">
                          {app.selected_slot_info ? (
                            <div className="interview-info">
                              <span> {app.selected_slot_info.date}</span>
                              <span> {app.selected_slot_info.start_time}</span>
                              {app.selected_slot_info.location && <span> {app.selected_slot_info.location}</span>}
                            </div>
                          ) : app.status === 1 ? (
                            <span className="waiting-badge"> Awaiting</span>
                          ) : '-'}
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            {app.cover_letter && (
                              <button className="btn-icon" onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)} title="Details"></button>
                            )}
                            {app.status === 0 && (
                              <>
                                <button className="btn-action invite" onClick={() => setReviewingId(app.id)} title="Interview"></button>
                                <button className="btn-action reject" onClick={() => handleRejectApplication(app.id, false)} title="Reject"></button>
                              </>
                            )}
                            {app.status === 1 && app.selected_slot_info && (
                              <>
                                <button className="btn-action accept" onClick={() => setDecisionId(app.id)} title="Accept"></button>
                                <button className="btn-action reject" onClick={() => handleRejectApplication(app.id, true)} title="Reject"></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {expandedApp === app.id && (
                        <tr className="expanded-row">
                          <td colSpan="7">
                            <div className="expanded-content">
                              {app.match_analysis && (
                                <div className="detail-section ai-analysis">
                                  <strong>🤖 AI Match Analysis:</strong>
                                  <pre className="analysis-text">{app.match_analysis}</pre>
                                </div>
                              )}
                              {app.cover_letter && <div className="detail-section"><strong>Cover Letter:</strong><p>{app.cover_letter}</p></div>}
                              {app.company_feedback && <div className="detail-section"><strong>Feedback:</strong><p>{app.company_feedback}</p></div>}
                              {app.interview_notes && <div className="detail-section"><strong>Notes:</strong><p>{app.interview_notes}</p></div>}
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      {reviewingId === app.id && (
                        <tr className="form-row">
                          <td colSpan="7">
                            <div className="inline-form">
                              <textarea placeholder="Feedback for student (optional)..." value={feedback} onChange={(e) => setFeedback(e.target.value)} rows="2" />
                              <div className="form-actions">
                                <button className="btn-confirm invite" onClick={() => handleReview(app.id, 1)}> Confirm Interview</button>
                                <button className="btn-cancel" onClick={() => { setReviewingId(null); setFeedback(''); }}>Cancel</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      {decisionId === app.id && (
                        <tr className="form-row">
                          <td colSpan="7">
                            <div className="inline-form">
                              <textarea placeholder="Interview notes (internal)..." value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} rows="2" />
                              <textarea placeholder="Feedback for student..." value={feedback} onChange={(e) => setFeedback(e.target.value)} rows="2" />
                              <div className="form-actions">
                                <button className="btn-confirm accept" onClick={() => handleFinalDecision(app.id, 2)}> Accept</button>
                                <button className="btn-confirm reject" onClick={() => handleFinalDecision(app.id, 3)}> Reject</button>
                                <button className="btn-cancel" onClick={() => { setDecisionId(null); setFeedback(''); setInterviewNotes(''); }}>Cancel</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <CustomModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.type === 'confirm' ? 'Yes, Proceed' : 'OK'}
      />
    </div>
  );
};

export default CompanyApplications;
