import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getcurrentuser, getCompanyOffers, getOfferApplications } from '../../api';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalOffers: 0,
    pendingOffers: 0,
    approvedOffers: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, offers, applications] = await Promise.all([
          getcurrentuser(),
          getCompanyOffers(),
          getOfferApplications()
        ]);
        setUser(userData);
        setStats({
          totalOffers: offers.length,
          pendingOffers: offers.filter(o => o.status === 0).length,
          approvedOffers: offers.filter(o => o.status === 1).length,
          totalApplications: applications.length,
          pendingApplications: applications.filter(a => a.status === 0).length
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="welcome-hero">
        <div className="welcome-content">
          <div className="icon-wrapper company-icon">
            <i className="fas fa-building"></i>
          </div>
          <h1 className="welcome-title">
            Welcome, <span className="highlight">{user?.first_name || 'Company'}</span>! 💼
          </h1>
          <p className="welcome-subtitle">
            Discover talented interns and build your team
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{stats.totalOffers}</div>
          <div className="stat-label">Total Offers</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{stats.pendingOffers}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="stat-card success">
          <div className="stat-number">{stats.approvedOffers}</div>
          <div className="stat-label">Active Offers</div>
        </div>
        <div className="stat-card info">
          <div className="stat-number">{stats.pendingApplications}</div>
          <div className="stat-label">Applications to Review</div>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="info-card company-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-building"></i>
          </div>
          <h3>Company Profile</h3>
          <p>Manage your company information</p>
        </div>

        <div className="info-card company-card" onClick={() => navigate('/company/post-internship')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-plus-circle"></i>
          </div>
          <h3>Post Internships</h3>
          <p>Create opportunities for talented students</p>
        </div>

        <div className="info-card company-card" onClick={() => navigate('/company/applications')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-inbox"></i>
          </div>
          <h3>Applications</h3>
          <p>Review and manage student applications</p>
          {stats.pendingApplications > 0 && (
            <span className="badge">{stats.pendingApplications} new</span>
          )}
        </div>

        <div className="info-card company-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-users-cog"></i>
          </div>
          <h3>Settings</h3>
          <p>Configure your preferences</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;