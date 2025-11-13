'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'warning' | 'offline';
}

interface KioskMonitoringModalProps {
  kiosk: Kiosk;
  onClose: () => void;
}

const mockPerformance = {
  cpu: 45,
  memory: 62,
  disk: 78,
  network: 12,
};

const mockHardware = [
  { name: '카메라 (Femto)', status: 'normal', version: 'v2.1.3' },
  { name: '카드 리더기', status: 'normal', version: 'v1.8.2' },
  { name: '영수증 프린터', status: 'normal', version: 'v3.0.1' },
  { name: '마이크', status: 'normal', version: 'v1.5.0' },
];

const mockLogs = [
  { time: '14:30:25', level: 'INFO', message: '사용자 세션 시작' },
  { time: '14:28:15', level: 'INFO', message: '결제 완료 - ₩15,000' },
  { time: '14:25:42', level: 'WARN', message: '카드 리더기 응답 지연' },
  { time: '14:20:10', level: 'INFO', message: '콘텐츠 생성 완료' },
];

export function KioskMonitoringModal({ kiosk, onClose }: KioskMonitoringModalProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'hardware' | 'logs'>(
    'performance'
  );

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

  const getHardwareStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return '정상';
      case 'error':
        return '오류';
      case 'warning':
        return '경고';
      default:
        return '알 수 없음';
    }
  };

  const getHardwareStatusClass = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getLogClass = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'bg-blue-50 text-blue-800';
      case 'WARN':
        return 'bg-yellow-50 text-yellow-800';
      case 'ERROR':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>키오스크 모니터링</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 키오스크 정보 */}
            <div className="text-center pb-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{kiosk.name}</h3>
              <p className="text-gray-600 mb-3">{kiosk.location}</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                  kiosk.status
                )}`}
              >
                {getStatusText(kiosk.status)}
              </span>
            </div>

            {/* 탭 */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-6 py-3 font-semibold text-sm border-b-3 transition-all ${
                  activeTab === 'performance'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                }`}
              >
                성능 모니터링
              </button>
              <button
                onClick={() => setActiveTab('hardware')}
                className={`px-6 py-3 font-semibold text-sm border-b-3 transition-all ${
                  activeTab === 'hardware'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                }`}
              >
                하드웨어 상태
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-3 font-semibold text-sm border-b-3 transition-all ${
                  activeTab === 'logs'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                }`}
              >
                시스템 로그
              </button>
            </div>

            {/* 성능 모니터링 탭 */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        CPU 사용률
                      </span>
                      <span className="text-sm font-bold text-blue-500">
                        {mockPerformance.cpu}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${mockPerformance.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        메모리 사용률
                      </span>
                      <span className="text-sm font-bold text-blue-500">
                        {mockPerformance.memory}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${mockPerformance.memory}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        디스크 사용률
                      </span>
                      <span className="text-sm font-bold text-blue-500">
                        {mockPerformance.disk}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${mockPerformance.disk}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        네트워크 사용률
                      </span>
                      <span className="text-sm font-bold text-blue-500">
                        {mockPerformance.network}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${mockPerformance.network}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 하드웨어 상태 탭 */}
            {activeTab === 'hardware' && (
              <div className="space-y-3">
                {mockHardware.map((hw, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-semibold text-gray-800">
                      {hw.name}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-sm font-semibold ${getHardwareStatusClass(
                          hw.status
                        )}`}
                      >
                        {getHardwareStatusText(hw.status)}
                      </span>
                      <span className="text-xs text-gray-500">{hw.version}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 시스템 로그 탭 */}
            {activeTab === 'logs' && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mockLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 p-3 rounded-lg text-sm ${getLogClass(
                      log.level
                    )}`}
                  >
                    <span className="font-semibold min-w-[70px]">{log.time}</span>
                    <span className="font-semibold min-w-[50px]">{log.level}</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

