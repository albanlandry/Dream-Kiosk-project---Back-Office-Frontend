'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export function LoadingModal({ isOpen, message = '처리 중...' }: LoadingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm bg-white border-0 shadow-xl">
        <div className="flex flex-col items-center justify-center py-8 px-6">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium text-center">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

