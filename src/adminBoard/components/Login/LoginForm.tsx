import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{
    username: boolean;
    password: boolean;
  }>({
    username: false,
    password: false
  });
  
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: {
      username?: string;
      password?: string;
    } = {};
    
    // Email validation
    if (!username.trim()) {
      newErrors.username = 'Email is required';
    } else if (!validateEmail(username)) {
      newErrors.username = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle input field blur event
  const handleBlur = (field: 'username' | 'password') => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set all fields as touched
    setTouched({
      username: true,
      password: true
    });
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setErrors({});
      await login(username, password);
      addToast('success', 'Login successful!', 3000);
      // Redirect will be handled by the login function in AuthContext
    } catch (err) {
      setErrors({ general: 'Invalid email or password' });
      addToast('error', 'Login failed. Please check your credentials.', 5000);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    try {
      loginWithGoogle();
      addToast('info', 'Redirecting to Google login...', 3000);
    } catch (err) {
      addToast('error', 'Google login failed. Please try again.', 5000);
    }
  };
  
  const handleForgotPassword = () => {
    addToast('info', 'Password reset functionality will be available soon. Please contact your administrator for assistance.', 5000);
  };
  
  return (
    <div className="login-container">
      <div className="login-form-card">
        <h2>Sign in to Admin Dashboard</h2>
        
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Email Address</label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (touched.username) validateForm();
              }}
              onBlur={() => handleBlur('username')}
              disabled={isLoading}
              placeholder="Enter your email"
              className={touched.username && errors.username ? 'input-error' : ''}
              required
            />
            {touched.username && errors.username && (
              <div className="field-error">{errors.username}</div>
            )}
          </div>
          
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <a 
                href="#" 
                className="forgot-password-link"
                onClick={(e) => { 
                  e.preventDefault();
                  handleForgotPassword();
                }}
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) validateForm();
              }}
              onBlur={() => handleBlur('password')}
              disabled={isLoading}
              placeholder="Enter your password"
              className={touched.password && errors.password ? 'input-error' : ''}
              required
            />
            {touched.password && errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button 
          onClick={handleGoogleLogin} 
          className="google-login-button"
          disabled={isLoading}
        >
          <span className="google-icon">G</span>
          Sign in with Google
        </button>
        
        <div className="login-footer">
          <p>
            For assistance, please contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 