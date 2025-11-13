'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // 모든 페이지를 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 주변의 페이지들을 표시
      if (currentPage <= 3) {
        // 처음 부분
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 끝 부분
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 중간 부분
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={cn(
            'bg-gray-500 hover:bg-gray-600 text-white',
            currentPage === 1 && 'opacity-50 cursor-not-allowed'
          )}
          size="sm"
        >
          <i className="fas fa-chevron-left mr-2"></i>
          이전
        </Button>

        <div className="flex gap-2">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'min-w-[40px]',
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:from-purple-700 hover:to-purple-500'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                )}
                size="sm"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={cn(
            'bg-gray-500 hover:bg-gray-600 text-white',
            currentPage === totalPages && 'opacity-50 cursor-not-allowed'
          )}
          size="sm"
        >
          다음
          <i className="fas fa-chevron-right ml-2"></i>
        </Button>
      </div>
    </>
  );
}

