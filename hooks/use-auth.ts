'use client';

import { useAuth as useAuthContext } from '../lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook for authentication operations
 * Re-exports the auth context for easier imports
 */
export const useAuth = () => {
  return useAuthContext();
};

/**
 * Hook for protecting routes - redirects to login if not authenticated
 */
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook for login redirect - redirects to home if already authenticated
 */
export const useLoginRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook for logout functionality with cleanup
 */
export const useLogout = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return handleLogout;
};
