import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getAllRoles,
  getUserStats
} from '../../api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    is_active: true,
    profile_picture: null
  });
  
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    new_password_confirm: ''
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, selectedRoleFilter, statusFilter]);

  const fetchInitialData = async () => {
    try {
      const [rolesData, statsData] = await Promise.all([
        getAllRoles(),
        getUserStats()
      ]);
      setRoles(rolesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedRoleFilter) params.role = selectedRoleFilter;
      if (statusFilter !== '') params.is_active = statusFilter === 'active';
      
      const data = await getAllUsers(params);
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = files[0];
      if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          setError('Please select a valid image file (JPEG, PNG, GIF)');
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB');
          return;
        }
        
        setFormData(prev => ({ ...prev, [name]: file }));
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: '',
      is_active: true,
      profile_picture: null
    });
    setProfilePreview(null);
    setError('');
  };

  const resetPasswordForm = () => {
    setPasswordData({
      new_password: '',
      new_password_confirm: ''
    });
    setError('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      password_confirm: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.role,
      is_active: user.is_active,
      profile_picture: null
    });
    setProfilePreview(user.profile_picture ? `${BACKEND_URL}${user.profile_picture}` : null);
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    resetPasswordForm();
    setShowPasswordModal(true);
  };

  const openDetailModal = async (user) => {
    try {
      const detailData = await getUserDetail(user.id);
      setSelectedUser(detailData);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load user details');
    }
  };

  const closeAllModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowPasswordModal(false);
    setShowDetailModal(false);
    setSelectedUser(null);
    resetForm();
    resetPasswordForm();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await createUser(formData);
      setSuccessMessage(response.message || 'User created successfully!');
      await fetchUsers();
      await fetchInitialData(); // Refresh stats
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        // Display field-specific errors
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(errorData?.error || 'Failed to create user');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const updateData = { ...formData };
      delete updateData.username; // Username cannot be updated
      delete updateData.password; // Password updated separately
      delete updateData.password_confirm;
      
      const response = await updateUser(selectedUser.id, updateData);
      setSuccessMessage(response.message || 'User updated successfully!');
      await fetchUsers();
      await fetchInitialData(); // Refresh stats
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(errorData?.error || 'Failed to update user');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await deleteUser(selectedUser.id);
      setSuccessMessage(response.message || 'User deleted successfully!');
      await fetchUsers();
      await fetchInitialData(); // Refresh stats
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await resetUserPassword(selectedUser.id, passwordData);
      setSuccessMessage(response.message || 'Password reset successfully!');
      closeAllModals();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        setError(errorMessages);
      } else {
        setError(errorData?.error || 'Failed to reset password');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge badge-active">
        <i className="fas fa-check-circle"></i> Active
      </span>
    ) : (
      <span className="badge badge-inactive">
        <i className="fas fa-times-circle"></i> Inactive
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-management-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="page-header">
        <div>
          <h1><i className="fas fa-users-cog"></i> User Management</h1>
          <p>Manage system users and their roles</p>
        </div>
        <button id="add-user-button" className="btn btn-primary" onClick={openCreateModal}>
          <i className="fas fa-plus"></i> Add New User
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.total_users}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card stat-active">
            <div className="stat-icon">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.active_users}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="stat-card stat-inactive">
            <div className="stat-icon">
              <i className="fas fa-user-times"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.inactive_users}</h3>
              <p>Inactive Users</p>
            </div>
          </div>
          {Object.entries(stats.users_by_role || {}).map(([role, count]) => (
            <div key={role} className="stat-card stat-role">
              <div className="stat-icon">
                <i className="fas fa-user-tag"></i>
              </div>
              <div className="stat-content">
                <h3>{count}</h3>
                <p>{role}s</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by username, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {(searchTerm || selectedRoleFilter || statusFilter) && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedRoleFilter('');
              setStatusFilter('');
            }}
          >
            <i className="fas fa-times"></i> Clear Filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <i className="fas fa-users-slash"></i>
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.profile_picture ? (
                          <img src={`${BACKEND_URL}${user.profile_picture}`} alt={user.username} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <div>
                        <strong>{user.full_name || user.username}</strong>
                        <small>@{user.username}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`role-badge role-${user.role_name?.toLowerCase()}`}>
                      {user.role_name}
                    </span>
                  </td>
                  <td>{getStatusBadge(user.is_active)}</td>
                  <td>{new Date(user.date_joined).toLocaleDateString('en-GB')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-view"
                        onClick={() => openDetailModal(user)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => openEditModal(user)}
                        title="Edit User"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-icon btn-password"
                        onClick={() => openPasswordModal(user)}
                        title="Reset Password"
                      >
                        <i className="fas fa-key"></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => openDeleteModal(user)}
                        title="Delete User"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/*modals */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-user-plus"></i> Create New User</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Username <span className="required">*</span></label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      minLength={3}
                      maxLength={30}
                      pattern="[a-zA-Z0-9_]+"
                      placeholder="Enter username"
                    />
                    <small>Alphanumeric and underscores only, 3-30 characters</small>
                  </div>

                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password <span className="required">*</span></label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      placeholder="Enter password"
                    />
                    <small>Min 8 characters, include uppercase, lowercase, and digit</small>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password <span className="required">*</span></label>
                    <input
                      type="password"
                      name="password_confirm"
                      id="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      pattern="[0-9\s\-\+]+"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role <span className="required">*</span></label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Profile Picture</label>
                  <input
                    type="file"
                    id="profile_picture"
                    name="profile_picture"
                    onChange={handleInputChange}
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                  />
                  {profilePreview && (
                    <div className="image-preview">
                      <img src={profilePreview} alt="Preview" />
                    </div>
                  )}
                  <small>JPEG, PNG, or GIF. Max 5MB</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span>Active Account</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-user-button"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-user-edit"></i> Edit User</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
                  </div>
                )}

                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="disabled-input"
                  />
                  <small>Username cannot be changed</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      pattern="[0-9\s\-\+]+"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Role <span className="required">*</span></label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Profile Picture</label>
                  <input
                    type="file"
                    name="profile_picture"
                    onChange={handleInputChange}
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                  />
                  {profilePreview && (
                    <div className="image-preview">
                      <img src={profilePreview} alt="Preview" />
                    </div>
                  )}
                  <small>JPEG, PNG, or GIF. Max 5MB</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span>Active Account</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Update User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-trash-alt"></i> Delete User</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <p className="confirm-message">
                Are you sure you want to delete <strong>{selectedUser.full_name || selectedUser.username}</strong>?
                This will deactivate the account.
              </p>

              <div className="user-summary">
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role_name}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={closeAllModals}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-key"></i> Reset Password</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
                  </div>
                )}

                <p className="info-message">
                  Reset password for <strong>{selectedUser.full_name || selectedUser.username}</strong>
                </p>

                <div className="form-group">
                  <label>New Password <span className="required">*</span></label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    placeholder="Enter new password"
                  />
                  <small>Min 8 characters, include uppercase, lowercase, and digit</small>
                </div>

                <div className="form-group">
                  <label>Confirm New Password <span className="required">*</span></label>
                  <input
                    type="password"
                    name="new_password_confirm"
                    value={passwordData.new_password_confirm}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-user"></i> User Details</h2>
              <button className="modal-close" onClick={closeAllModals}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="user-detail-container">
                <div className="user-detail-avatar">
                  {selectedUser.profile_picture ? (
                    <img src={`${BACKEND_URL}${selectedUser.profile_picture}`} alt={selectedUser.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>

                <div className="user-detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">{selectedUser.username}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{selectedUser.full_name || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedUser.phone || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">
                      <span className={`role-badge role-${selectedUser.role_name?.toLowerCase()}`}>
                        {selectedUser.role_name}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{getStatusBadge(selectedUser.is_active)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Staff Status:</span>
                    <span className="detail-value">{selectedUser.is_staff ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date Joined:</span>
                    <span className="detail-value">
                      {new Date(selectedUser.date_joined).toLocaleString('en-GB')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">
                      {selectedUser.last_login 
                        ? new Date(selectedUser.last_login).toLocaleString('en-GB')
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeAllModals}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => {
                closeAllModals();
                setTimeout(() => openEditModal(selectedUser), 100);
              }}>
                <i className="fas fa-edit"></i>
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;