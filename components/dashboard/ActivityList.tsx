'use client';

import { Loader2 } from 'lucide-react';
import { FormattedActivity } from '@/lib/utils/activity-formatter';
import { ActivityItem } from './ActivityItem';

interface ActivityListProps {
  activities: FormattedActivity[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ActivityList({
  activities: activitiesProp,
  isLoading = false,
  emptyMessage = '선택한 필터 조건에 맞는 활동이 없습니다.',
}: ActivityListProps) {
  // activities가 undefined일 수 있으므로 안전하게 처리
  const activities = activitiesProp || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">활동 로드 중...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityItem key={activity.id || `activity-${activity.title}-${activity.time}`} activity={activity} />
      ))}
    </div>
  );
}

