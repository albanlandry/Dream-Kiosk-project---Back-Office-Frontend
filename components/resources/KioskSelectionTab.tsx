'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: string;
}

interface KioskSelectionTabProps {
  kiosks: Kiosk[];
  selectedKioskIds: string[];
  isLoading: boolean;
  resourceName: string;
  onKioskSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onValidate: () => void;
  onReset: () => void;
}

export function KioskSelectionTab({
  kiosks,
  selectedKioskIds,
  isLoading,
  resourceName,
  onKioskSelect,
  onSelectAll,
  onValidate,
  onReset,
}: KioskSelectionTabProps) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {resourceName} - 키오스크 연결
        </h3>
        <p className="text-sm text-gray-600">
          이 리소스를 사용할 키오스크를 선택하세요.
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onValidate}
          className="flex-1"
        >
          <i className="fas fa-check mr-2"></i>
          연결 저장
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReset}
          className="flex-1"
        >
          <i className="fas fa-undo mr-2"></i>
          초기화
        </Button>
      </div>

      {/* 키오스크 목록 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : kiosks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">키오스크가 없습니다.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedKioskIds.length === kiosks.length && kiosks.length > 0}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">전체 선택</span>
            </label>
          </div>
          <div className="space-y-2">
            {kiosks.map((kiosk) => (
              <label
                key={kiosk.id}
                className={cn(
                  'flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all',
                  selectedKioskIds.includes(kiosk.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedKioskIds.includes(kiosk.id)}
                  onChange={(e) => onKioskSelect(kiosk.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{kiosk.name}</p>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded',
                        kiosk.status === 'online'
                          ? 'bg-green-100 text-green-700'
                          : kiosk.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      {kiosk.status === 'online' ? '온라인' : kiosk.status === 'warning' ? '경고' : '오프라인'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {kiosk.location}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

