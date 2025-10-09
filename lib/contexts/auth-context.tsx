'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { loginUser, logoutUser, changeUserPassword, validateToken } from '../api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount with optional server validation
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('auth-user');
        const storedToken = localStorage.getItem('auth-token');
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          
          // Try server validation but don't fail if endpoint is not available
          try {
            const validationResult = await validateToken(storedToken);
            
            if (validationResult && validationResult.valid) {
              // Token is valid, use stored user data
              console.log('Token validated successfully with server');
              setUser(parsedUser);
            } else {
              // Token is invalid according to server
              console.log('Server says token is invalid, clearing auth data');
              localStorage.removeItem('auth-user');
              localStorage.removeItem('auth-token');
              setUser(null);
            }
          } catch (validationError) {
            // Server validation failed - could be network error or endpoint not implemented
            console.warn('Token validation failed, but continuing with stored auth:', validationError);
            
            // Check if it's a 404 (endpoint not found), network error, or CORS error
            // In these cases, trust the local storage and continue
            const errorMessage = (validationError as Error)?.message?.toLowerCase() || '';
            if (errorMessage.includes('404') || 
                errorMessage.includes('network') || 
                errorMessage.includes('fetch') ||
                errorMessage.includes('cors') ||
                errorMessage.includes('failed to fetch')) {
              console.log('Validation endpoint not available or network error, trusting stored auth data');
              setUser(parsedUser);
            } else {
              // Only clear auth data for actual authentication errors (401, 403)
              if (errorMessage.includes('401') || errorMessage.includes('403')) {
                console.log('Token validation failed with auth error, clearing auth data');
                localStorage.removeItem('auth-user');
                localStorage.removeItem('auth-token');
                setUser(null);
              } else {
                // For other errors, log but continue with stored auth
                console.log('Unknown validation error, but continuing with stored auth:', validationError);
                setUser(parsedUser);
              }
            }
          }
        } else {
          // No stored auth data
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('auth-user');
        localStorage.removeItem('auth-token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready, then initialize auth
    const timeoutId = setTimeout(initializeAuth, 50);
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string): Promise<{success: boolean; error?: string}> => {
    try {
      // Make actual API call for authentication
      const authData = await loginUser(email, password);
      console.log('Login API response:', authData);

      // Validate that we received a token from the API
      const token = authData.token || authData.access_token || authData.authToken || authData.jwt || authData.accessToken;

      if (!token) {
        console.error('No token received from API. Response data:', authData);

        // Check if API returned a specific error message
        if (authData.error) {
          return { success: false, error: authData.error };
        } else if (authData.message) {
          return { success: false, error: authData.message };
        } else {
          return { success: false, error: 'Invalid email or password. Please check your credentials.' };
        }
      }

      console.log('Token received from API:', token);

      // Extract user data from API response
      const userData: User = {
        id: authData.user?.id || authData.id || Math.random().toString(36).substr(2, 9),
        email: authData.user?.email || email,
        name: authData.user?.name || email.split('@')[0],
        role: authData.user?.role || (email.includes('admin') ? 'admin' : 'user')
      };

      console.log('Storing user data:', userData);
      console.log('Storing token:', token);

      // Store token and user data in localStorage
      localStorage.setItem('auth-user', JSON.stringify(userData));
      localStorage.setItem('auth-token', token);

      // Verify storage worked
      const storedUser = localStorage.getItem('auth-user');
      const storedToken = localStorage.getItem('auth-token');
      console.log('Verification - stored user:', storedUser);
      console.log('Verification - stored token:', storedToken);

      setUser(userData);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);

      // Parse different types of errors and return appropriate messages
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        return { success: false, error: 'Invalid email or password. Please check your credentials.' };
      } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        return { success: false, error: 'Access denied. Please contact administrator.' };
      } else if (error.message?.includes('429')) {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      } else if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
        return { success: false, error: 'Server error. Please try again later.' };
      } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        return { success: false, error: 'Network error. Please check your connection and try again.' };
      } else {
        return { success: false, error: 'Login failed. Please try again.' };
      }
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Get current token before clearing it
      const token = localStorage.getItem('auth-token');
      
      // Make API call to logout endpoint if token exists
      if (token) {
        try {
          await logoutUser(token);
          console.log('Successfully logged out from server');
        } catch (apiError) {
          console.warn('Logout API call failed, continuing with local logout:', apiError);
        }
      }
      
      // Clear localStorage regardless of API call result
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-token');
      
      // Clear user state
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (
    email: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{success: boolean; message: string}> => {
    try {
      setIsLoading(true);
      
      // Make API call to change password endpoint
      const result = await changeUserPassword(email, currentPassword, newPassword);
      
      return {
        success: true,
        message: result.message || 'Password changed successfully!'
      };
    } catch (error: any) {
      console.error('Change password error:', error);
      
      // Try to extract error message from the API response
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error.message && error.message.includes('HTTP error! status:')) {
        if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Invalid current password. Please check your credentials.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid password format. Please check your input.';
        } else {
          errorMessage = 'Failed to change password. Please try again.';
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    // Implementation for clearing errors if needed
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
