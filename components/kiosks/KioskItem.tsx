'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface Kiosk {
  id: string;
  name: string;
  location: string;
  ip: string;
  status: 'online' | 'warning' | 'offline';
  lastConnection: string;
  todayUsers: number;
  todayRevenue: number;
  errorReason?: string;
}

interface KioskItemProps {
  kiosk: Kiosk;
  onMonitoring: () => void;
  onSettings: () => void;
  onRestart: () => void;
  onRepair: () => void;
}

export function KioskItem({
  kiosk,
  onMonitoring,
  onSettings,
  onRestart,
  onRepair,
}: KioskItemProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '온라인';
      case 'warning':
        return '경고';
      case 'offline':
        return '오프라인';
      default:
        return status;
    }
  };

  const getBorderColor = () => {
    switch (kiosk.status) {
      case 'online':
        return 'border-blue-500';
      case 'warning':
        return 'border-yellow-500';
      case 'offline':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div
        className={cn(
          'bg-white rounded-xl p-6 shadow-sm border-l-4',
          getBorderColor()
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-1">
              {kiosk.name}
            </h4>
            <p className="text-sm text-gray-600">{kiosk.location}</p>
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold',
              getStatusClass(kiosk.status)
            )}
          >
            {getStatusText(kiosk.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">IP 주소:</span>
            <span className="text-sm text-gray-600">{kiosk.ip}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">마지막 연결:</span>
            <span className="text-sm text-gray-600">{kiosk.lastConnection}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">오늘 사용자:</span>
            <span className="text-sm text-gray-600">{kiosk.todayUsers}명</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">오늘 매출:</span>
            <span className="text-sm text-gray-600">
              ₩{kiosk.todayRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        {kiosk.errorReason && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800">
                {kiosk.status === 'warning' ? '경고 사유:' : '오류 사유:'}
              </span>
              <span className="text-sm text-red-600 font-semibold">
                {kiosk.errorReason}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={onMonitoring}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
          >
            <i className="fas fa-eye mr-2"></i>모니터링
          </Button>
          <Button
            onClick={onSettings}
            className="bg-gray-500 hover:bg-gray-600 text-white text-sm"
          >
            <i className="fas fa-cog mr-2"></i>설정
          </Button>
          <Button
            onClick={onRestart}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
          >
            <i className="fas fa-sync mr-2"></i>재시작
          </Button>
          {(kiosk.status === 'warning' || kiosk.status === 'offline') && (
            <Button
              onClick={onRepair}
              className="bg-red-500 hover:bg-red-600 text-white text-sm"
            >
              <i className="fas fa-tools mr-2"></i>수리 요청
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

