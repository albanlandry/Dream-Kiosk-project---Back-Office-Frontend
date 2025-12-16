'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { ActivityLogFilters } from '@/lib/api/activity-logs';

interface ActivityLogsFiltersProps {
  filters: ActivityLogFilters;
  onFiltersChange: (filters: ActivityLogFilters) => void;
  onLimitChange: (limit: number) => void;
  onDateRangeChange: (startDate?: Date, endDate?: Date) => void;
  limit: number;
  startDate?: Date;
  endDate?: Date;
}

const CATEGORIES = [
  { value: '', label: '전체 카테고리' },
  { value: 'admin', label: '관리' },
  { value: 'payment', label: '결제' },
  { value: 'content', label: '콘텐츠' },
  { value: 'system', label: '시스템' },
  { value: 'security', label: '보안' },
  { value: 'hardware', label: '하드웨어' },
  { value: 'user', label: '사용자' },
];

const LEVELS = [
  { value: '', label: '전체 레벨' },
  { value: 'critical', label: 'Critical' },
  { value: 'error', label: 'Error' },
  { value: 'warn', label: 'Warning' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' },
];

const STATUSES = [
  { value: '', label: '전체 상태' },
  { value: 'success', label: '성공' },
  { value: 'failed', label: '실패' },
  { value: 'pending', label: '대기 중' },
  { value: 'cancelled', label: '취소됨' },
];

const LIMIT_OPTIONS = [5, 15, 30, 50, 100];

export function ActivityLogsFilters({
  filters,
  onFiltersChange,
  onLimitChange,
  onDateRangeChange,
  limit,
  startDate,
  endDate,
}: ActivityLogsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category || undefined,
      page: 1, // Reset to first page when filter changes
    });
  };

  const handleLevelChange = (level: string) => {
    onFiltersChange({
      ...filters,
      level: (level as ActivityLogFilters['level']) || undefined,
      page: 1,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: (status as ActivityLogFilters['status']) || undefined,
      page: 1,
    });
  };

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    onDateRangeChange(start, end);
    onFiltersChange({
      ...filters,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
      page: 1,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
    onDateRangeChange(undefined, undefined);
  };

  const hasActiveFilters =
    filters.category ||
    filters.level ||
    filters.status ||
    startDate ||
    endDate;

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>필터</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
            <span>필터 초기화</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              레벨
            </label>
            <select
              value={filters.level || ''}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Limit Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              표시 개수
            </label>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                onLimitChange(newLimit);
                onFiltersChange({
                  ...filters,
                  limit: newLimit,
                  page: 1,
                });
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}개
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Date Range Picker - Always visible */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          날짜 범위
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : undefined;
              handleDateRangeChange(date, endDate);
            }}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">~</span>
          <input
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : undefined;
              handleDateRangeChange(startDate, date);
            }}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

