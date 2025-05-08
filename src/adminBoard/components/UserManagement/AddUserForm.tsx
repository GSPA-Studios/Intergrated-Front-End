import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface AddUserFormProps {
  onUserAdded?: () => void; // Callback to refresh users list
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onUserAdded }) => {
  const [username, setUsername] = useState('');
  const [position, setPosition] = useState<'manager' | 'member'>('member');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { addUser } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const success = await addUser(username, position, password || undefined);
      
      if (success) {
        setSuccess(`User ${username} was successfully added`);
        setUsername('');
        setPassword('');
        setPosition('member');
        
        // Call the callback to refresh the users list
        if (onUserAdded) {
          onUserAdded();
        }
      } else {
        setError('Failed to add user');
      }
    } catch (err) {
      setError('Failed to add user. The user may already exist.');
      console.error('Error adding user:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="add-user-form">
      <h2>Add New User</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            placeholder="Enter email or username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password (Optional)</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Enter password (optional)"
          />
          <small className="helper-text">
            Leave blank for Google OAuth users
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="position">Position</label>
          <select
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value as 'manager' | 'member')}
            disabled={isLoading}
          >
            <option value="member">Member</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="add-user-button"
          disabled={isLoading}
        >
          {isLoading ? 'Adding User...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default AddUserForm; 