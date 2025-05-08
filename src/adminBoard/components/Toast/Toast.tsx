import React, { useState, useEffect } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  duration = 3000, 
  onClose 
}) => {
  const [visible, setVisible] = useState(true);

  // Close the toast after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow animation to complete before removing from DOM
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Handle manually closing the toast
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`toast toast-${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={handleClose} aria-label="Close notification">
        &times;
      </button>
    </div>
  );
};

export default Toast; 