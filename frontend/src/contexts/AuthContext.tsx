import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, User, LoginCredentials } from '../features/login/types/auth';
import { API_ENDPOINTS } from '../config/apiConfig';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  markGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    hasCheckedAuth: false
  });

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // receive the HTTP-only cookie
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true
      });

      return { success: true, user: data.user };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false, hasCheckedAuth: true }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  };

  const logout = useCallback(async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include', // send cookie so server can clear it
      });
    } catch {
      // best-effort: clear client state regardless of server response
    }
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCheckedAuth: true
    });
  }, []);

  // Validate session on app mount — cookie is sent automatically
  const checkAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({ user, isAuthenticated: true, isLoading: false, hasCheckedAuth: true });
        return;
      }

      // Access token expired — try silent refresh
      if (response.status === 401) {
        const refreshResponse = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAuthState({ user: data.user, isAuthenticated: true, isLoading: false, hasCheckedAuth: true });
          return;
        }
      }

      setAuthState({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: true });
    } catch {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: true });
    }
  }, []);

  const markGuest = useCallback(() => {
    setAuthState({ user: null, isAuthenticated: false, isLoading: false, hasCheckedAuth: false });
  }, []);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      checkAuth,
      markGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
};
