/**
 * Main Application Component
 * 
 * This is the root component of the entire application that sets up:
 * 1. React Router for handling navigation between different pages
 * 2. Context Providers for managing application-wide state
 * 3. The main application routes and their access control
 * 
 * For React beginners:
 * - This file acts as the entry point for the application UI
 * - It wraps the entire app in various "providers" that supply functionality
 * - It defines which components (pages) should render for different URLs
 * 
 * The application uses a nested context pattern:
 * - Router: Handles URL-based navigation (changing pages without full reload)
 * - ThemeProvider: Manages light/dark theme preferences
 * - ToastProvider: Manages notification pop-ups
 * - AuthProvider: Manages user login state and permissions
 * - FitsProvider: Manages FITS data for astronomy images
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './adminBoard/contexts/AuthContext'
import { FitsProvider } from './adminBoard/contexts/FitsContext'
import { ThemeProvider } from './adminBoard/contexts/ThemeContext'
import { ToastProvider } from './adminBoard/contexts/ToastContext'
import { useAuth } from './adminBoard/hooks/useAuth'

// Page components - these are the main views of the application
import Dashboard from './adminBoard/pages/Dashboard'
import Login from './adminBoard/pages/Login'
import UserManagement from './adminBoard/pages/UserManagement'

// Global styles that apply to the entire application
import './App.css'
import './index.css'

/**
 * ProtectedRoute Component
 * 
 * This component ensures that certain routes can only be accessed
 * by authenticated users. If a user is not logged in, they will be
 * redirected to the login page.
 * 
 * For beginners: This is a pattern to implement authentication-based
 * access control in React applications.
 */
const ProtectedRoute = ({ children }) => {
  // Use the authentication hook to check if user is logged in
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If no user is logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is authenticated, render the requested page
  return children;
};

/**
 * App Component
 * 
 * The main component that defines the structure of the application.
 * It sets up all the providers and routes.
 */
function App() {
  return (
    <Router>
      {/* ThemeProvider - Makes light/dark theme available throughout the app */}
      <ThemeProvider>
        {/* ToastProvider - Enables toast notifications throughout the app */}
        <ToastProvider>
          {/* AuthProvider - Makes user authentication state available throughout the app */}
          <AuthProvider>
            {/* FitsProvider - Makes FITS data available throughout the app */}
            <FitsProvider>
              <div className="app">
                <Routes>
                  {/* Public routes - accessible without authentication */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected admin routes - require authentication */}
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <ProtectedRoute>
                        <UserManagement />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Redirects for convenience and handling unknown routes */}
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </div>
            </FitsProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
