import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getcurrentuser } from '../../api';
import './StudentDashboard.css';

const StudentDashboard = () => {
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
          <div className="icon-wrapper student-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h1 className="welcome-title">
            Hello, <span className="highlight">{user?.first_name || 'Student'}</span>! 🎓
          </h1>
          <p className="welcome-subtitle">
            Your journey to professional excellence starts here
          </p>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="info-card student-card" onClick={() => navigate('/browse-internships')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-search"></i>
          </div>
          <h3>Browse Internships</h3>
          <p>Find and apply to internship opportunities</p>
        </div>

        <div className="info-card student-card" onClick={() => navigate('/cv-analyzer')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-file-text"></i>
          </div>
          <h3>CV Analyzer</h3>
          <p>Get AI-powered feedback on your CV</p>
        </div>

        <div className="info-card student-card" onClick={() => navigate('/my-soutenances')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-calendar"></i>
          </div>
          <h3>My Soutenance</h3>
          <p>View your defense schedule and details</p>
        </div>

        <div className="info-card student-card" onClick={() => navigate('/student/reports')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-book"></i>
          </div>
          <h3>My Reports</h3>
          <p>Submit and manage your internship reports</p>
        </div>

        <div className="info-card student-card" onClick={() => navigate('/archieved-reports')} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <i className="fas fa-archive"></i>
          </div>
          <h3>Archived Reports</h3>
          <p>Access your past reports and submissions</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;