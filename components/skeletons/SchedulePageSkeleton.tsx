'use client';

import { Header } from '@/components/layout/Header';
import { Skeleton, SkeletonTable, SkeletonStatCard, SkeletonButton, SkeletonInput } from '@/components/ui/skeleton';

export function SchedulePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton variant="text" width={200} height={32} className="mb-2" />
            <Skeleton variant="text" width={300} />
          </div>
          <SkeletonButton width={120} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SkeletonInput />
            <SkeletonInput />
            <SkeletonInput />
            <div className="flex gap-2">
              <SkeletonButton width={80} />
              <SkeletonButton width={80} />
            </div>
          </div>
        </div>

        {/* Calendar View Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <Skeleton variant="text" width={150} height={24} className="mb-4" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={60} className="rounded" />
            ))}
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SkeletonTable rowCount={10} colCount={9} />
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={40} height={40} className="rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

