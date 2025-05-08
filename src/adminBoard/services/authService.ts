/**
 * Authentication Service
 * 
 * Provides authentication and user management functions:
 * - User authentication (login/logout)
 * - User management (create/delete users)
 * - Role-based authorization checks
 * 
 * Includes mock data implementation for frontend development without backend.
 */
import { User } from '../types/User';

// Base API URL - would be configured from environment in a real app
const API_URL = '/api';

// Mock user data for development/testing
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

// Get mock users from localStorage, or use initial data if not available
const getMockUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return initialMockUsers;
};

// Save mock users to localStorage
const saveMockUsers = (users: User[]): void => {
  try {
    localStorage.setItem('mockUsers', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Development mode flag - set to true if API is unavailable
const USE_MOCK_DATA = true; // TODO: Change to false when API is available

/**
 * Authentication service with API and mock implementations
 */
export const authService = {
  /**
   * Check if user is currently authenticated
   * Returns user data if authenticated, null otherwise
   */
  checkAuth: async (): Promise<User | null> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock user data - logged in as', mockUser.username);
      return mockUser;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include' // Send cookies for session-based auth
      });
      
      if (!response.ok) {
        return null;
      }
      
      const userData = await response.json();
      
      return {
        id: userData.username, // Using username as ID since Flask backend doesn't expose a separate ID
        username: userData.username,
        position: userData.position,
        date_created: userData.date_created
      };
    } catch (error) {
      console.error('Error checking authentication:', error);
      if (USE_MOCK_DATA) {
        console.log('Falling back to mock user');
        return mockUser;
      }
      return null;
    }
  },
  
  /**
   * Login with username and password
   * Returns true if login successful, false otherwise
   */
  login: async (username: string, password: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock login with', username);
      return (username === 'admin@example.com' && password === 'password');
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error during login:', error);
      if (USE_MOCK_DATA) {
        console.log('Falling back to mock login');
        return (username === 'admin@example.com' && password === 'password');
      }
      return false;
    }
  },
  
  /**
   * Initiate login with Google OAuth
   * Redirects to Google authentication page
   */
  loginWithGoogle: (): void => {
    if (USE_MOCK_DATA) {
      console.log('Mock Google login - redirecting to dashboard');
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 500);
      return;
    }

    window.location.href = `${API_URL}/auth/google`;
  },
  
  /**
   * Logout the current user
   * Returns true if logout successful, false otherwise
   */
  logout: async (): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      console.log('Mock logout');
      return true;
    }

    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  },
  
  /**
   * Check if user has manager (admin) privileges
   * Returns true if user is a manager, false otherwise
   */
  isManager: (user: User | null): boolean => {
    return !!user && user.position === 'manager';
  },
  
  /**
   * Add a new user (manager only)
   * Returns true if user added successfully, false otherwise
   */
  addUser: async (username: string, position: 'manager' | 'member', password?: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      console.log('Mock adding user:', username, position);
      // Check if user already exists
      const mockUsers = getMockUsers();
      if (mockUsers.some(user => user.username === username)) {
        console.log('User already exists');
        return false;
      }
      
      // Create new user
      const newUser: User = {
        id: `user${Date.now()}`, // Generate a unique ID
        username,
        position,
        date_created: new Date().toISOString()
      };
      
      // Add to mock users list and save
      const updatedUsers = [...mockUsers, newUser];
      saveMockUsers(updatedUsers);
      return true;
    }

    try {
      const userData: any = { username, position };
      
      // Add password if provided
      if (password) {
        userData.password = password;
      }
      
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData.error);
        return false;
      }
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  },
  
  /**
   * Delete a user (manager only)
   * Returns true if user deleted successfully, false otherwise
   */
  deleteUser: async (username: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      console.log('Mock deleting user:', username);
      // Don't allow deleting the admin user
      if (username === 'admin@example.com') {
        return false;
      }
      
      // Remove from mock users list and save
      const mockUsers = getMockUsers();
      const updatedUsers = mockUsers.filter(user => user.username !== username);
      saveMockUsers(updatedUsers);
      return true;
    }

    try {
      const response = await fetch(`${API_URL}/users/${username}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },
  
  /**
   * Get all users (manager only)
   * Returns array of user objects
   */
  getAllUsers: async (): Promise<User[]> => {
    if (USE_MOCK_DATA) {
      console.log('Using mock user list');
      return getMockUsers();
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const usersData = await response.json();
      return usersData.map((userData: any) => ({
        id: userData.id || userData.username,
        username: userData.username,
        position: userData.position,
        date_created: userData.date_created
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      if (USE_MOCK_DATA) {
        console.log('Falling back to mock users');
        return getMockUsers();
      }
      return [];
    }
  }
}; 