import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials } from '../types/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import {Link} from "react-router-dom";
export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-blue-900 mb-1 sm:mb-2">
          Welcome Back !
        </h2>
        <p className="text-xs sm:text-xs md:text-sm text-gray-500">
          Log in to access your personalized travel itinerary.
        </p>
      </div>

      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} autoComplete="off">
        <div className="space-y-3 sm:space-y-4">
            <div>
              <input
                id="username"
                name="email"
                type="text"
                autoComplete="off"
                required
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-blue-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80"
                placeholder="Email Address"
              />
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="appearance-none relative block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border border-blue-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <a href="#" className="text-xs sm:text-xs text-blue-600 hover:text-blue-800">
              Forgot Password ?
            </a>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-red-800 text-center">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-xs sm:text-sm font-bold rounded-full text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <p className="text-xs sm:text-xs text-gray-600">
              Don't have an account ?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    );
  };