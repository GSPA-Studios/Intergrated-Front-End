import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types/User';
import { useAuth } from '../../hooks/useAuth';

interface UsersListProps {
  onLoadComplete?: () => void;
  refreshTrigger?: number; // A value that when changed triggers a refresh
}

const UsersList: React.FC<UsersListProps> = ({ onLoadComplete, refreshTrigger }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const { getAllUsers, deleteUser, user: currentUser } = useAuth();
  
  // Use useCallback to memoize the loadUsers function
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const usersList = await getAllUsers();
      setUsers(usersList);
      
      if (onLoadComplete) {
        onLoadComplete();
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, onLoadComplete]);
  
  // Load users on initial mount and when refreshTrigger changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers, refreshTrigger]);
  
  const confirmDelete = (user: User) => {
    setUserToDelete(user);
  };
  
  const cancelDelete = () => {
    setUserToDelete(null);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      const success = await deleteUser(userToDelete.username);
      
      if (success) {
        await loadUsers();
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };
  
  if (loading && users.length === 0) {
    return <div className="loading">Loading users...</div>;
  }
  
  return (
    <div className="users-list">
      <h2>User Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="user-list-controls">
        <button 
          className="refresh-button" 
          onClick={() => loadUsers()}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Users'}
        </button>
      </div>
      
      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Position</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4}>No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  <span className={`position-tag ${user.position}`}>
                    {user.position}
                  </span>
                </td>
                <td>{user.date_created || 'N/A'}</td>
                <td>
                  {user.username !== currentUser?.username && (
                    <button 
                      className="delete-button"
                      onClick={() => confirmDelete(user)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {userToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the user <strong>{userToDelete.username}</strong>?</p>
            <p>This action cannot be undone.</p>
            
            <div className="modal-actions">
              <button className="cancel-button" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="delete-confirm-button" onClick={handleDeleteUser}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList; 