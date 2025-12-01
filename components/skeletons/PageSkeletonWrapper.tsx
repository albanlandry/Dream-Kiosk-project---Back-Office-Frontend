'use client';

import { usePermissions } from '@/lib/contexts/permission-context';
import { useAuthStore } from '@/lib/store/authStore';
import { ReactNode } from 'react';

interface PageSkeletonWrapperProps {
  children: ReactNode;
  skeleton: ReactNode;
  isLoading?: boolean;
}

/**
 * Wrapper component that shows skeleton while:
 * 1. Permissions are loading
 * 2. User is not authenticated
 * 3. Custom loading state is true
 */
export function PageSkeletonWrapper({ 
  children, 
  skeleton,
  isLoading = false 
}: PageSkeletonWrapperProps) {
  const { isLoading: permissionsLoading } = usePermissions();
  const { isAuthenticated } = useAuthStore();

  // Show skeleton if:
  // - Permissions are still loading
  // - User is not authenticated (waiting for auth)
  // - Custom loading state is true
  if (permissionsLoading || !isAuthenticated || isLoading) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
}

