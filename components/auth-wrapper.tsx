'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize
    if (!isLoading) {
      setIsInitialized(true);
      
      // Define public routes that don't require authentication
      const publicRoutes = ['/login'];
      const isPublicRoute = publicRoutes.includes(pathname);
      
      // If not on a public route and not authenticated, redirect to login
      if (!isPublicRoute && !isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        router.replace('/login');
        return;
      }
      
      // If on login page and authenticated, redirect to dashboard
      if (pathname === '/login' && isAuthenticated) {
        console.log('User already authenticated, redirecting to dashboard');
        router.replace('/');
        return;
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Show loading spinner while initializing or during auth state changes
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // For protected routes, ensure user is authenticated before rendering
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  if (!isPublicRoute && !isAuthenticated) {
    // Don't render protected content if not authenticated
    // The useEffect above should handle redirection, but this is a safety check
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
