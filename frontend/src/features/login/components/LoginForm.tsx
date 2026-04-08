import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials } from '../types/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.username || !credentials.password) {
      setError('Please fill in all fields');
      showToast('Please fill in all fields', 'error');
      return;
    }

    const result = await login(credentials);
    
    if (result.success && result.user) {
      showToast(`Welcome back, ${result.user.name}!`, 'success');
      // Navigate based on user role from backend
      const rolePath = result.user.role.toLowerCase();
      console.log('Navigating to:', `/dashboard/${rolePath}`);
      console.log('User data:', result.user);
      
      // Add small delay to ensure auth state is updated
      setTimeout(() => {
        navigate(`/dashboard/${rolePath}`);
      }, 100);
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
      showToast(result.error || 'Invalid credentials. Please try again.', 'error');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          Welcome Back !
        </h2>
        <p className="text-xs text-gray-500">
          Log in to access your personalized travel itinerary.
        </p>
      </div>
        
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-blue-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80"
                placeholder="username"
              />
            </div>
          
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-blue-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80"
                placeholder="Password"
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <a href="#" className="text-xs text-blue-600 hover:text-blue-800">
              Forgot Password ?
            </a>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-xs text-red-800 text-center">{error}</p>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'LOGIN'
              )}
            </button>
          </div>
          
          {/* Sign up link */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Don't have an account ?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    );
  };