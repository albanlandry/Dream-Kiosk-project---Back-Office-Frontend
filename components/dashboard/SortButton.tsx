'use client';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortButtonProps {
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
  className?: string;
}

export function SortButton({ sortOrder, onSortChange, className }: SortButtonProps) {
  const handleClick = () => {
    onSortChange(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={className}
      title={sortOrder === 'desc' ? '오래된 순으로 정렬' : '최신 순으로 정렬'}
    >
      <ArrowUpDown className="h-4 w-4 mr-1" />
      <span className="text-xs">{sortOrder === 'desc' ? '최신순' : '오래된순'}</span>
    </Button>
  );
}

