import React, { useEffect, useState } from 'react';
import { getcurrentuser } from '../../api';
import './StudentDashboard.css';

const StudentDashboard = () => {
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
        <div className="info-card student-card">
          <div className="card-icon">
            <i className="fas fa-search"></i>
          </div>
          <h3>Find Internships</h3>
          <p>Explore exciting opportunities from top companies</p>
        </div>

        <div className="info-card student-card">
          <div className="card-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <h3>My Applications</h3>
          <p>Track your internship applications and status</p>
        </div>

        <div className="info-card student-card">
          <div className="card-icon">
            <i className="fas fa-book"></i>
          </div>
          <h3>Reports</h3>
          <p>Submit and manage your internship reports</p>
        </div>

        <div className="info-card student-card">
          <div className="card-icon">
            <i className="fas fa-star"></i>
          </div>
          <h3>Progress</h3>
          <p>Monitor your academic achievements</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;