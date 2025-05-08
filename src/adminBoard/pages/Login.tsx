import React, { useEffect } from 'react';
import LoginForm from '../components/Login/LoginForm';
import { useAuth } from '../hooks/useAuth';
import '../styles/login.css';

const Login: React.FC = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user && !loading) {
      window.location.href = '/admin/dashboard';
    }
  }, [user, loading]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="login-page">
      <div className="login-header">
        <h1>FITS Admin Dashboard</h1>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login; 