'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { KioskItem } from '@/components/kiosks/KioskItem';
import { KioskMonitoringModal } from '@/components/kiosks/KioskMonitoringModal';
import { KioskSettingsModal } from '@/components/kiosks/KioskSettingsModal';
import { AddKioskModal } from '@/components/kiosks/AddKioskModal';
import { kiosksApi, type Kiosk as ApiKiosk } from '@/lib/api/kiosks';
import { useToastStore } from '@/lib/store/toastStore';

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
  projectId?: string;
  project?: string;
}

// Transform API kiosk to UI kiosk format
function transformKiosk(apiKiosk: ApiKiosk): Kiosk {
  // Determine status based on kiosk data
  let status: 'online' | 'warning' | 'offline' = 'offline';
  if (apiKiosk.status === 'online') {
    status = 'online';
  } else if (apiKiosk.status === 'warning') {
    status = 'warning';
  } else {
    status = 'offline';
  }

  // Calculate last connection time from timestamp
  const formatLastConnection = (lastConnection?: string | Date): string => {
    if (!lastConnection) {
      return '연결 기록 없음';
    }
    
    const lastConnDate = typeof lastConnection === 'string' 
      ? new Date(lastConnection) 
      : lastConnection;
    
    if (isNaN(lastConnDate.getTime())) {
      return '연결 기록 없음';
    }

    const now = new Date();
    const diffMs = now.getTime() - lastConnDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return '방금 전';
    } else if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      return `${diffDays}일 전`;
    }
  };

  return {
    id: apiKiosk.id,
    name: apiKiosk.name,
    location: apiKiosk.location,
    ip: apiKiosk.ipAddress,
    status,
    lastConnection: formatLastConnection(apiKiosk.lastConnection),
    todayUsers: apiKiosk.todayUsers || 0,
    todayRevenue: apiKiosk.todayRevenue || 0,
    errorReason: apiKiosk.errorReason,
    projectId: apiKiosk.projectId,
    project: apiKiosk.project?.name,
  };
}

export default function KioskManagementPage() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useToastStore();
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load kiosks from database on mount
  const loadKiosks = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiKiosks = await kiosksApi.getAll();
      const transformedKiosks = apiKiosks.map(transformKiosk);
      setKiosks(transformedKiosks);
    } catch (error: unknown) {
      console.error('Failed to load kiosks:', error);
      showError('키오스크를 불러오는데 실패했습니다.');
      setKiosks([]);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadKiosks();
  }, [loadKiosks]);

  const totalKiosks = kiosks.length;
  const onlineKiosks = kiosks.filter((k) => k.status === 'online').length;
  const warningKiosks = kiosks.filter((k) => k.status === 'warning').length;
  const errorKiosks = kiosks.filter((k) => k.status === 'offline').length;

  const handleMonitoring = (kiosk: Kiosk) => {
    setSelectedKiosk(kiosk);
    setShowMonitoringModal(true);
  };

  const handleSettings = (kiosk: Kiosk) => {
    setSelectedKiosk(kiosk);
    setShowSettingsModal(true);
  };

  const handleRestart = async (kiosk: Kiosk) => {
    if (confirm(`${kiosk.name}을(를) 재시작하시겠습니까?`)) {
      // TODO: API call to restart kiosk
      alert(`${kiosk.name} 재시작 요청이 전송되었습니다.`);
    }
  };

  const handleRepair = (kiosk: Kiosk) => {
    if (confirm(`${kiosk.name}에 대한 수리 요청을 제출하시겠습니까?`)) {
      // TODO: API call to request repair
      alert('수리 요청이 제출되었습니다.');
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="키오스크 관리"
        description="키오스크 상태 모니터링 및 관리"
        action={{
          label: '새 키오스크 추가',
          icon: 'fas fa-plus',
          onClick: () => setShowAddModal(true),
        }}
      />
      <div className="p-8 min-h-screen">
        {/* 키오스크 상태 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xl">
              <i className="fas fa-desktop"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{totalKiosks}</h3>
              <p className="text-sm text-gray-600">총 키오스크</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xl">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{onlineKiosks}</h3>
              <p className="text-sm text-gray-600">정상 운영</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white text-xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{warningKiosks}</h3>
              <p className="text-sm text-gray-600">경고</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xl">
              <i className="fas fa-times-circle"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{errorKiosks}</h3>
              <p className="text-sm text-gray-600">오류</p>
            </div>
          </div>
        </div>

        {/* 키오스크 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : kiosks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <i className="fas fa-desktop text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 text-lg">키오스크가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {kiosks.map((kiosk) => (
              <KioskItem
                key={kiosk.id}
                kiosk={kiosk}
                onMonitoring={() => handleMonitoring(kiosk)}
                onSettings={() => handleSettings(kiosk)}
                onRestart={() => handleRestart(kiosk)}
                onRepair={() => handleRepair(kiosk)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showMonitoringModal && selectedKiosk && (
        <KioskMonitoringModal
          kiosk={selectedKiosk}
          onClose={() => {
            setShowMonitoringModal(false);
            setSelectedKiosk(null);
          }}
        />
      )}

      {showSettingsModal && selectedKiosk && (
        <KioskSettingsModal
          kiosk={selectedKiosk}
          onClose={() => {
            setShowSettingsModal(false);
            setSelectedKiosk(null);
          }}
        />
      )}

      {showAddModal && (
        <AddKioskModal
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            await loadKiosks();
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

