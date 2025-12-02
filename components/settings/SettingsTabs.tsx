'use client';

import { cn } from '@/lib/utils/cn';

interface SettingsTabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SettingsTabs({ tabs, activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex gap-2 mb-8 border-b border-gray-200 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'bg-transparent border-none px-6 py-3 text-sm font-semibold cursor-pointer',
            'border-b-3 border-transparent transition-all duration-300 whitespace-nowrap',
            activeTab === tab.id
              ? 'text-blue-500 border-b-blue-500'
              : 'text-gray-500 hover:text-blue-500'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

