'use client';

import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  min?: number;
  max?: number;
  filled?: boolean; // Whether to show as filled progress bar or slider
  className?: string;
  showValue?: boolean;
  valueLabel?: string;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export function ProgressBar({
  value,
  min = 0,
  max = 100,
  filled = false,
  className,
  showValue = true,
  valueLabel,
  onChange,
  disabled = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  if (filled) {
    // Filled progress bar style
    return (
      <div className={cn('w-full', className)}>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-200 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <div className="mt-2 text-sm font-medium text-gray-700 text-right">
            {valueLabel || `${Math.round(value)}%`}
          </div>
        )}
      </div>
    );
  }

  // Interactive slider style
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Track background */}
        <div className="h-2 bg-gray-200 rounded-full">
          {/* Filled portion */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Slider handle */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange?.(parseInt(e.target.value))}
          disabled={disabled}
          className={cn(
            'absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer',
            'appearance-none bg-transparent',
            disabled && 'cursor-not-allowed'
          )}
          style={{
            background: 'transparent',
          }}
        />
        {/* Custom handle */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full',
            'border-2 border-white shadow-md transition-all duration-200',
            'pointer-events-none',
            disabled && 'opacity-50'
          )}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
      {showValue && (
        <div className="mt-2 text-sm font-medium text-gray-700 text-right">
          {valueLabel || `${Math.round(value)}%`}
        </div>
      )}
    </div>
  );
}

