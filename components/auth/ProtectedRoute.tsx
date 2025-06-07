'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireVerified = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const checkAuth = () => {
        if (!isLoading) {
          if (!isAuthenticated) {
            console.log('Not authenticated, redirecting to signin');
            window.location.href = '/auth/signin';
            return;
          }

          if (requireVerified && user && !user.isVerified) {
            console.log('Email not verified, redirecting to verification');
            window.location.href = '/auth/verify-email';
            return;
          }
        }
      };

      checkAuth();
    }
  }, [isAuthenticated, isLoading, user, requireVerified]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || (requireVerified && user && !user.isVerified)) {
    return null;
  }

  return <>{children}</>;
};