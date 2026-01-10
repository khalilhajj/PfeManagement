import React, { useState, useEffect } from 'react';
import { browseInternshipOffers, applyToOffer, getMyApplications } from '../../api';
import CustomModal from '../../Components/common/CustomModal';
import './BrowseInternships.css';

const BrowseInternships = () => {
  const [offers, setOffers] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [applyingTo, setApplyingTo] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    cv_file: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [offersData, appsData] = await Promise.all([
        browseInternshipOffers(),
        getMyApplications()
      ]);
      setOffers(offersData);
      setMyApplications(appsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (typeFilter) filters.type = typeFilter;
      const data = await browseInternshipOffers(filters);
      setOffers(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (offerId) => {
    // Validate CV is selected
    if (!applicationData.cv_file) {
      setModal({ isOpen: true, title: 'CV Required', message: 'Please upload your CV/Resume to apply for this internship.', type: 'warning', onConfirm: null });
      return;
    }
    
    try {
      await applyToOffer({
        offer: offerId,
        cover_letter: applicationData.cover_letter,
        cv_file: applicationData.cv_file
      });
      setModal({ isOpen: true, title: 'Application Submitted!', message: 'Your application has been submitted successfully. Good luck!', type: 'success', onConfirm: null });
      setApplyingTo(null);
      setApplicationData({ cover_letter: '', cv_file: null });
      fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.cv_file?.[0] || 
                     error.response?.data?.error || 
                     error.response?.data?.offer?.[0] || 
                     'Failed to apply';
      setModal({ isOpen: true, title: 'Application Failed', message: errMsg, type: 'danger', onConfirm: null });
    }
  };

  const hasApplied = (offerId) => {
    return myApplications.some(app => app.offer === offerId);
  };

  const getApplicationStatus = (offerId) => {
    const app = myApplications.find(app => app.offer === offerId);
    return app ? app.status : null;
  };

  const getStatusLabel = (status) => {
    const labels = {
      0: 'Pending',
      1: 'Interview',
      2: 'Accepted',
      3: 'Rejected'
    };
    return labels[status] || 'Unknown';
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="browse-container">
      <div className="page-header">
        <h1> Browse Internship Opportunities</h1>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="Stage">Stage</option>
            <option value="PFE">PFE</option>
            <option value="Internship">Internship</option>
          </select>
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="offers-grid">
        {offers.length === 0 ? (
          <div className="empty-state">
            <h3>No internships available</h3>
            <p>Check back later for new opportunities!</p>
          </div>
        ) : (
          offers.map(offer => (
            <div key={offer.id} className="offer-card">
              <div className="offer-header">
                <div className="company-info">
                  <img 
                    src={offer.company_info?.profile_picture || '/default-company.png'} 
                    alt="Company" 
                    className="company-avatar"
                  />
                  <div>
                    <h3>{offer.title}</h3>
                    <p className="company-name">{offer.company_info?.full_name}</p>
                  </div>
                </div>
                <span className="type-badge">{offer.type_display}</span>
              </div>

              <p className="offer-description">{offer.description}</p>

              {offer.requirements && (
                <div className="requirements">
                  <strong>Requirements:</strong>
                  <p>{offer.requirements}</p>
                </div>
              )}

              <div className="offer-meta">
                {offer.location && (
                  <span><i className="fas fa-map-marker-alt"></i> {offer.location}</span>
                )}
                {offer.duration && (
                  <span><i className="fas fa-clock"></i> {offer.duration}</span>
                )}
                <span><i className="fas fa-users"></i> {offer.positions_available - offer.approved_applications_count} positions left</span>
              </div>

              <div className="offer-dates">
                📅 {offer.start_date} - {offer.end_date}
              </div>

              <div className="offer-footer">
                {hasApplied(offer.id) ? (
                  <div className={`application-status status-${getApplicationStatus(offer.id)}`}>
                    {getStatusLabel(getApplicationStatus(offer.id))}
                  </div>
                ) : (
                  <>
                    {applyingTo === offer.id ? (
                      <div className="apply-form">
                        <textarea
                          placeholder="Write a cover letter (optional)..."
                          value={applicationData.cover_letter}
                          onChange={(e) => setApplicationData(prev => ({
                            ...prev,
                            cover_letter: e.target.value
                          }))}
                        />
                        
                        <div style={{ 
                          margin: '1rem 0', 
                          padding: '1rem', 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '8px',
                          border: applicationData.cv_file ? '2px solid #28a745' : '2px dashed #dc3545'
                        }}>
                          <label style={{ fontWeight: '600', color: '#333', display: 'block', marginBottom: '0.5rem' }}>
                            📄 Upload CV/Resume <span style={{ color: '#dc3545' }}>*</span>
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setApplicationData(prev => ({
                              ...prev,
                              cv_file: e.target.files[0]
                            }))}
                            style={{ 
                              display: 'block',
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          />
                          {applicationData.cv_file && (
                            <p style={{ color: '#28a745', marginTop: '0.5rem', marginBottom: 0 }}>
                              ✓ Selected: {applicationData.cv_file.name}
                            </p>
                          )}
                          <small style={{ color: '#888', fontSize: '0.75rem' }}>
                            Required - Max 5MB (PDF, Word, JPEG, PNG)
                          </small>
                        </div>

                        <div className="apply-buttons">
                          <button 
                            className="btn-primary"
                            onClick={() => handleApply(offer.id)}
                            disabled={!applicationData.cv_file}
                          >
                            Submit Application
                          </button>
                          <button 
                            className="btn-secondary"
                            onClick={() => {
                              setApplyingTo(null);
                              setApplicationData({ cover_letter: '', cv_file: null });
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="btn-apply"
                        onClick={() => setApplyingTo(offer.id)}
                        disabled={offer.positions_available <= offer.approved_applications_count}
                      >
                        {offer.positions_available <= offer.approved_applications_count 
                          ? 'No positions available' 
                          : 'Apply Now'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
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

export default BrowseInternships;
