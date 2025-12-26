'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

interface ErrorDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorDialog({
  open,
  title = '오류 발생',
  message,
  onClose,
  showRetry = false,
  onRetry,
}: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base text-gray-700">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-6">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-gray-300"
            >
              다시 시도
            </Button>
          )}
          <Button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

