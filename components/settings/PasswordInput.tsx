'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showGenerateButton?: boolean;
  onGenerate?: () => void;
  className?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = '비밀번호를 입력하세요',
  showGenerateButton = false,
  onGenerate,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex-1 relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
        </button>
      </div>
      {showGenerateButton && onGenerate && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onGenerate}
          className="whitespace-nowrap"
        >
          <i className="fas fa-sync mr-2"></i>
          새로 생성
        </Button>
      )}
    </div>
  );
}

