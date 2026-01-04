import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getcurrentuser } from '../../api';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
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
          <div className="icon-wrapper teacher-icon">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <h1 className="welcome-title">
            Welcome, <span className="highlight">Prof. {user?.last_name || 'Teacher'}</span>! 📚
          </h1>
          <p className="welcome-subtitle">
            Guide and mentor the next generation of professionals
          </p>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="info-card teacher-card" onClick={() => navigate('/pending-invitations')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h3>Pending Invitations</h3>
          <p>Review supervision requests from students</p>
        </div>

        <div className="info-card teacher-card" onClick={() => navigate('/teacher/pending-reviews')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <h3>Pending Reviews</h3>
          <p>Evaluate student internship reports</p>
        </div>

        <div className="info-card teacher-card" onClick={() => navigate('/teacher-soutenances')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h3>My Soutenances</h3>
          <p>View and manage defense schedules</p>
        </div>

        <div className="info-card teacher-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-user"></i>
          </div>
          <h3>Profile</h3>
          <p>Update your information and preferences</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;