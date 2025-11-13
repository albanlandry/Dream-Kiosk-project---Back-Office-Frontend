import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  iconBg?: string;
  className?: string;
}

export function StatCard({
  icon,
  value,
  label,
  change,
  iconBg = 'bg-gradient-to-br from-purple-500 to-purple-700',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5',
        className
      )}
    >
      <div className={cn('w-[60px] h-[60px] rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        {change && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded-full',
              change.type === 'positive' && 'bg-green-100 text-green-800',
              change.type === 'negative' && 'bg-red-100 text-red-800',
              change.type === 'neutral' && 'bg-gray-100 text-gray-800'
            )}
          >
            {change.value}
          </span>
        )}
      </div>
    </div>
  );
}

