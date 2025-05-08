/**
 * SidebarNav Component
 * 
 * This component renders the navigation sidebar of the admin dashboard.
 * It includes:
 * - The admin logo and title
 * - Navigation menu items (Dashboard, User Management)
 * - Theme toggle button (Light/Dark mode)
 * - Logout button
 * 
 * The component uses:
 * - NavLink from react-router-dom for navigation with active states
 * - useAuth hook for user authentication and role-based access
 * - useTheme hook for theme toggling functionality
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

// Define the structure for navigation items
interface NavItem {
  label: string;
  path: string;
  icon?: string;
  managerOnly?: boolean; // Whether the item should only be shown to managers
}

const SidebarNav: React.FC = () => {
  // Get authentication functions and user data
  const { user, isManager, logout } = useAuth();
  // Get theme state and toggle function
  const { theme, toggleTheme } = useTheme();
  
  // Define the navigation items to be displayed
  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'User Management', path: '/admin/users', icon: 'users', managerOnly: true }
  ];
  
  // Handle user logout action
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  // Handle theme toggle action
  const handleThemeToggle = () => {
    toggleTheme();
  };
  
  return (
    <nav className="sidebar-nav">
      {/* Logo and title section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <h2>Admin</h2>
          <img src="/macro-logo.png" alt="MACRO" className="macro-logo" />
        </div>
      </div>
      
      {/* Navigation menu items */}
      <ul className="nav-items">
        {navItems.map((item) => {
          // Skip manager-only items if user is not a manager
          if (item.managerOnly && (!user || !isManager())) {
            return null;
          }
          
          return (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {item.icon && <span className={`icon icon-${item.icon}`}></span>}
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
        
        {/* Theme toggle button - placed below navigation items */}
        <li>
          <button 
            className="nav-button theme-toggle-button"
            onClick={handleThemeToggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className={`icon ${theme === 'light' ? 'icon-moon' : 'icon-sun'}`}></span>
            <span className="nav-label">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </li>
      </ul>
      
      {/* Logout button at the bottom of sidebar */}
      <div className="sidebar-footer">
        <button 
          className="logout-button" 
          onClick={handleLogout}
          aria-label="Logout"
        >
          <span className="icon icon-logout"></span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default SidebarNav; 