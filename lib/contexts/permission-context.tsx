'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  const { isAuthenticated } = useAuthStore();

  const loadPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    try {
      const perms = await authApi.getPermissions();
      setPermissions(perms);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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

