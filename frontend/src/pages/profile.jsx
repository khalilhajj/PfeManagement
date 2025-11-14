import React, { useState, useRef, useEffect } from 'react';
import './profile.css';
import { getcurrentuser } from '../api';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getcurrentuser();
                setUser(data);
                console.log(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUser({ ...user, avatar: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        console.log("User data saved:", user);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data if needed
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Profile Settings</h1>
                <p>Manage your personal information and preferences</p>
            </div>

            <div className="profile-content">
                <div className="profile-sidebar">
                    <div
                        className={`avatar-container ${isEditing ? 'editable' : ''}`}
                        onClick={handleAvatarClick}
                    >
                        <img
                            src={`${BACKEND_URL}${user.profile_picture}`} 
                            alt="User Avatar"
                            className="avatar"
                        />
                        {isEditing && (
                            <div className="avatar-overlay">
                                <i className="fas fa-camera"></i>
                                <span>Change Photo</span>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="user-quick-info">
                        <h2>{user.name}</h2>
                        <p className="user-email">{user.username}</p>
                        <p className={`badge ${
                            user.role === 'Student' ? 'badge-success' :
                            user.role === 'Administrator' ? 'badge-primary' :
                            user.role === 'Teacher' ? 'badge-warning' :
                            user.role === 'Company' ? 'badge-info' :
                            'badge-secondary'
                        }`}>
                            {user.role}
                        </p>
                    </div>

                    {!isEditing && (
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-number">47</span>
                                <span className="stat-label">Projects</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">12</span>
                                <span className="stat-label">Reports</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">2</span>
                                <span className="stat-label">Years</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Form */}
                <div className="profile-form">
                    <div className="form-section">
                        <h3>Personal Information</h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name"> First Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={user.first_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">  Last Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={user.last_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={user.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Username</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={user.username}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>

                        </div>
                    </div>

                    <div className="form-actions">
                        {isEditing ? (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                >
                                    <i className="fas fa-save"></i>
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleEdit}
                            >
                                <i className="fas fa-edit"></i>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;