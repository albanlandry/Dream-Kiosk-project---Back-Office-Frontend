'use client';

import { Header } from '@/components/layout/Header';
import { Skeleton, SkeletonStatCard, SkeletonButton, SkeletonCard } from '@/components/ui/skeleton';

export function ProjectsPageSkeleton() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* Project Cards */}
        <div className="space-y-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Skeleton variant="text" width={200} height={24} className="mb-2" />
                  <Skeleton variant="text" width={400} className="mb-4" />
                  <div className="flex gap-4">
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={100} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <SkeletonButton width={80} />
                  <SkeletonButton width={80} />
                  <SkeletonButton width={80} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j}>
                    <Skeleton variant="text" width={60} className="mb-1" />
                    <Skeleton variant="text" width={80} height={20} />
                  </div>
                ))}
              </div>
            </div>
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

