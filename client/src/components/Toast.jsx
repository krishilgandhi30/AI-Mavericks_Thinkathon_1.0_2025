import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose && onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!message) return null;

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-content">
                <span>{message}</span>
                {onClose && (
                    <button 
                        className="toast-close" 
                        onClick={onClose}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toast;
