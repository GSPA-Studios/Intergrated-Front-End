import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const UserManagementButton: React.FC = () => {
  const { user, isManager } = useAuth();
  
  // Only show the button for manager users
  if (!user || !isManager()) {
    return null;
  }
  
  return (
    <div className="user-management-button-container">
      <button 
        className="user-management-button"
        onClick={() => window.location.href = '/admin/users'}
      >
        User Management
      </button>
    </div>
  );
};

export default UserManagementButton; 