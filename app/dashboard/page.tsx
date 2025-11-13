'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: statistics, isLoading } = useStatistics();
  const [recentActivities, setRecentActivities] = useState([
    {
      icon: 'fas fa-video',
      title: '새로운 콘텐츠 생성',
      description: '키오스크 #3에서 "용" 템플릿으로 콘텐츠 생성',
      time: '2분 전',
    },
    {
      icon: 'fas fa-credit-card',
      title: '결제 완료',
      description: '₩15,000 - 7일 노출 상품',
      time: '5분 전',
    },
    {
      icon: 'fas fa-exclamation-triangle',
      title: '키오스크 오류',
      description: '키오스크 #7에서 카드 리더기 오류 발생',
      time: '10분 전',
    },
  ]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="대시보드"
        description="Dream Piece System 현황"
      />
      <div className="p-8 min-h-screen">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<i className="fas fa-video"></i>}
            value={statistics?.total_content || 1234}
            label="생성된 콘텐츠"
            change={{ value: '+12%', type: 'positive' }}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <StatCard
            icon={<i className="fas fa-credit-card"></i>}
            value={`₩${(statistics?.total_revenue || 2456789).toLocaleString()}`}
            label="총 매출"
            change={{ value: '+8%', type: 'positive' }}
            iconBg="bg-gradient-to-br from-pink-500 to-red-500"
          />
          <StatCard
            icon={<i className="fas fa-users"></i>}
            value={statistics?.active_users || 567}
            label="활성 사용자"
            change={{ value: '+15%', type: 'positive' }}
            iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<i className="fas fa-desktop"></i>}
            value={statistics?.active_kiosks || 12}
            label="활성 키오스크"
            change={{ value: '0%', type: 'neutral' }}
            iconBg="bg-gradient-to-br from-green-400 to-teal-500"
          />
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">일별 매출 추이</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>차트 영역 (Chart.js 통합 필요)</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">콘텐츠 생성 현황</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>차트 영역 (Chart.js 통합 필요)</p>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">최근 활동</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <i className={activity.icon}></i>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-1">{activity.title}</p>
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
