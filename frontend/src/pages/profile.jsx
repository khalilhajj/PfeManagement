import React, { useState, useRef, useEffect } from 'react';
import './profile.css';
import { getcurrentuser, updateUserProfile, changePassword } from '../api';
import StudentInternships from '../Components/StudentComponent/StudentInternships';


const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({});
    const [originalUser, setOriginalUser] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // Password change states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getcurrentuser();
                setUser(data);
                setOriginalUser(data); 
                console.log(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

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
        const file = e.target.files?.[0];
        
        if (!file) {
            return;
        }

        console.log('File selected:', file.name, file.type, file.size);

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            e.target.value = '';
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            e.target.value = '';
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
        setProfilePictureFile(file);
        setError('');

        console.log('Preview URL created:', newPreviewUrl);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccessMessage('');
    };

    const handleSave = async () => {
        setSaveLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const updateData = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
            };

            if (profilePictureFile) {
                updateData.profile_picture = profilePictureFile;
                console.log('Uploading profile picture:', profilePictureFile.name);
            }

            const updatedUser = await updateUserProfile(updateData);
            
            setUser(updatedUser);
            setOriginalUser(updatedUser);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            
            setProfilePictureFile(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (err) {
            console.error('Update error:', err);
            setError(
                err.response?.data?.message || 
                err.response?.data?.error ||
                'Failed to update profile. Please try again.'
            );
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setUser(originalUser);
        setProfilePictureFile(null);
        
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        
        setError('');
        setSuccessMessage('');
    };

    const getAvatarUrl = () => {
        if (previewUrl) {
            return previewUrl;
        }
        
        if (user.profile_picture) {
            if (user.profile_picture.startsWith('http')) {
                return user.profile_picture;
            }
            return `${BACKEND_URL}${user.profile_picture}`;
        }
        
        return 'https://media.istockphoto.com/id/1491341037/vector/sasquatch-head-wearing-a-retro-eyeglasses-vector-illustration.jpg?s=612x612&w=0&k=20&c=cSFJOnASO13GhwPnYXjlHIA8u95jvi_zTJLJUsGJpcM=';
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
        setPasswordError('');
    };

    const handleOpenPasswordModal = () => {
        setShowPasswordModal(true);
        setPasswordData({
            old_password: '',
            new_password: '',
            confirm_password: ''
        });
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordData({
            old_password: '',
            new_password: '',
            confirm_password: ''
        });
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        // Client-side validation
        if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
            setPasswordError('All fields are required');
            setPasswordLoading(false);
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError('New passwords do not match');
            setPasswordLoading(false);
            return;
        }

        if (passwordData.new_password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            setPasswordLoading(false);
            return;
        }

        try {
            const response = await changePassword(passwordData);
            setPasswordSuccess(response.message || 'Password changed successfully!');
            
            setTimeout(() => {
                handleClosePasswordModal();
            }, 2000);

        } catch (err) {
            console.error('Password change error:', err);
            const errorMessage = err.response?.data?.error || 
                                err.response?.data?.old_password?.[0] ||
                                err.response?.data?.message ||
                                'Failed to change password. Please try again.';
            setPasswordError(errorMessage);
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }
    const isStudent = user.role && user.role === 'Student';
    console.log('Rendering profile for role:', user.role);
    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Profile Settings</h1>
                <p>Manage your personal information and preferences</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>
                    {successMessage}
                </div>
            )}

            <div className="profile-content">
                <div className="profile-sidebar">
                    <div
                        className={`avatar-container ${isEditing ? 'editable' : ''}`}
                        onClick={handleAvatarClick}
                        role={isEditing ? "button" : undefined}
                        tabIndex={isEditing ? 0 : undefined}
                        onKeyPress={(e) => {
                            if (isEditing && (e.key === 'Enter' || e.key === ' ')) {
                                handleAvatarClick();
                            }
                        }}
                    >
                        <img
                            src={getAvatarUrl()}
                            alt="User Avatar"
                            className="avatar"
                            onError={(e) => {
                                console.error('Image failed to load');
                                e.target.src = '/default-avatar.png';
                            }}
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
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            style={{ display: 'none' }}
                            disabled={!isEditing}
                        />
                    </div>

                    {profilePictureFile && (
                        <div className="image-selected-indicator">
                            <i className="fas fa-check-circle"></i>
                            <span>New image selected</span>
                        </div>
                    )}

                    <div className="user-quick-info">
                        <h2>{user.first_name} {user.last_name}</h2>
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

                <div className="profile-form">
                    <div className="form-section">
                        <h3>Personal Information</h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="first_name">First Name</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={user.first_name || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Last Name</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={user.last_name || ''}
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
                                    value={user.email || ''}
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
                                    value={user.phone || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={isEditing ? 'editing' : ''}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={user.username || ''}
                                    disabled={true}
                                    className="readonly"
                                />
                                <small>Username cannot be changed</small>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        {isEditing ? (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={saveLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={saveLoading}
                                >
                                    {saveLoading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save"></i>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleOpenPasswordModal}
                                >
                                    <i className="fas fa-key"></i>
                                    Change Password
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleEdit}
                                >
                                    <i className="fas fa-edit"></i>
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={handleClosePasswordModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Change Password</h2>
                            <button className="modal-close" onClick={handleClosePasswordModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {passwordError && (
                            <div className="alert alert-error">
                                <i className="fas fa-exclamation-circle"></i>
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="alert alert-success">
                                <i className="fas fa-check-circle"></i>
                                {passwordSuccess}
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="password-form">
                            <div className="form-group">
                                <label htmlFor="old_password">Current Password</label>
                                <input
                                    type="password"
                                    id="old_password"
                                    name="old_password"
                                    value={passwordData.old_password}
                                    onChange={handlePasswordChange}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="new_password">New Password</label>
                                <input
                                    type="password"
                                    id="new_password"
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength="8"
                                    autoComplete="new-password"
                                />
                                <small>Password must be at least 8 characters long</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm_password">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirm_password"
                                    name="confirm_password"
                                    value={passwordData.confirm_password}
                                    onChange={handlePasswordChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClosePasswordModal}
                                    disabled={passwordLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-key"></i>
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
           {isStudent && <StudentInternships />} 
        </div>
    );
};

export default Profile;