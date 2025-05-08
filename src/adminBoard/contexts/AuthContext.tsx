/**
 * Authentication Context
 * 
 * This context provides authentication-related functionality throughout the app:
 * - User authentication state management
 * - Login/logout functionality
 * - User management (for admin users)
 * 
 * The context includes mock data support for frontend development without a backend.
 */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';
import { authService } from '../services/authService';

// Mock user data for development/testing without backend
const mockUser: User = {
  id: 'admin',
  username: 'admin@example.com',
  position: 'manager',
  date_created: '2023-01-01T00:00:00Z'
};

// Mock users list for development/testing
const initialMockUsers: User[] = [
  mockUser,
  {
    id: 'user1',
    username: 'user1@example.com',
    position: 'member',
    date_created: '2023-01-15T00:00:00Z'
  },
  {
    id: 'user2',
    username: 'user2@example.com',
    position: 'member',
    date_created: '2023-02-20T00:00:00Z'
  }
];

// Get persisted mock users from localStorage if available
const getPersistedMockUsers = (): User[] => {
  try {
    const persistedUsers = localStorage.getItem('mockUsers');
    if (persistedUsers) {
      return JSON.parse(persistedUsers);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return initialMockUsers;
};

// Save mock users to localStorage
const persistMockUsers = (users: User[]): void => {
  try {
    localStorage.setItem('mockUsers', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Interface defining all the functions and state available through the AuthContext
 */
interface AuthContextType {
  user: User | null;                 // Current authenticated user or null if not logged in
  loading: boolean;                  // Loading state for auth operations
  error: Error | null;               // Error state for auth operations
  login: (username: string, password: string) => Promise<void>;  // Login with credentials
  loginWithGoogle: () => void;       // Initiate Google OAuth login
  logout: () => void;                // Logout the current user
  isManager: () => boolean;          // Check if current user has manager privileges
  addUser: (username: string, position: 'manager' | 'member', password?: string) => Promise<boolean>; // Add new user (manager only)
  deleteUser: (username: string) => Promise<boolean>;   // Delete a user (manager only)
  getAllUsers: () => Promise<User[]>;  // Get all users (manager only)
}

// Create context with undefined default value (will be provided by AuthProvider)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props interface for AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication context to all child components.
 * Manages authentication state and provides auth-related functions.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // State for current authenticated user
  const [user, setUser] = useState<User | null>(null);
  // Loading state for auth operations
  const [loading, setLoading] = useState<boolean>(true);
  // Error state for auth operations
  const [error, setError] = useState<Error | null>(null);
  // Flag to use mock data when API is not available
  const [useMockData, setUseMockData] = useState<boolean>(false);
  // State for mock users list
  const [mockUsersList, setMockUsersList] = useState<User[]>(getPersistedMockUsers());

  // Check authentication state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        if (useMockData) {
          // Use mock user when in development mode
          setUser(mockUser);
          setLoading(false);
          return;
        }

        try {
          // Try to fetch current user from API
          const userData = await authService.checkAuth();
          setUser(userData);
        } catch (err) {
          // Fall back to mock data if API fails
          console.error('API connection failed, using mock user:', err);
          setUseMockData(true);
          setUser(mockUser);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown authentication error'));
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [useMockData]);

  /**
   * Login with username and password
   */
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        // Mock login logic
        if (username === 'admin@example.com' && password === 'password') {
          setUser(mockUser);
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      }
      
      try {
        // Attempt to login via API
        const success = await authService.login(username, password);
        
        if (success) {
          const userData = await authService.checkAuth();
          setUser(userData);
        } else {
          throw new Error('Login failed');
        }
      } catch (err) {
        // Fall back to mock login if API fails
        console.error('API connection failed, trying mock login:', err);
        setUseMockData(true);
        
        if (username === 'admin@example.com' && password === 'password') {
          setUser(mockUser);
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = () => {
    if (useMockData) {
      // Mock Google login in development mode
      setUser(mockUser);
      return;
    }
    // Redirect to Google OAuth endpoint
    authService.loginWithGoogle();
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      setLoading(true);
      if (useMockData) {
        // Mock logout
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Actual logout via API
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if current user has manager privileges
   */
  const isManager = (): boolean => {
    return authService.isManager(user);
  };

  /**
   * Add a new user (manager only)
   */
  const addUser = async (username: string, position: 'manager' | 'member', password?: string): Promise<boolean> => {
    if (!isManager()) {
      throw new Error('Unauthorized: Only managers can add users');
    }
    
    if (useMockData) {
      // Mock user addition
      // Check if user already exists
      if (mockUsersList.some(user => user.username === username)) {
        console.log('User already exists');
        return false;
      }
      
      const newUser: User = {
        id: `user${mockUsersList.length + 1}`,
        username,
        position,
        date_created: new Date().toISOString()
      };
      
      const updatedUsers = [...mockUsersList, newUser];
      setMockUsersList(updatedUsers);
      // Persist to localStorage
      persistMockUsers(updatedUsers);
      return true;
    }
    
    try {
      // Add user via API
      return await authService.addUser(username, position, password);
    } catch (err) {
      console.error('API connection failed, using mock mode:', err);
      setUseMockData(true);
      
      // Fall back to mock user addition
      // Check if user already exists
      if (mockUsersList.some(user => user.username === username)) {
        console.log('User already exists');
        return false;
      }
      
      const newUser: User = {
        id: `user${mockUsersList.length + 1}`,
        username,
        position,
        date_created: new Date().toISOString()
      };
      
      const updatedUsers = [...mockUsersList, newUser];
      setMockUsersList(updatedUsers);
      // Persist to localStorage
      persistMockUsers(updatedUsers);
      return true;
    }
  };

  /**
   * Delete a user (manager only)
   */
  const deleteUser = async (username: string): Promise<boolean> => {
    if (!isManager()) {
      throw new Error('Unauthorized: Only managers can delete users');
    }
    
    if (useMockData) {
      // Don't allow deleting the admin user
      if (username === 'admin@example.com') {
        return false;
      }
      
      // Mock user deletion
      const updatedUsers = mockUsersList.filter(u => u.username !== username);
      setMockUsersList(updatedUsers);
      // Persist to localStorage
      persistMockUsers(updatedUsers);
      return true;
    }
    
    try {
      // Delete user via API
      return await authService.deleteUser(username);
    } catch (err) {
      console.error('API connection failed, using mock mode:', err);
      setUseMockData(true);
      
      // Don't allow deleting the admin user
      if (username === 'admin@example.com') {
        return false;
      }
      
      // Fall back to mock user deletion
      const updatedUsers = mockUsersList.filter(u => u.username !== username);
      setMockUsersList(updatedUsers);
      // Persist to localStorage
      persistMockUsers(updatedUsers);
      return true;
    }
  };

  /**
   * Get all users (manager only)
   */
  const getAllUsers = async (): Promise<User[]> => {
    if (!isManager()) {
      throw new Error('Unauthorized: Only managers can view all users');
    }
    
    if (useMockData) {
      // Return mock users list
      return mockUsersList;
    }
    
    try {
      // Fetch users via API
      return await authService.getAllUsers();
    } catch (err) {
      console.error('API connection failed, using mock mode:', err);
      setUseMockData(true);
      return mockUsersList;
    }
  };

  // Provide auth context value to children
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        loginWithGoogle,
        logout,
        isManager,
        addUser,
        deleteUser,
        getAllUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 