import React, { useState, useEffect } from 'react';
import { getAdminPendingOffers, adminReviewOffer } from '../../api';
import CustomModal from '../../Components/common/CustomModal';
import './PendingOffers.css';

const PendingOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });

  useEffect(() => {
    fetchOffers();
  }, [statusFilter]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getAdminPendingOffers(statusFilter);
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (offerId, status) => {
    try {
      await adminReviewOffer(offerId, status, feedback);
      setModal({ isOpen: true, title: status === 1 ? 'Offer Approved!' : 'Offer Rejected', message: status === 1 ? 'The internship offer has been approved successfully.' : 'The internship offer has been rejected.', type: status === 1 ? 'success' : 'info', onConfirm: null });
      setReviewingId(null);
      setFeedback('');
      fetchOffers();
    } catch (error) {
      setModal({ isOpen: true, title: 'Review Failed', message: error.response?.data?.error || 'Failed to review offer', type: 'danger', onConfirm: null });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: 'Pending', class: 'badge-warning' },
      1: { label: 'Approved', class: 'badge-success' },
      2: { label: 'Rejected', class: 'badge-danger' },
      3: { label: 'Closed', class: 'badge-secondary' }
    };
    const statusInfo = statusMap[status] || { label: 'Unknown', class: 'badge-secondary' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const pendingCount = offers.filter(o => o.status === 0).length;

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="pending-offers-container">
      <div className="page-header">
        <h1>📋 Company Internship Offers</h1>
        <div className="stats-badge">
          <span className="count">{pendingCount}</span>
          <span className="label">Pending Review</span>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={statusFilter === 0 ? 'active' : ''} 
          onClick={() => setStatusFilter(0)}
        >
          Pending
        </button>
        <button 
          className={statusFilter === 1 ? 'active' : ''} 
          onClick={() => setStatusFilter(1)}
        >
          Approved
        </button>
        <button 
          className={statusFilter === 2 ? 'active' : ''} 
          onClick={() => setStatusFilter(2)}
        >
          Rejected
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No {statusFilter === 0 ? 'pending' : statusFilter === 1 ? 'approved' : 'rejected'} offers</h3>
          <p>Offers will appear here when companies submit them.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="offers-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Type</th>
                <th>Location</th>
                <th>Duration</th>
                <th>Positions</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <React.Fragment key={offer.id}>
                  <tr className={`offer-row status-${offer.status}`}>
                    <td className="company-cell">
                      <div className="company-info">
                        <img 
                          src={offer.company_info?.profile_picture || '/default-company.png'} 
                          alt="" 
                          className="company-avatar"
                        />
                        <div>
                          <strong>{offer.company_info?.full_name}</strong>
                          <span className="email">{offer.company_info?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="title-cell">
                      <strong>{offer.title}</strong>
                    </td>
                    <td>
                      <span className="type-badge">{offer.type_display}</span>
                    </td>
                    <td>{offer.location || '-'}</td>
                    <td>{offer.duration || '-'}</td>
                    <td className="center">{offer.positions_available}</td>
                    <td>{new Date(offer.created_at).toLocaleDateString()}</td>
                    <td>{getStatusBadge(offer.status)}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="btn-icon"
                          onClick={() => setExpandedId(expandedId === offer.id ? null : offer.id)}
                          title="View details"
                        >
                          {expandedId === offer.id ? '▲' : '▼'}
                        </button>
                        {offer.status === 0 && (
                          <>
                            <button 
                              className="btn-action approve"
                              onClick={() => handleReview(offer.id, 1)}
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button 
                              className="btn-action reject"
                              onClick={() => setReviewingId(offer.id)}
                              title="Reject"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {expandedId === offer.id && (
                    <tr className="expanded-row">
                      <td colSpan="9">
                        <div className="expanded-content">
                          <div className="detail-grid">
                            <div className="detail-section">
                              <h4>📝 Description</h4>
                              <p>{offer.description}</p>
                            </div>
                            {offer.requirements && (
                              <div className="detail-section">
                                <h4>📋 Requirements</h4>
                                <p>{offer.requirements}</p>
                              </div>
                            )}
                            <div className="detail-section">
                              <h4>📅 Period</h4>
                              <p>{offer.start_date} to {offer.end_date}</p>
                            </div>
                          </div>
                          {offer.admin_feedback && (
                            <div className="admin-feedback">
                              <strong>Admin Feedback:</strong> {offer.admin_feedback}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Review Form Row */}
                  {reviewingId === offer.id && (
                    <tr className="form-row">
                      <td colSpan="9">
                        <div className="inline-form">
                          <textarea
                            placeholder="Rejection reason or feedback (optional)..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows="2"
                          />
                          <div className="form-actions">
                            <button 
                              className="btn-confirm reject"
                              onClick={() => handleReview(offer.id, 2)}
                            >
                              ✕ Confirm Rejection
                            </button>
                            <button 
                              className="btn-cancel"
                              onClick={() => { setReviewingId(null); setFeedback(''); }}
                            >
                              Cancel
                            </button>
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
      )}
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
};

export default PendingOffers;
