import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface FilterSectionProps {
  children: ReactNode;
  className?: string;
}

export function FilterSection({ children, className }: FilterSectionProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm mb-6 flex gap-5 items-end flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FilterGroup({ label, children, className }: FilterGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2 min-w-[150px]', className)}>
      <label className="text-sm font-semibold text-gray-800">{label}</label>
      {children}
    </div>
  );
}

interface SearchGroupProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: () => void;
  className?: string;
}

export function SearchGroup({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  className,
}: SearchGroupProps) {
  return (
    <div className={cn('flex gap-2 flex-1 min-w-[300px]', className)}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={onSearch}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
}

