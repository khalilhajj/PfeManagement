import React from 'react';
import './CustomModal.css';

const CustomModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    type = 'info', // 'info', 'success', 'warning', 'danger', 'confirm'
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <i className="fas fa-check-circle"></i>;
            case 'warning':
                return <i className="fas fa-exclamation-triangle"></i>;
            case 'danger':
            case 'confirm':
                return <i className="fas fa-exclamation-circle"></i>;
            default:
                return <i className="fas fa-info-circle"></i>;
        }
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className={`custom-modal ${type}`} onClick={e => e.stopPropagation()}>
                <div className="custom-modal-icon">
                    {getIcon()}
                </div>
                <h3 className="custom-modal-title">{title}</h3>
                <p className="custom-modal-message">{message}</p>
                <div className="custom-modal-actions">
                    {(showCancel || type === 'confirm') && (
                        <button className="btn-modal btn-cancel" onClick={onClose}>
                            {cancelText}
                        </button>
                    )}
                    <button className={`btn-modal btn-${type}`} onClick={handleConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;
