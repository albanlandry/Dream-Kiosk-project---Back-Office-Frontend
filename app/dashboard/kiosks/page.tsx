'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { KioskItem } from '@/components/kiosks/KioskItem';
import { KioskMonitoringModal } from '@/components/kiosks/KioskMonitoringModal';
import { KioskSettingsModal } from '@/components/kiosks/KioskSettingsModal';
import { AddKioskModal } from '@/components/kiosks/AddKioskModal';

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
  project?: string;
}

const mockKiosks: Kiosk[] = [
  {
    id: 'kiosk1',
    name: '키오스크 #1',
    location: '강남점 - 1층 로비',
    ip: '192.168.1.101',
    status: 'online',
    lastConnection: '2분 전',
    todayUsers: 45,
    todayRevenue: 675000,
    project: '강남점 프로젝트',
  },
  {
    id: 'kiosk2',
    name: '키오스크 #2',
    location: '강남점 - 2층 로비',
    ip: '192.168.1.102',
    status: 'online',
    lastConnection: '1분 전',
    todayUsers: 38,
    todayRevenue: 570000,
    project: '강남점 프로젝트',
  },
  {
    id: 'kiosk7',
    name: '키오스크 #7',
    location: '홍대점 - 1층 로비',
    ip: '192.168.2.107',
    status: 'warning',
    lastConnection: '5분 전',
    todayUsers: 12,
    todayRevenue: 180000,
    errorReason: '카드 리더기 오류',
    project: '홍대점 프로젝트',
  },
  {
    id: 'kiosk12',
    name: '키오스크 #12',
    location: '부산점 - 1층 로비',
    ip: '192.168.3.112',
    status: 'offline',
    lastConnection: '2시간 전',
    todayUsers: 0,
    todayRevenue: 0,
    errorReason: '네트워크 연결 끊김',
    project: '부산점 프로젝트',
  },
];

export default function KioskManagementPage() {
  const [kiosks] = useState<Kiosk[]>(mockKiosks);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
          onSuccess={() => {
            setShowAddModal(false);
            // TODO: Refresh kiosk list
          }}
        />
      )}
    </>
  );
}

