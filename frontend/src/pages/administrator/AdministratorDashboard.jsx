import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getcurrentuser } from '../../api';
import './AdministratorDashboard.css';

const AdministratorDashboard = () => {
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
          <div className="icon-wrapper admin-icon">
            <i className="fas fa-user-shield"></i>
          </div>
          <h1 className="welcome-title">
            Welcome back, <span className="highlight">{user?.first_name || 'Administrator'}</span>! 👋
          </h1>
          <p className="welcome-subtitle">
            Manage your institution with ease and efficiency
          </p>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="info-card admin-card" onClick={() => navigate('/user-management')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <h3>User Management</h3>
          <p>Oversee students, teachers, and company accounts</p>
        </div>

        <div className="info-card admin-card" onClick={() => navigate('/pending-internships')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <h3>Student Internships</h3>
          <p>Review student-initiated internship applications</p>
        </div>

        <div className="info-card admin-card" onClick={() => navigate('/pending-offers')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-building"></i>
          </div>
          <h3>Company Offers</h3>
          <p>Approve company internship postings</p>
        </div>

        <div className="info-card admin-card" onClick={() => navigate('/soutenance-planning')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h3>Soutenance Planning</h3>
          <p>Plan and manage defense schedules</p>
        </div>

        <div className="info-card admin-card" onClick={() => navigate('/archieved-reports')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-archive"></i>
          </div>
          <h3>Archived Reports</h3>
          <p>View historical internship reports</p>
        </div>
      </div>
    </div>
  );
};

export default AdministratorDashboard;