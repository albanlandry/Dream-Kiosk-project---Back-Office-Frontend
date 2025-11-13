'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface BulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onSuspend: () => void;
  onDelete: () => void;
}

export function BulkActions({
  selectedCount,
  onActivate,
  onSuspend,
  onDelete,
}: BulkActionsProps) {
  const hasSelection = selectedCount > 0;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{selectedCount}개</span> 선택됨
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onActivate}
            disabled={!hasSelection}
            className={cn(
              'bg-gray-500 hover:bg-gray-600 text-white',
              !hasSelection && 'opacity-50 cursor-not-allowed'
            )}
            size="sm"
          >
            <i className="fas fa-check mr-2"></i>
            활성화
          </Button>
          <Button
            onClick={onSuspend}
            disabled={!hasSelection}
            className={cn(
              'bg-yellow-500 hover:bg-yellow-600 text-white',
              !hasSelection && 'opacity-50 cursor-not-allowed'
            )}
            size="sm"
          >
            <i className="fas fa-ban mr-2"></i>
            정지
          </Button>
          <Button
            onClick={onDelete}
            disabled={!hasSelection}
            className={cn(
              'bg-red-500 hover:bg-red-600 text-white',
              !hasSelection && 'opacity-50 cursor-not-allowed'
            )}
            size="sm"
          >
            <i className="fas fa-trash mr-2"></i>
            삭제
          </Button>
        </div>
      </div>
    </>
  );
}

