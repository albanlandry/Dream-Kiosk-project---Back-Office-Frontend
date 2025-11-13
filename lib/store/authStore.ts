import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { AdminProfile } from '@/lib/api/auth';

interface AuthState {
  token: string | null;
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  login: (token: string, admin: AdminProfile) => void;
  logout: () => void;
  setAdmin: (admin: AdminProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      login: (token, admin) => {
        Cookies.set('auth-token', token, { expires: 7 }); // 7 days
        set({ token, admin, isAuthenticated: !!token });
      },
      logout: () => {
        Cookies.remove('auth-token');
        set({ token: null, admin: null, isAuthenticated: false });
        // Redirect to login page after logout
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
      setAdmin: (admin) => {
        set({ admin });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

