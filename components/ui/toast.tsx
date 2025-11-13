'use client';

import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
}

interface ToastProps extends Toast {
  onClose: () => void;
}

const ToastComponent = ({ id, description, type = 'success', duration = 5000, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    // Wait for animation to complete before actually removing
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  useEffect(() => {
    // Auto-close after duration
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle text-white"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle text-white"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-white"></i>;
      case 'info':
        return <i className="fas fa-info-circle text-white"></i>;
      default:
        return <i className="fas fa-check-circle text-white"></i>;
    }
  };

  const getBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div
        className={cn(
          'relative flex items-center bg-white rounded-lg shadow-lg overflow-hidden',
          isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
        )}
      >
        {/* Left accent bar */}
        <div className={cn('w-1 h-full', getBarColor())}></div>

        {/* Icon circle */}
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center ml-4 flex-shrink-0', getBarColor())}>
          {getIcon()}
        </div>

        {/* Message */}
        <div className="flex-1 px-4 py-3">
          <p className="text-sm text-gray-800 font-medium">{description}</p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="px-3 py-3 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-md">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} {...toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}
