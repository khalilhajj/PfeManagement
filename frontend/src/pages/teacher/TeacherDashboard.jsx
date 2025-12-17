import React, { useEffect, useState } from 'react';
import { getcurrentuser } from '../../api';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
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
        <div className="info-card teacher-card">
          <div className="card-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <h3>My Students</h3>
          <p>Supervise and support student progress</p>
        </div>

        <div className="info-card teacher-card">
          <div className="card-icon">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <h3>Report Reviews</h3>
          <p>Evaluate student internship reports</p>
        </div>

        <div className="info-card teacher-card">
          <div className="card-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h3>Invitations</h3>
          <p>Review supervision requests from students</p>
        </div>

        <div className="info-card teacher-card">
          <div className="card-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h3>Schedule</h3>
          <p>Manage meetings and consultations</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;