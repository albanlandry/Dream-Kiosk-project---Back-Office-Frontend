'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Project } from '@/app/dashboard/projects/page';
import { cn } from '@/lib/utils/cn';

interface ViewProjectModalProps {
  project: Project;
  onClose: () => void;
}

interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'warning' | 'offline';
}

interface ContentPC {
  id: string;
  name: string;
  location: string;
  displayCount: number;
  status: 'online' | 'offline';
}

interface Activity {
  timestamp: string;
  action: string;
  details: string;
  user?: string;
}

const mockKiosks: Kiosk[] = [
  {
    id: 'kiosk1',
    name: '키오스크 #1',
    location: '강남점 - 1층 로비',
    status: 'online',
  },
  {
    id: 'kiosk2',
    name: '키오스크 #2',
    location: '강남점 - 2층 로비',
    status: 'online',
  },
];

const mockContentPCs: ContentPC[] = [
  {
    id: 'pc1',
    name: 'Content PC #1',
    location: '강남점 - 1층',
    displayCount: 3,
    status: 'online',
  },
  {
    id: 'pc2',
    name: 'Content PC #2',
    location: '강남점 - 1층',
    displayCount: 2,
    status: 'online',
  },
  {
    id: 'pc3',
    name: 'Content PC #3',
    location: '강남점 - 2층',
    displayCount: 2,
    status: 'online',
  },
  {
    id: 'pc4',
    name: 'Content PC #4',
    location: '강남점 - 2층',
    displayCount: 1,
    status: 'online',
  },
];

const mockActivities: Activity[] = [
  {
    timestamp: '2024-12-22 14:30',
    action: '새 콘텐츠 생성',
    details: '용의 꿈 - 이영희',
    user: '김철수',
  },
  {
    timestamp: '2024-12-22 13:15',
    action: '스케줄 추가',
    details: '호랑이의 꿈 - 박민수',
    user: '김철수',
  },
  {
    timestamp: '2024-12-22 12:45',
    action: '키오스크 상태 변경',
    details: '키오스크 #1 온라인',
    user: '시스템',
  },
  {
    timestamp: '2024-12-22 11:20',
    action: '결제 완료',
    details: '₩15,000 - 7일 노출',
  },
];

export function ViewProjectModal({ project, onClose }: ViewProjectModalProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'kiosk' | 'contentpc' | 'statistics' | 'activity'
  >('overview');

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'paused':
        return '일시정지';
      case 'stopped':
        return '종료됨';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKioskStatusClass = (status: string) => {
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

  const getKioskStatusText = (status: string) => {
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

  // 프로젝트에 연결된 키오스크 필터링 (실제로는 API에서 가져와야 함)
  const projectKiosks = mockKiosks.filter((k) => k.location.includes(project.name.split(' ')[0]));
  const projectContentPCs = mockContentPCs.filter((pc) =>
    pc.location.includes(project.name.split(' ')[0])
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="min-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>프로젝트 상세보기</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-12">
            {/* 프로젝트 헤더 */}
            <div className="pb-6 border-b border-gray-200 flex flex-col gap-1 justify-center items-center">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl text-center font-semibold text-gray-800 mb-2">{project.name}</h3>
                  <p className="text-gray-600">{project.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">소유자: {project.owner}</span>
                <span
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-semibold',
                      getStatusClass(project.status)
                    )}
                  >
                    {getStatusText(project.status)}
                  </span>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  'px-6 py-3 font-semibold text-sm border-b-3 transition-all',
                  activeTab === 'overview'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                )}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab('kiosk')}
                className={cn(
                  'px-6 py-3 font-semibold text-sm border-b-3 transition-all',
                  activeTab === 'kiosk'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                )}
              >
                키오스크
              </button>
              <button
                onClick={() => setActiveTab('contentpc')}
                className={cn(
                  'px-6 py-3 font-semibold text-sm border-b-3 transition-all',
                  activeTab === 'contentpc'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                )}
              >
                Content PC
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={cn(
                  'px-6 py-3 font-semibold text-sm border-b-3 transition-all',
                  activeTab === 'statistics'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                )}
              >
                통계
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  'px-6 py-3 font-semibold text-sm border-b-3 transition-all',
                  activeTab === 'activity'
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                )}
              >
                활동 내역
              </button>
            </div>

            {/* 개요 탭 */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-row gap-1 justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <label className="block font-bold text-sm text-gray-600">
                      시작일
                    </label>
                    <p className="text-base text-gray-800">{project.startDate}</p>
                  </div>
                  <div className="flex flex-row gap-1 justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <label className="block font-bold text-sm text-gray-600">
                      종료일
                    </label>
                    <p className="text-base text-gray-800">{project.endDate || '진행 중'}</p>
                  </div>
                  <div className="flex flex-row gap-1 justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <label className="block font-bold text-sm text-gray-600">
                      키오스크 수
                    </label>
                    <p className="text-base text-gray-800">{project.kioskCount}대</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-row gap-1 justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <label className="block font-bold text-sm text-gray-600">
                      Content PC 수
                    </label>
                    <p className="text-base text-gray-800">{project.contentPCCount}대</p>
                  </div>
                  <div className="flex flex-row gap-1 justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <label className="block font-bold text-sm text-gray-600">
                      총 콘텐츠
                    </label>
                    <p className="text-base text-gray-800">{project.totalContent}개</p>
                  </div>
                  <div className="flex flex-row gap-1 justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <label className="block font-bold text-sm text-gray-600">
                      총 매출
                    </label>
                    <p className="text-base text-gray-800">₩{project.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 키오스크 탭 */}
            {activeTab === 'kiosk' && (
              <div className="space-y-3">
                {projectKiosks.length > 0 ? (
                  projectKiosks.map((kiosk) => (
                    <div
                      key={kiosk.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{kiosk.name}</h4>
                        <p className="text-sm text-gray-600">{kiosk.location}</p>
                      </div>
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          getKioskStatusClass(kiosk.status)
                        )}
                      >
                        {getKioskStatusText(kiosk.status)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">연결된 키오스크가 없습니다.</p>
                )}
              </div>
            )}

            {/* Content PC 탭 */}
            {activeTab === 'contentpc' && (
              <div className="space-y-3">
                {projectContentPCs.length > 0 ? (
                  projectContentPCs.map((pc) => (
                    <div
                      key={pc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{pc.name}</h4>
                        <p className="text-sm text-gray-600">
                          {pc.location} · 디스플레이: {pc.displayCount}대
                        </p>
                      </div>
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          pc.status === 'online'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {pc.status === 'online' ? '온라인' : '오프라인'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">연결된 Content PC가 없습니다.</p>
                )}
              </div>
            )}

            {/* 통계 탭 */}
            {activeTab === 'statistics' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">
                    <i className="fas fa-video text-purple-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {project.totalContent}
                  </div>
                  <div className="text-sm text-gray-600">총 콘텐츠</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">
                    <i className="fas fa-won-sign text-purple-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    ₩{project.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">총 매출</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">
                    <i className="fas fa-users text-purple-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">1,234</div>
                  <div className="text-sm text-gray-600">총 사용자</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">
                    <i className="fas fa-percentage text-purple-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">82.3%</div>
                  <div className="text-sm text-gray-600">평균 전환율</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">
                    <i className="fas fa-calendar text-purple-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">12</div>
                  <div className="text-sm text-gray-600">활성 스케줄</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">
                    <i className="fas fa-check-circle text-purple-500"></i>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">89</div>
                  <div className="text-sm text-gray-600">완료된 스케줄</div>
                </div>
              </div>
            )}

            {/* 활동 내역 탭 */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {mockActivities.map((activity, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="w-1 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          {activity.action}
                        </span>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{activity.details}</p>
                      {activity.user && (
                        <p className="text-xs text-blue-600">
                          <span className="cursor-pointer hover:underline">{activity.user}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-6">
            <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
              취소
            </Button>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">저장</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
