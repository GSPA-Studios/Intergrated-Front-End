/**
 * User Management Page
 * 
 * This page allows administrators to manage system users by:
 * - Viewing a list of all users
 * - Adding new users to the system
 * - Deleting existing users
 * 
 * Key features:
 * - Role-based access control (only managers can access)
 * - Automatic redirection if user lacks permissions
 * - Real-time updates when users are added or deleted
 * 
 * This page consists of two main components:
 * 1. UsersList - Displays existing users and allows deletion
 * 2. AddUserForm - Form to create new users
 */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import UsersList from '../components/UserManagement/UsersList';
import AddUserForm from '../components/UserManagement/AddUserForm';
import SidebarNav from '../components/Dashboard/SidebarNav';
import '../styles/user-management.css';

const UserManagement: React.FC = () => {
  // Access authentication state and functions
  const { user, isManager, loading } = useAuth();
  
  // Counter to trigger UsersList refresh when a user is added
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Effect for access control and redirection
  useEffect(() => {
    // If user is not a manager, redirect to dashboard
    if (!loading && user && !isManager()) {
      window.location.href = '/admin/dashboard';
    }
    
    // If user is not logged in, redirect to login page
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, isManager, loading]);

  // Handler for when a user is successfully added
  const handleUserAdded = () => {
    // Increment the counter to trigger a refresh in UsersList
    // This ensures the list updates without a full page reload
    setRefreshCounter(prevCount => prevCount + 1);
  };
  
  // Show loading spinner while authentication state is being checked
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // Return null if user doesn't have permission (will redirect via useEffect)
  if (!user || !isManager()) {
    return null;
  }
  
  // Main component rendering
  return (
    <div className="dashboard-container">
      {/* Sidebar with navigation */}
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>
      
      {/* Main content area */}
      <div className="dashboard-content">
        <h1>User Management</h1>
        
        <div className="user-management-content">
          {/* Left side: List of existing users */}
          <div className="users-list-section">
            <UsersList
              refreshTrigger={refreshCounter}
            />
          </div>
          
          {/* Right side: Form to add new users */}
          <div className="add-user-section">
            <AddUserForm
              onUserAdded={handleUserAdded}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 