'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';

interface PermissionContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const { isAuthenticated, token, admin } = useAuthStore();
  const pathname = usePathname();

  const loadPermissions = useCallback(async () => {
    // Skip loading permissions on login page or if not authenticated
    if (!isAuthenticated || !token || pathname === '/login') {
      setPermissions([]);
      setIsLoading(false);
      setHasLoadedOnce(false);
      return;
    }

    try {
      setIsLoading(true);
      const perms = await authApi.getPermissions();
      setPermissions(perms || []);
      setHasLoadedOnce(true);
    } catch (error: any) {
      // Handle 401 errors (user not authenticated) - clear permissions
      if (error?.response?.status === 401) {
        setPermissions([]);
        setHasLoadedOnce(false);
      } else {
        // For other errors (network, server errors), preserve previous permissions
        // This prevents false redirects on refresh when network is slow
        console.error('Failed to load permissions:', error);
        // Only set empty if we've never loaded before
        if (!hasLoadedOnce) {
          // If admin user, assume they have all permissions temporarily
          // This prevents redirect on refresh before permissions load
          if (admin?.role === 'admin') {
            setPermissions(['*:*']); // Temporary admin permission
          } else {
            setPermissions([]);
          }
        }
        // Keep hasLoadedOnce as true to preserve state
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, pathname, admin, hasLoadedOnce]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      // Check for wildcard permissions
      if (permissions.includes('*:*') || permissions.includes('*:manage')) {
        return true;
      }

      // Check exact permission
      if (permissions.includes(permission)) {
        return true;
      }

      // Check resource wildcard (e.g., "schedule:*" matches "schedule:create")
      const [resource, action] = permission.split(':');
      if (resource && action && permissions.includes(`${resource}:*`)) {
        return true;
      }

      return false;
    },
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.some((perm) => hasPermission(perm));
    },
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.every((perm) => hasPermission(perm));
    },
    [hasPermission],
  );

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isLoading,
        refreshPermissions: loadPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
}

