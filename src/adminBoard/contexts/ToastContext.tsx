import React, { createContext, ReactNode, useState, useCallback, useContext } from 'react';
import Toast, { ToastType } from '../components/Toast/Toast';

// Type definition for a single toast notification
interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Type definition for the toast context value
interface ToastContextValue {
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Create context with undefined default value
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Props for the ToastProvider component
interface ToastProviderProps {
  children: ReactNode;
}

// ToastProvider component to wrap the application
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Generate a unique ID for each toast
  const generateId = () => {
    return Date.now().toString() + Math.random().toString().slice(2);
  };

  // Add a new toast notification
  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const newToast: ToastItem = {
      id: generateId(),
      type,
      message,
      duration
    };

    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  // Remove a toast notification
  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 