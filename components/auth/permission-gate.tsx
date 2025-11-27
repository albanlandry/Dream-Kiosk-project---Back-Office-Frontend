'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/lib/contexts/permission-context';

interface PermissionGateProps {
  permission: string | string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  const hasAccess =
    typeof permission === 'string'
      ? hasPermission(permission)
      : requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

