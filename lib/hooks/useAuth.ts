'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import Cookies from 'js-cookie';

export function useAuth() {
  const { token, admin, isAuthenticated, setAdmin } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from cookie on mount
    const cookieToken = Cookies.get('auth-token');
    if (cookieToken && !token) {
      // Token exists in cookie but not in store - try to fetch profile
      // This will be handled by the API interceptor if token is invalid
    }
  }, [token]);

  return {
    token,
    admin,
    isAuthenticated,
    setAdmin,
  };
}

