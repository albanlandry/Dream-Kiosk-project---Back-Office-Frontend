'use client';

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

// Pre-built skeleton components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      <Skeleton variant="rectangular" height={200} className="mb-4" />
      <Skeleton variant="text" width="60%" className="mb-2" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
}

export function SkeletonTableRow({ colCount = 5 }: { colCount?: number }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ 
  rowCount = 5, 
  colCount = 5,
  showHeader = true 
}: { 
  rowCount?: number; 
  colCount?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {showHeader && (
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: colCount }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton variant="text" width="70%" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rowCount }).map((_, i) => (
            <SkeletonTableRow key={i} colCount={colCount} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Skeleton variant="text" width="40%" className="mb-4" />
      <Skeleton variant="text" width="60%" height={32} className="mb-2" />
      <Skeleton variant="text" width="30%" />
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton 
      variant="rectangular" 
      height={40} 
      width={100} 
      className={cn('rounded-md', className)} 
    />
  );
}

export function SkeletonInput({ className }: { className?: string }) {
  return (
    <Skeleton 
      variant="rectangular" 
      height={40} 
      className={cn('rounded-md', className)} 
    />
  );
}

export function SkeletonFilterSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <SkeletonInput width={200} />
        <SkeletonInput width={200} />
        <SkeletonInput width={200} />
        <SkeletonButton />
      </div>
    </div>
  );
}
