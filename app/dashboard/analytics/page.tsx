'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { FilterSection, FilterGroup } from '@/components/ui/filter-section';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [periodFilter, setPeriodFilter] = useState('month');
  const [projectFilter, setProjectFilter] = useState('');
  const [kioskFilter, setKioskFilter] = useState('');

  const tabs = [
    { id: 'overview', label: '전체 개요' },
    { id: 'project', label: '프로젝트별' },
    { id: 'period', label: '기간별' },
    { id: 'comparison', label: '비교 분석' },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="분석 & 리포트"
        description="시스템 성과 분석 및 상세 리포트"
        action={{
          label: '리포트 다운로드',
          icon: 'fas fa-download',
          onClick: () => console.log('Download report'),
        }}
      />
      <div className="p-8 min-h-screen">
        {/* 필터 섹션 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold text-sm border-b-3 transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <FilterSection>
            <FilterGroup label="기간:">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="today">오늘</option>
                <option value="week">이번 주</option>
                <option value="month">이번 달</option>
                <option value="quarter">이번 분기</option>
                <option value="year">올해</option>
                <option value="custom">사용자 정의</option>
              </select>
            </FilterGroup>
            <FilterGroup label="프로젝트:">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">전체 프로젝트</option>
                <option value="project1">강남점 프로젝트</option>
                <option value="project2">홍대점 프로젝트</option>
                <option value="project3">부산점 프로젝트</option>
              </select>
            </FilterGroup>
            <FilterGroup label="키오스크:">
              <select
                value={kioskFilter}
                onChange={(e) => setKioskFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">전체 키오스크</option>
                <option value="kiosk1">키오스크 #1</option>
                <option value="kiosk2">키오스크 #2</option>
                <option value="kiosk3">키오스크 #3</option>
              </select>
            </FilterGroup>
            <Button className="bg-gray-500 hover:bg-gray-600 text-white">
              <i className="fas fa-sync mr-2"></i>새로고침
            </Button>
          </FilterSection>
        </div>

        {/* 전체 개요 탭 */}
        {activeTab === 'overview' && (
          <>
            {/* 핵심 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<i className="fas fa-video"></i>}
                value="1,234"
                label="총 콘텐츠 생성"
                change={{ value: '+12.5%', type: 'positive' }}
                iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
              />
              <StatCard
                icon={<i className="fas fa-won-sign"></i>}
                value="₩2,456,789"
                label="총 매출"
                change={{ value: '+8.3%', type: 'positive' }}
                iconBg="bg-gradient-to-br from-pink-500 to-red-500"
              />
              <StatCard
                icon={<i className="fas fa-users"></i>}
                value="567"
                label="활성 사용자"
                change={{ value: '+15.2%', type: 'positive' }}
                iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <StatCard
                icon={<i className="fas fa-percentage"></i>}
                value="78.5%"
                label="전환율"
                change={{ value: '+3.1%', type: 'positive' }}
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
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">템플릿별 인기도</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">키오스크별 성과</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 프로젝트별 탭 */}
        {activeTab === 'project' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">프로젝트 선택</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['전체', '강남점 프로젝트', '홍대점 프로젝트', '부산점 프로젝트'].map(
                  (project, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border-2 border-transparent rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-all"
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">{project}</h4>
                      <p className="text-sm text-gray-600">
                        {project === '전체' ? '모든 프로젝트 통합' : `${project} 키오스크 운영`}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-5">프로젝트별 성과 비교</h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>차트 영역 (Chart.js 통합 필요)</p>
              </div>
            </div>
          </div>
        )}

        {/* 기간별 탭 */}
        {activeTab === 'period' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">분석 기간</h3>
              <div className="flex gap-2">
                {['일별', '주별', '월별', '년별'].map((period, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 bg-gray-100 border-2 border-transparent rounded-lg text-sm font-semibold text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-all"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">기간별 매출 추이</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">기간별 사용자 증가</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 비교 분석 탭 */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">비교 분석</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FilterGroup label="비교 대상:">
                  <select className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                    <option value="period">기간 비교</option>
                    <option value="project">프로젝트 비교</option>
                    <option value="kiosk">키오스크 비교</option>
                  </select>
                </FilterGroup>
                <FilterGroup label="기준 기간:">
                  <input
                    type="date"
                    defaultValue="2024-11-01"
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </FilterGroup>
                <FilterGroup label="비교 기간:">
                  <input
                    type="date"
                    defaultValue="2024-12-01"
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </FilterGroup>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-5">비교 분석 차트</h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>차트 영역 (Chart.js 통합 필요)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

