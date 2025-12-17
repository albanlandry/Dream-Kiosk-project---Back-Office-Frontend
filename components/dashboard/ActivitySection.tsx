'use client';

import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { FormattedActivity } from '@/lib/utils/activity-formatter';
import { ActivityLogFilters } from '@/lib/api/activity-logs';
import { ActivityLogsFiltersV2 } from './ActivityLogsFiltersV2';
import { ActivityList } from './ActivityList';
import { ActivityLogsPagination } from './ActivityLogsPagination';
import { SortButton } from './SortButton';

interface ActivitySectionProps {
  activities: FormattedActivity[];
  isLoading?: boolean;
  filters: ActivityLogFilters;
  onFiltersChange: (filters: ActivityLogFilters) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (start?: Date, end?: Date) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
}

export function ActivitySection({
  activities,
  isLoading = false,
  filters,
  onFiltersChange,
  limit,
  onLimitChange,
  startDate,
  endDate,
  onDateRangeChange,
  sortOrder,
  onSortChange,
  pagination,
  onPageChange,
}: ActivitySectionProps) {
  return (
    <Card data-activity-section>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">최근 활동</CardTitle>
          <div className="flex items-center gap-3">
            <SortButton sortOrder={sortOrder} onSortChange={onSortChange} />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ActivityLogsFiltersV2
          filters={filters}
          onFiltersChange={onFiltersChange}
          onLimitChange={onLimitChange}
          onDateRangeChange={onDateRangeChange}
          limit={limit}
          startDate={startDate}
          endDate={endDate}
        />
        <div className="flex items-center justify-between my-4"></div>

        <ActivityList activities={activities} isLoading={isLoading} />
      </CardContent>
      {pagination && (
        <CardFooter>
          <ActivityLogsPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(page) => {
              onPageChange(page);
              // Scroll to top of activity section
              document
                .querySelector('[data-activity-section]')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </CardFooter>
      )}
    </Card>
  );
}

