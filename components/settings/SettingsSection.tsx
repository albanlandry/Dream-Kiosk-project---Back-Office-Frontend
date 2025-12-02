'use client';

import { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, children, className = '' }: SettingsSectionProps) {
  return (
    <div className={`bg-white rounded-xl p-6 mb-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
        {title}
      </h3>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

