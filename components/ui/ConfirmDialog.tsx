'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="pt-2">{message}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-gray-300"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={
              confirmVariant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

