'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

export interface CalendarDateData {
  [date: string]: number | boolean; // number for count, boolean for has tasks
}

interface CalendarProps {
  currentMonth: Date;
  selectedDate?: string; // YYYY-MM-DD format
  dateData?: CalendarDateData; // Map of dates to counts or boolean indicators
  onDateClick?: (date: string) => void; // date in YYYY-MM-DD format
  onMonthChange?: (month: Date) => void;
  className?: string;
  showHeader?: boolean;
  headerTitle?: string;
  locale?: string;
}

export function Calendar({
  currentMonth,
  selectedDate,
  dateData = {},
  onDateClick,
  onMonthChange,
  className,
  showHeader = true,
  headerTitle = '스케줄 캘린더',
  locale = 'ko-KR',
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = useState(currentMonth);
  const displayMonth = onMonthChange ? currentMonth : internalMonth;

  // Format date to YYYY-MM-DD using local time (not UTC)
  const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    const dateStr = formatDateToLocalString(date);
    return dateStr === selectedDate;
  };

  const hasTasks = (date: Date): boolean => {
    const dateStr = formatDateToLocalString(date);
    const data = dateData[dateStr];
    if (typeof data === 'boolean') return data;
    if (typeof data === 'number') return data > 0;
    return false;
  };

  const getTaskCount = (date: Date): number => {
    const dateStr = formatDateToLocalString(date);
    const data = dateData[dateStr];
    if (typeof data === 'number') return data;
    if (typeof data === 'boolean' && data) return 1;
    return 0;
  };

  const getCalendarDays = () => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(displayMonth.getMonth() + direction);
    
    if (onMonthChange) {
      onMonthChange(newDate);
    } else {
      setInternalMonth(newDate);
    }
  };

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      const dateStr = formatDateToLocalString(date);
      onDateClick(dateStr);
    }
  };

  const dayLabels = locale === 'ko-KR' 
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{headerTitle}</h3>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigateMonth(-1)}
                className="bg-gray-400 hover:bg-gray-500 text-white"
                size="sm"
              >
                <i className="fas fa-chevron-left"></i>
              </Button>
              <span className="text-lg font-medium text-gray-700">
                {displayMonth.toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                })}
              </span>
              <Button
                onClick={() => navigateMonth(1)}
                className="bg-gray-400 hover:bg-gray-500 text-white"
                size="sm"
              >
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-7 gap-1">
          {/* Day labels */}
          {dayLabels.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-600 py-2 text-sm"
            >
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {getCalendarDays().map((dayInfo, index) => {
            const isCurrentDay = isToday(dayInfo.date);
            const isSelectedDay = isSelected(dayInfo.date);
            const hasTasksOnDay = hasTasks(dayInfo.date);
            const taskCount = getTaskCount(dayInfo.date);

            return (
              <div
                key={index}
                className={cn(
                  'relative aspect-square p-2 border-2 rounded cursor-pointer transition-all duration-200',
                  !dayInfo.isCurrentMonth && 'text-gray-400 bg-gray-50 border-gray-200',
                  dayInfo.isCurrentMonth && !isCurrentDay && !isSelectedDay && !hasTasksOnDay && 'border-gray-200 hover:bg-gray-50 hover:border-gray-300',
                  // Today styling (when not selected)
                  isCurrentDay && !isSelectedDay && 'bg-blue-50 border-blue-400 font-semibold text-blue-700 hover:bg-blue-100',
                  // Selected day styling (takes priority over today)
                  isSelectedDay && 'bg-purple-100 border-purple-500 font-bold text-purple-800 shadow-md ring-2 ring-purple-300',
                  // Today and selected (both)
                  isCurrentDay && isSelectedDay && 'bg-purple-200 border-purple-600 font-bold text-purple-900 shadow-lg ring-2 ring-purple-400',
                  // Days with tasks (when not selected)
                  hasTasksOnDay && !isSelectedDay && !isCurrentDay && 'bg-purple-50 border-purple-200',
                  // Days with tasks and today (when not selected)
                  hasTasksOnDay && isCurrentDay && !isSelectedDay && 'bg-blue-100 border-blue-500',
                )}
                onClick={() => {
                  if (dayInfo.isCurrentMonth && onDateClick) {
                    handleDateClick(dayInfo.date);
                  }
                }}
              >
                <div className={cn(
                  'text-sm',
                  isCurrentDay && !isSelectedDay && 'text-blue-700',
                  isSelectedDay && 'text-purple-800',
                  hasTasksOnDay && !isSelectedDay && !isCurrentDay && 'text-purple-700',
                )}>
                  {dayInfo.day}
                </div>
                {/* Task indicator */}
                {hasTasksOnDay && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {typeof taskCount === 'number' && taskCount > 0 ? (
                      <div className={cn(
                        'text-xs font-medium',
                        isSelectedDay ? 'text-purple-700' : isCurrentDay ? 'text-blue-600' : 'text-purple-600'
                      )}>
                        {taskCount}개
                      </div>
                    ) : (
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelectedDay ? 'bg-purple-600' : isCurrentDay ? 'bg-blue-500' : 'bg-purple-500'
                      )}></div>
                    )}
                  </div>
                )}
                {/* Today indicator dot */}
                {isCurrentDay && !isSelectedDay && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

