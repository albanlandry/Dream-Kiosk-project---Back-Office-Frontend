'use client';

import { useState, useCallback } from 'react';
import { useToastStore } from '@/lib/store/toastStore';
import { getErrorMessage, messages } from '@/lib/config/messages';

interface UseErrorHandlerOptions {
  showDialog?: boolean;
  showToast?: boolean;
  defaultMessage?: string;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showDialog = false, showToast = true, defaultMessage } = options;
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    message: string;
    title?: string;
  }>({
    open: false,
    message: '',
  });
  const { showError: showToastError } = useToastStore();

  const handleError = useCallback(
    (error: any, customMessage?: string) => {
      const errorMessage = customMessage || getErrorMessage(error, defaultMessage);

      if (showToast) {
        showToastError(errorMessage);
      }

      if (showDialog) {
        setErrorDialog({
          open: true,
          message: errorMessage,
          title: messages.common.error,
        });
      }

      // Log error for debugging
      console.error('Error handled:', error);
    },
    [showToast, showDialog, defaultMessage, showToastError]
  );

  const closeErrorDialog = useCallback(() => {
    setErrorDialog((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    handleError,
    errorDialog,
    closeErrorDialog,
  };
}

