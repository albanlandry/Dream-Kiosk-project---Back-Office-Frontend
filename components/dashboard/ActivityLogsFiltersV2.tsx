'use client';

import { useState, useEffect } from 'react';
import { X, Filter, Calendar, List, ChevronDown, ChevronUp } from 'lucide-react';
import { ActivityLogFilters } from '@/lib/api/activity-logs';
import { Badge } from '@/components/ui/badge';
import { useActivityLogsUIStore } from '@/lib/store/activityLogsUIStore';

interface ActivityLogsFiltersV2Props {
  filters: ActivityLogFilters;
  onFiltersChange: (filters: ActivityLogFilters) => void;
  onLimitChange?: (limit: number) => void;
  onDateRangeChange?: (startDate?: Date, endDate?: Date) => void;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

const CATEGORIES = [
  { value: 'admin', label: '관리', icon: '⚙️', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
  { value: 'payment', label: '결제', icon: '💳', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'content', label: '콘텐츠', icon: '📹', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { value: 'system', label: '시스템', icon: '🔧', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { value: 'security', label: '보안', icon: '🔒', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { value: 'hardware', label: '하드웨어', icon: '🖥️', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'user', label: '사용자', icon: '👤', color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' },
];

const LEVELS = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500 text-white' },
  { value: 'error', label: 'Error', color: 'bg-orange-500 text-white' },
  { value: 'warn', label: 'Warning', color: 'bg-yellow-500 text-white' },
  { value: 'info', label: 'Info', color: 'bg-blue-500 text-white' },
  { value: 'debug', label: 'Debug', color: 'bg-gray-500 text-white' },
];

const STATUSES = [
  { value: 'success', label: '성공', icon: '✓', color: 'bg-green-500 text-white' },
  { value: 'failed', label: '실패', icon: '✗', color: 'bg-red-500 text-white' },
  { value: 'pending', label: '대기', icon: '⏳', color: 'bg-yellow-500 text-white' },
  { value: 'cancelled', label: '취소', icon: '⊘', color: 'bg-gray-500 text-white' },
];

const LIMIT_OPTIONS = [5, 15, 30, 50, 100];

export function ActivityLogsFiltersV2({
  filters: filtersProp,
  onFiltersChange,
  onLimitChange,
  onDateRangeChange,
  limit = 50,
  startDate,
  endDate,
}: ActivityLogsFiltersV2Props) {
  // Use UI store for expanded state persistence
  const { isFiltersExpanded, setFiltersExpanded } = useActivityLogsUIStore();
  const [isExpanded, setIsExpanded] = useState(isFiltersExpanded);
  
  // Sync local state with store
  useEffect(() => {
    setIsExpanded(isFiltersExpanded);
  }, [isFiltersExpanded]);

  // Update store when expanded state changes
  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    setFiltersExpanded(newExpanded);
  };
  
  // filters가 undefined일 수 있으므로 안전하게 처리
  const filters = filtersProp || {};

  const handleCategoryToggle = (category: string) => {
    const newCategory = filters.category === category ? undefined : category;
    onFiltersChange({
      ...filters,
      category: newCategory,
      page: 1,
    });
  };

  const handleLevelToggle = (level: string) => {
    const newLevel = filters.level === level ? undefined : (level as ActivityLogFilters['level']);
    onFiltersChange({
      ...filters,
      level: newLevel,
      page: 1,
    });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status === status ? undefined : (status as ActivityLogFilters['status']);
    onFiltersChange({
      ...filters,
      status: newStatus,
      page: 1,
    });
  };

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    if (onDateRangeChange) {
      onDateRangeChange(start, end);
    }
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
      limit: filters.limit || limit,
    });
    if (onDateRangeChange) {
      onDateRangeChange(undefined, undefined);
    }
  };

  const hasActiveFilters =
    !!filters.category ||
    !!filters.level ||
    !!filters.status ||
    !!startDate ||
    !!endDate;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.level) count++;
    if (filters.status) count++;
    if (startDate || endDate) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Header with Active Filters Count */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggleExpanded}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors hover:shadow-none focus:shadow-none active:shadow-none hover:translate-y-0 hover:not-disabled:translate-y-0"
        >
          <Filter className="h-4 w-4" />
          <span>필터</span>
          {hasActiveFilters && (
            <Badge variant="default" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </button>
        <div className="flex items-center gap-3">
          {/* Limit Selector - Compact */}
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-gray-500" />
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                if (onLimitChange) {
                  onLimitChange(newLimit);
                }
                onFiltersChange({
                  ...filters,
                  limit: newLimit,
                  page: 1,
                });
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}개
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-3 w-3" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Tags - Always visible when filters are active */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs font-medium text-gray-600">적용된 필터:</span>
          {filters.category && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
              onClick={() => handleCategoryToggle(filters.category!)}
            >
              {CATEGORIES.find((c) => c.value === filters.category)?.label || filters.category}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.level && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
              onClick={() => handleLevelToggle(filters.level!)}
            >
              {LEVELS.find((l) => l.value === filters.level)?.label || filters.level}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {filters.status && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
              onClick={() => handleStatusToggle(filters.status!)}
            >
              {STATUSES.find((s) => s.value === filters.status)?.label || filters.status}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {(startDate || endDate) && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
              onClick={() => handleDateRangeChange(undefined, undefined)}
            >
              <Calendar className="h-3 w-3" />
              {startDate && endDate
                ? `${startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ~ ${endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`
                : startDate
                  ? `${startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ~`
                  : `~ ${endDate?.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Controls - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden'}`}>
          {/* Category Filters - Tag Style */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isActive = filters.category === category.value;
                return (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryToggle(category.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? `${category.color} shadow-md scale-105`
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1.5">{category.icon}</span>
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level & Status Filters - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level Filters */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                레벨
              </label>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((level) => {
                  const isActive = filters.level === level.value;
                  return (
                    <button
                      key={level.value}
                      onClick={() => handleLevelToggle(level.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? `${level.color} shadow-md scale-105`
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                상태
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => {
                  const isActive = filters.status === status.value;
                  return (
                    <button
                      key={status.value}
                      onClick={() => handleStatusToggle(status.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? `${status.color} shadow-md scale-105`
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-1">{status.icon}</span>
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date Range Picker - Compact Inline */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              날짜 범위
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    handleDateRangeChange(date, endDate);
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="시작일"
                />
              </div>
              <span className="text-gray-400 font-medium">~</span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="date"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    handleDateRangeChange(startDate, date);
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="종료일"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

