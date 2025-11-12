import { create } from 'zustand';
import type { Toast, ToastType } from '@/components/ui/toast';

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (newToast.duration) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  showSuccess: (message, title) =>
    set((state) => {
      const id = Math.random().toString(36).substring(7);
      return {
        toasts: [
          ...state.toasts,
          { id, title, description: message, type: 'success', duration: 5000 },
        ],
      };
    }),
  showError: (message, title) =>
    set((state) => {
      const id = Math.random().toString(36).substring(7);
      return {
        toasts: [
          ...state.toasts,
          { id, title, description: message, type: 'error', duration: 7000 },
        ],
      };
    }),
  showInfo: (message, title) =>
    set((state) => {
      const id = Math.random().toString(36).substring(7);
      return {
        toasts: [
          ...state.toasts,
          { id, title, description: message, type: 'info', duration: 5000 },
        ],
      };
    }),
}));

