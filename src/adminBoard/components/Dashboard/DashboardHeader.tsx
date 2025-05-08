import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <header className="dashboard-header">
      <h1>Admin Dashboard</h1>
      {user && (
        <div className="user-info">
          <span className="welcome-message">Welcome, {user.username}</span>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;