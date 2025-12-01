'use client';

import { Header } from '@/components/layout/Header';
import { Skeleton, SkeletonCard, SkeletonButton, SkeletonInput } from '@/components/ui/skeleton';

export function VideosPageSkeleton() {
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

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex gap-4 items-center">
            <SkeletonInput width={300} />
            <SkeletonButton width={80} />
            <SkeletonButton width={80} />
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={40} height={40} className="rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

