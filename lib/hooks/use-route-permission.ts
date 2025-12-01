'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { usePermissions } from '@/lib/contexts/permission-context';
import { useAuthStore } from '@/lib/store/authStore';

export function useRoutePermission(
  requiredPermission: string | string[],
  redirectTo: string = '/dashboard',
) {
  const { hasPermission, hasAnyPermission, isLoading, permissions } = usePermissions();
  const { isAuthenticated, admin } = useAuthStore();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset redirect flag when permission or route changes
    hasRedirected.current = false;

    // Don't check if still loading permissions
    if (isLoading) {
      return;
    }

    // Don't redirect if user is not authenticated - let auth system handle it
    if (!isAuthenticated) {
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected.current) {
      return;
    }

    // If permissions array is empty and we're authenticated, give it a moment
    // This handles race conditions on page refresh
    if (permissions.length === 0 && isAuthenticated) {
      // Clear any existing timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // Wait a bit for permissions to load (handles refresh scenario)
      checkTimeoutRef.current = setTimeout(() => {
        // Check again after delay
        // If still no permissions, don't redirect - user might be admin
        // Admin users should have permissions, but if API call failed,
        // we shouldn't redirect them away
        if (permissions.length === 0) {
          // Don't redirect if permissions failed to load
          // This prevents false redirects on refresh
          return;
        }

        const hasAccess =
          typeof requiredPermission === 'string'
            ? hasPermission(requiredPermission)
            : hasAnyPermission(requiredPermission);

        if (!hasAccess && !hasRedirected.current) {
          hasRedirected.current = true;
          router.push(redirectTo);
        }
      }, 500); // Wait 500ms for permissions to load

      return () => {
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
      };
    }

    // Normal permission check when permissions are loaded
    const hasAccess =
      typeof requiredPermission === 'string'
        ? hasPermission(requiredPermission)
        : hasAnyPermission(requiredPermission);

    if (!hasAccess && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push(redirectTo);
    }
  }, [requiredPermission, isLoading, hasPermission, hasAnyPermission, router, redirectTo, isAuthenticated, permissions, admin]);
}

