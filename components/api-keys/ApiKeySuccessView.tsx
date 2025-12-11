'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';

interface ApiKeySuccessViewProps {
  apiKey: string;
  onBackToList: () => void;
  onCreateAnother: () => void;
}

export function ApiKeySuccessView({
  apiKey,
  onBackToList,
  onCreateAnother,
}: ApiKeySuccessViewProps) {
  const [keyCopied, setKeyCopied] = useState(false);

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="API 키 생성 완료"
        description="새로운 API 키가 생성되었습니다. 이 키를 안전하게 저장하세요."
      />
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">API 키</label>
            <div className="mt-2 flex gap-2">
              <Input value={apiKey} readOnly className="font-mono" />
              <Button onClick={copyToClipboard}>
                {keyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 text-sm text-red-600">
              ⚠️ 이 키는 한 번만 표시됩니다. 안전하게 저장하세요.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={onBackToList}>목록으로</Button>
            <Button variant="outline" onClick={onCreateAnother}>
              다른 키 생성
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

