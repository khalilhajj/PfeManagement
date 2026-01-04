import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getcurrentuser } from '../../api';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getcurrentuser();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
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

      <div className="dashboard-cards">
        <div className="info-card company-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-building"></i>
          </div>
          <h3>Company Profile</h3>
          <p>Manage your company information</p>
        </div>

        <div className="info-card company-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-plus-circle"></i>
          </div>
          <h3>Post Internships</h3>
          <p>Create opportunities for talented students</p>
        </div>

        <div className="info-card company-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-inbox"></i>
          </div>
          <h3>Applications</h3>
          <p>Review and manage student applications</p>
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