import React, { useEffect, useState } from 'react';
import { getcurrentuser } from '../../api';
import './AdministratorDashboard.css';

const AdministratorDashboard = () => {
  const [user, setUser] = useState(null);

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
        <div className="info-card admin-card">
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <h3>User Management</h3>
          <p>Oversee students, teachers, and company accounts</p>
        </div>

        <div className="info-card admin-card">
          <div className="card-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <h3>Internship Oversight</h3>
          <p>Review and approve internship applications</p>
        </div>

        <div className="info-card admin-card">
          <div className="card-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h3>Analytics</h3>
          <p>Track performance and generate reports</p>
        </div>

        <div className="info-card admin-card">
          <div className="card-icon">
            <i className="fas fa-cog"></i>
          </div>
          <h3>System Settings</h3>
          <p>Configure platform preferences</p>
        </div>
      </div>
    </div>
  );
};

export default AdministratorDashboard;