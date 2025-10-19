import React, { useState } from 'react';
import { login } from '../../api';
import './Login.css';
import {jwtDecode} from 'jwt-decode';
const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await login(formData);
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      const decodedToken = jwtDecode(data.access);
      const userRole = decodedToken.role_name;
      if (userRole === 'Student') {
        window.location.href = '/student-dashboard';
      } else if (userRole === 'Teacher') {
        window.location.href = '/teacher-dashboard';
      } else if (userRole === 'Administrator') {
        window.location.href = '/admin-dashboard';
      } else if (userRole === 'Company') {
        window.location.href = '/company-dashboard';
      } else {
        setError('Invalid role. Please contact support.');
      }
  
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-hero">
        <div className="hero-content">
          <div className="logo">
            <div className="logo-icon">🎓</div>
            <h1>InternFlow</h1>
          </div>
          <h2>End of Study Internship Portal</h2>
          <p>Manage your internship journey with our comprehensive platform. Track progress, submit reports, and connect with supervisors.</p>
          
          <div className="features">
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Progress Tracking</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📝</span>
              <span>Report Submission</span>
            </div>
            <div className="feature">
              <span className="feature-icon">👨‍🏫</span>
              <span>Supervisor Access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-section">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your institutional username"
                  required
                  disabled={loading}
                  className={error ? 'error' : ''}
                />
                <span className="input-icon">✉️</span>
              </div>
            </div>

            <div className="input-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password" className="forgot-link">
                  Forgot password?
                </a>
              </div>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className={error ? 'error' : ''}
                />
                <span className="input-icon">🔒</span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !formData.username || !formData.password}
              className="login-button"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="security-notice">
            <div className="security-icon">🛡️</div>
            <span>Secure login protected by institutional authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;