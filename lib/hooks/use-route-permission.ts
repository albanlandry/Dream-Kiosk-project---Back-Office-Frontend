'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissions } from '@/lib/contexts/permission-context';

export function useRoutePermission(
  requiredPermission: string | string[],
  redirectTo: string = '/dashboard',
) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const hasAccess =
      typeof requiredPermission === 'string'
        ? hasPermission(requiredPermission)
        : hasAnyPermission(requiredPermission);

    if (!hasAccess) {
      router.push(redirectTo);
    }
  }, [requiredPermission, isLoading, hasPermission, hasAnyPermission, router, redirectTo]);
}

