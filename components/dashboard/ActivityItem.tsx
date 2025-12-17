'use client';

import { FormattedActivity } from '@/lib/utils/activity-formatter';

interface ActivityItemProps {
  activity: FormattedActivity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div
      className={`flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 ${activity.borderColor} transition-all hover:shadow-md`}
    >
      <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center text-white flex-shrink-0`}>
        <i className={activity.icon}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 mb-1 truncate">{activity.title}</p>
        <p className="text-sm text-gray-600 mb-1 line-clamp-2">{activity.description}</p>
        <span className="text-xs text-gray-500">{activity.time}</span>
      </div>
    </div>
  );
}

