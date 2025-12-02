'use client';

import { ReactNode } from 'react';

interface SettingsFormGroupProps {
  label?: string;
  children: ReactNode;
  helpText?: string;
  className?: string;
}

export function SettingsFormGroup({
  label,
  children,
  helpText,
  className = '',
}: SettingsFormGroupProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-800">{label}</label>
      )}
      {children}
      {helpText && (
        <small className="text-xs text-gray-500 mt-1">{helpText}</small>
      )}
    </div>
  );
}

