'use client';

import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from './button';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onChange(date, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onChange(startDate, date);
  };

  const handleClear = () => {
    onChange(undefined, undefined);
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onChange(start, end);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {startDate && endDate ? (
          <span>
            {formatDate(startDate)} ~ {formatDate(endDate)}
          </span>
        ) : (
          <span className="text-gray-500">날짜 범위 선택</span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-lg shadow-lg border p-4 min-w-[320px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">날짜 범위 선택</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={formatDate(startDate)}
                  onChange={handleStartDateChange}
                  max={formatDate(endDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={formatDate(endDate)}
                  onChange={handleEndDateChange}
                  min={formatDate(startDate)}
                  max={formatDate(new Date())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-3 mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">빠른 선택</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(7)}
                  className="text-xs"
                >
                  최근 7일
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(30)}
                  className="text-xs"
                >
                  최근 30일
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(90)}
                  className="text-xs"
                >
                  최근 90일
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(365)}
                  className="text-xs"
                >
                  최근 1년
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                초기화
              </Button>
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                적용
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

