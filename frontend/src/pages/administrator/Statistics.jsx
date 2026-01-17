import React, { useState, useEffect } from 'react';
import { getAdminStatistics } from '../../api';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  FaUsers, FaGraduationCap, FaChalkboardTeacher, FaBuilding, 
  FaBriefcase, FaCalendarAlt, FaFileAlt, FaDoorOpen, FaChartLine 
} from 'react-icons/fa';
import './Statistics.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getAdminStatistics();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="statistics-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1><FaChartLine /> Platform Statistics</h1>
          <p>Comprehensive analytics and insights</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card card-users">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>{stats.overview.total_users}</h3>
            <p>Total Active Users</p>
          </div>
        </div>

        <div className="stat-card card-internships">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-details">
            <h3>{stats.overview.total_internships}</h3>
            <p>Total Internships</p>
            <small>{stats.overview.current_year_internships} this year</small>
          </div>
        </div>

        <div className="stat-card card-soutenances">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-details">
            <h3>{stats.overview.total_soutenances}</h3>
            <p>Soutenances</p>
            <small>Avg Grade: {stats.soutenances.average_grade}</small>
          </div>
        </div>

        <div className="stat-card card-reports">
          <div className="stat-icon">
            <FaFileAlt />
          </div>
          <div className="stat-details">
            <h3>{stats.overview.total_reports}</h3>
            <p>Reports Submitted</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Users Distribution */}
        <div className="chart-card">
          <h3><FaUsers /> User Distribution</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.users.distribution_chart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.users.distribution_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <div className="legend-item">
                <FaGraduationCap style={{ color: COLORS[0] }} />
                <span>Students: {stats.users.students}</span>
              </div>
              <div className="legend-item">
                <FaChalkboardTeacher style={{ color: COLORS[1] }} />
                <span>Teachers: {stats.users.teachers}</span>
              </div>
              <div className="legend-item">
                <FaBuilding style={{ color: COLORS[2] }} />
                <span>Companies: {stats.users.companies}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Internship Status */}
        <div className="chart-card">
          <h3><FaBriefcase /> Internship Status</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.internships.status_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
            <div className="stats-summary">
              <div className="summary-item">
                <span className="badge badge-pending">Pending</span>
                <strong>{stats.internships.pending}</strong>
              </div>
              <div className="summary-item">
                <span className="badge badge-approved">Approved</span>
                <strong>{stats.internships.approved}</strong>
              </div>
              <div className="summary-item">
                <span className="badge badge-rejected">Rejected</span>
                <strong>{stats.internships.rejected}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="chart-card full-width">
          <h3><FaChartLine /> Internship Monthly Trend</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.internships.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  name="Internships"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Soutenance Status */}
        <div className="chart-card">
          <h3><FaCalendarAlt /> Soutenance Status</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.soutenances.status_chart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.soutenances.status_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="stats-summary">
              <div className="summary-item">
                <span className="badge badge-planned">Planned</span>
                <strong>{stats.soutenances.planned}</strong>
              </div>
              <div className="summary-item">
                <span className="badge badge-done">Done</span>
                <strong>{stats.soutenances.done}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Room Availability */}
        <div className="chart-card">
          <h3><FaDoorOpen /> Room Availability</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.rooms.chart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.rooms.chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="stats-summary">
              <div className="summary-item">
                <span className="badge badge-available">Available</span>
                <strong>{stats.rooms.available} / {stats.rooms.total}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="additional-stats">
        <div className="stat-detail-card">
          <h4><FaFileAlt /> Report Statistics</h4>
          <div className="stat-rows">
            <div className="stat-row">
              <span>Total Reports:</span>
              <strong>{stats.reports.total}</strong>
            </div>
            <div className="stat-row">
              <span>Final Reports:</span>
              <strong>{stats.reports.final}</strong>
            </div>
            <div className="stat-row">
              <span>Pending Review:</span>
              <strong>{stats.reports.pending_review}</strong>
            </div>
          </div>
        </div>

        <div className="stat-detail-card">
          <h4><FaBuilding /> Company Offers</h4>
          <div className="stat-rows">
            <div className="stat-row">
              <span>Total Offers:</span>
              <strong>{stats.offers.total}</strong>
            </div>
            <div className="stat-row">
              <span>Pending:</span>
              <strong>{stats.offers.pending}</strong>
            </div>
            <div className="stat-row">
              <span>Approved:</span>
              <strong>{stats.offers.approved}</strong>
            </div>
          </div>
        </div>

        <div className="stat-detail-card">
          <h4><FaBriefcase /> Applications</h4>
          <div className="stat-rows">
            <div className="stat-row">
              <span>Total Applications:</span>
              <strong>{stats.applications.total}</strong>
            </div>
            <div className="stat-row">
              <span>Pending:</span>
              <strong>{stats.applications.pending}</strong>
            </div>
            <div className="stat-row">
              <span>Accepted:</span>
              <strong>{stats.applications.accepted}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
