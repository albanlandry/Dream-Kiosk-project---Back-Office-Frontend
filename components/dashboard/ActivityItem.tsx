'use client';

import { FormattedActivity } from '@/lib/utils/activity-formatter';
import { Checkbox } from '@/components/ui/checkbox';
import { useActivityLogsSelectionStore } from '@/lib/store/activityLogsSelectionStore';
import { cn } from '@/lib/utils/cn';

interface ActivityItemProps {
  activity: FormattedActivity;
  logId: string;
  index: number;
  onItemClick: (index: number, event: React.MouseEvent) => void;
  onCheckboxChange: (checked: boolean, index: number) => void;
}

export function ActivityItem({ activity, logId, index, onItemClick, onCheckboxChange }: ActivityItemProps) {
  const isSelected = useActivityLogsSelectionStore((state) => state.isSelected(logId));

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger item click if clicking on checkbox
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    onItemClick(index, e);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onCheckboxChange(e.target.checked, index);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 transition-all cursor-pointer',
        activity.borderColor,
        isSelected
          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
          : 'hover:shadow-md hover:bg-gray-100'
      )}
    >
      <div className="flex items-center pt-1">
        <Checkbox
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
        />
      </div>
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

