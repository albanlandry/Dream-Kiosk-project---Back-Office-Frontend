'use client';

import { useEffect, useState } from 'react';
import { setLoadingCallback } from '@/lib/api/client';

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = setLoadingCallback(setIsLoading);
    return unsubscribe;
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-blue-600/20"></div>
          </div>
        </div>
        <p className="text-white font-medium">처리 중...</p>
      </div>
    </div>
  );
}

