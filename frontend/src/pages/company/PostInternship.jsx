import React, { useState, useEffect } from 'react';
import { getCompanyOffers, createInternshipOffer, deleteInternshipOffer } from '../../api';
import CustomModal from '../../Components/common/CustomModal';
import './PostInternship.css';

const PostInternship = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  
  // Skills/Requirements tags
  const [requirementTags, setRequirementTags] = useState([]);
  const [requirementInput, setRequirementInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    type: 'Stage',
    location: '',
    duration: '',
    start_date: '',
    end_date: '',
    positions_available: 1
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const data = await getCompanyOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequirementKeyDown = (e) => {
    if (e.key === ' ' && requirementInput.trim()) {
      e.preventDefault();
      const newTag = requirementInput.trim();
      if (!requirementTags.includes(newTag)) {
        setRequirementTags([...requirementTags, newTag]);
      }
      setRequirementInput('');
    } else if (e.key === 'Backspace' && !requirementInput && requirementTags.length > 0) {
      e.preventDefault();
      setRequirementTags(requirementTags.slice(0, -1));
    }
  };

  const removeRequirementTag = (indexToRemove) => {
    setRequirementTags(requirementTags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Combine tags into requirements string
      const requirementsString = requirementTags.join(', ');
      const submitData = { ...formData, requirements: requirementsString };
      
      await createInternshipOffer(submitData);
      setModal({ isOpen: true, title: 'Success!', message: 'Internship offer created! Waiting for admin approval.', type: 'success', onConfirm: null });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        type: 'Stage',
        location: '',
        duration: '',
        start_date: '',
        end_date: '',
        positions_available: 1
      });
      setRequirementTags([]);
      setRequirementInput('');
      fetchOffers();
    } catch (error) {
      setModal({ isOpen: true, title: 'Error', message: error.response?.data?.error || 'Failed to create offer', type: 'danger', onConfirm: null });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (offerId) => {
    setModal({
      isOpen: true,
      title: 'Delete Offer',
      message: 'Are you sure you want to delete this offer? This action cannot be undone.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteInternshipOffer(offerId);
          fetchOffers();
        } catch (error) {
          setModal({ isOpen: true, title: 'Error', message: 'Failed to delete offer', type: 'danger', onConfirm: null });
        }
      }
    });
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

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="post-internship-container">
      <div className="page-header">
        <h1>📋 My Internship Offers</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Post New Offer'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create New Internship Offer</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Frontend Developer Intern"
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="Stage">Stage</option>
                  <option value="PFE">PFE (Projet de Fin d'Études)</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Describe the internship role and responsibilities..."
              />
            </div>

            <div className="form-group">
              <label>Requirements (Skills)</label>
              <div className="tags-input-container">
                <input
                  type="text"
                  className="tag-input"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyDown={handleRequirementKeyDown}
                  placeholder="Type a skill and press space..."
                />
                <small className="input-hint">💡 Press space to add each skill as a tag</small>
                {requirementTags.length > 0 && (
                  <div className="tags-display">
                    {requirementTags.map((tag, index) => (
                      <span key={index} className="skill-tag">
                        {tag}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => removeRequirementTag(index)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Tunis, Remote"
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 months"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Positions Available</label>
                <input
                  type="number"
                  name="positions_available"
                  value={formData.positions_available}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Offer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="offers-section">
        {offers.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No internship offers yet</h3>
            <p>Click "Post New Offer" to create your first internship position!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="offers-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Duration</th>
                  <th>Period</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => (
                  <React.Fragment key={offer.id}>
                    <tr className={`offer-row status-${offer.status}`}>
                      <td className="title-cell">
                        <strong>{offer.title}</strong>
                        <button 
                          className="btn-expand"
                          onClick={() => setExpandedId(expandedId === offer.id ? null : offer.id)}
                        >
                          {expandedId === offer.id ? '▲' : '▼'}
                        </button>
                      </td>
                      <td>
                        <span className="type-badge">{offer.type_display}</span>
                      </td>
                      <td>{offer.location || '-'}</td>
                      <td>{offer.duration || '-'}</td>
                      <td className="date-cell">
                        <span>{offer.start_date}</span>
                        <span className="date-sep">→</span>
                        <span>{offer.end_date}</span>
                      </td>
                      <td className="stats-cell">
                        <div className="stats-info">
                          <span className="apps-count">{offer.applications_count} applied</span>
                          <span className="approved-count">{offer.approved_applications_count}/{offer.positions_available} filled</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(offer.status)}</td>
                      <td className="actions-cell">
                        {offer.status === 0 && (
                          <button 
                            className="btn-action delete"
                            onClick={() => handleDelete(offer.id)}
                            title="Delete"
                          >
                            🗑
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedId === offer.id && (
                      <tr className="expanded-row">
                        <td colSpan="8">
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
                            </div>
                            {offer.admin_feedback && offer.status === 2 && (
                              <div className="admin-feedback">
                                <strong>Admin feedback:</strong> {offer.admin_feedback}
                              </div>
                            )}
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
      </div>

      <CustomModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.type === 'confirm' ? 'Delete' : 'OK'}
      />
    </div>
  );
};

export default PostInternship;
