'use client';

import { Loader2 } from 'lucide-react';
import { FormattedActivity } from '@/lib/utils/activity-formatter';
import { ActivityItem } from './ActivityItem';
import { useActivityLogsSelectionStore } from '@/lib/store/activityLogsSelectionStore';
import { ActivityLog } from '@/lib/api/activity-logs';

interface ActivityListProps {
  activities: FormattedActivity[];
  logs: ActivityLog[]; // Original log data for IDs
  isLoading?: boolean;
  emptyMessage?: string;
  onDetailClick?: (log: ActivityLog) => void;
}

export function ActivityList({
  activities: activitiesProp,
  logs: logsProp,
  isLoading = false,
  emptyMessage = '선택한 필터 조건에 맞는 활동이 없습니다.',
  onDetailClick,
}: ActivityListProps) {
  // activities가 undefined일 수 있으므로 안전하게 처리
  const activities = activitiesProp || [];
  const logs = logsProp || [];

  const {
    toggleSelection,
    selectItem,
    deselectItem,
    selectRange,
    lastClickedIndex,
    isSelected,
  } = useActivityLogsSelectionStore();

  const handleItemClick = (index: number, event: React.MouseEvent) => {
    const logId = logs[index]?.id;
    if (!logId) return;

    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;

    if (isShift && lastClickedIndex !== null) {
      // Range selection
      selectRange(lastClickedIndex, index, logs.map((log) => log.id));
    } else if (isCtrlOrCmd) {
      // Toggle selection
      toggleSelection(logId);
      useActivityLogsSelectionStore.setState({ lastClickedIndex: index });
    } else {
      // Single selection (clear others)
      if (isSelected(logId)) {
        deselectItem(logId);
      } else {
        // Clear all and select this one
        useActivityLogsSelectionStore.getState().deselectAll();
        selectItem(logId);
      }
      useActivityLogsSelectionStore.setState({ lastClickedIndex: index });
    }
  };

  const handleCheckboxChange = (logId: string, checked: boolean, index: number) => {
    // Checkbox click automatically enables multi-selection mode
    if (checked) {
      selectItem(logId);
    } else {
      deselectItem(logId);
    }
    // Update last clicked index for range selection
    useActivityLogsSelectionStore.setState({ lastClickedIndex: index });
  };

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
      {activities.map((activity, index) => {
        const logId = logs[index]?.id || activity.id || `activity-${index}`;
        return (
          <ActivityItem
            key={logId}
            activity={activity}
            logId={logId}
            index={index}
            onItemClick={handleItemClick}
            onCheckboxChange={(checked) => handleCheckboxChange(logId, checked, index)}
            onDetailClick={onDetailClick ? () => onDetailClick(logs[index]) : undefined}
          />
        );
      })}
    </div>
  );
}

