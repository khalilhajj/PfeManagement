import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ActivateAccount.css';
import { activationAccount } from '../../api';
const ActivateAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [userData, setUserData] = useState(null);

    const activateAccount = useCallback(async () => {
        try {
            const data = await activationAccount(token);
            
            setStatus('success');
            setMessage(data.message);
            setUserData({
                username: data.username,
                email: data.email
            });
            
            setTimeout(() => {
                navigate('/');
            }, 3000);
            
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Account activation failed. Please try again.');
            console.error('Activation error:', error);
        }
    }, [token, navigate]);

    useEffect(() => {
        activateAccount();
    }, [activateAccount]);

    return (
        <div className="activate-container">
            <div className="activate-card">
                {status === 'loading' && (
                    <div className="activate-loading">
                        <div className="spinner"></div>
                        <h2>Activating Your Account</h2>
                        <p>Please wait while we activate your account...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="activate-success">
                        <div className="success-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h2>Account Activated!</h2>
                        <p className="success-message">{message}</p>
                        
                        {userData && (
                            <div className="user-info">
                                <p><strong>Username:</strong> {userData.username}</p>
                                <p><strong>Email:</strong> {userData.email}</p>
                            </div>
                        )}
                        
                        <p className="redirect-message">
                            Redirecting to login page in 3 seconds...
                        </p>
                        
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/')}
                        >
                            <i className="fas fa-sign-in-alt"></i>
                            Go to Login Now
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="activate-error">
                        <div className="error-icon">
                            <i className="fas fa-times-circle"></i>
                        </div>
                        <h2>Activation Failed</h2>
                        <p className="error-message">{message}</p>
                        
                        <div className="error-actions">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                            >
                                <i className="fas fa-arrow-left"></i>
                                Back to Login
                            </button>
                            <a 
                                href="mailto:support@pfemanagement.com"
                                className="btn btn-primary"
                            >
                                <i className="fas fa-envelope"></i>
                                Contact Support
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivateAccount;