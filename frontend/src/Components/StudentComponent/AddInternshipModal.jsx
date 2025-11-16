import React, { useState } from 'react';
import { createInternship } from '../../api';
import './AddInternshipModal.css';

const AddInternshipModal = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        type: 'PFE',
        company_name: '',
        start_date: '',
        end_date: '',
        description: '',
        cahier_de_charges: null
    });

    const [fileName, setFileName] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            e.target.value = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only PDF, DOC, and DOCX files are allowed');
            e.target.value = '';
            return;
        }

        setFormData({ ...formData, cahier_de_charges: file });
        setFileName(file.name);
        setError('');
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Title is required');
            return false;
        }
        if (!formData.company_name.trim()) {
            setError('Company name is required');
            return false;
        }
        if (!formData.start_date || !formData.end_date) {
            setError('Both start and end dates are required');
            return false;
        }
        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            setError('End date must be after start date');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Description is required');
            return false;
        }
        if (!formData.cahier_de_charges) {
            setError('Cahier de charges document is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await createInternship(formData);
            setSuccessMessage('Internship created successfully! Waiting for admin approval.');
            
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            console.error('Error creating internship:', err);
            const errorMessage = err.response?.data?.error || 
                               err.response?.data?.message ||
                               'Failed to create internship. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><i className="fas fa-plus-circle"></i> Add New Internship</h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
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

                <form onSubmit={handleSubmit} className="internship-form">
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="title">
                                    Title <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Internship title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="type">
                                    Type <span className="required">*</span>
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="PFE">Projet de Fin d'Études (PFE)</option>
                                    <option value="Stage">Stage</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="company_name">
                                Company Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="company_name"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="Company name"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="start_date">
                                    Start Date <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="start_date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="end_date">
                                    End Date <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the internship objectives and tasks..."
                                rows="4"
                                required
                            />
                            <small>{formData.description.length} characters</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="cahier_de_charges">
                                Cahier de Charges <span className="required">*</span>
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="cahier_de_charges"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    required
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="cahier_de_charges" className="file-upload-btn">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    {fileName || 'Choose file (PDF, DOC, DOCX - Max 10MB)'}
                                </label>
                                {fileName && (
                                    <div className="file-selected">
                                        <i className="fas fa-file-alt"></i>
                                        <span>{fileName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="submit-internship-button"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    Create Internship
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInternshipModal;