'use client';

import { Header } from '@/components/layout/Header';
import { FilterSection, FilterGroup, SearchGroup } from '@/components/ui/filter-section';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ContentManagementPage() {
  const [templateFilter, setTemplateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const contentItems = [
    {
      id: '1',
      title: '용의 꿈 - 김철수',
      template: '용 (Dragon)',
      author: '김철수',
      wish: '가족의 건강과 행복을 기원합니다.',
      createdAt: '2024-12-22 14:30',
      displayPeriod: '7일 (2024-12-29까지)',
      status: 'active',
    },
    {
      id: '2',
      title: '호랑이의 꿈 - 이영희',
      template: '호랑이 (Tiger)',
      author: '이영희',
      wish: '새로운 시작과 성공을 기원합니다.',
      createdAt: '2024-12-22 13:15',
      displayPeriod: '30일 (2025-01-21까지)',
      status: 'active',
    },
    {
      id: '3',
      title: '봉황의 꿈 - 박민수',
      template: '봉황 (Phoenix)',
      author: '박민수',
      wish: '사랑하는 사람과의 영원한 사랑을 기원합니다.',
      createdAt: '2024-12-21 16:45',
      displayPeriod: '1일 (만료됨)',
      status: 'expired',
    },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="콘텐츠 관리"
        description="생성된 콘텐츠 및 템플릿 관리"
        action={{
          label: '새 콘텐츠 생성',
          icon: 'fas fa-plus',
          onClick: () => console.log('Create new content'),
        }}
      />
      <div className="p-8 min-h-screen">
        {/* 필터 및 검색 */}
        <FilterSection>
          <FilterGroup label="템플릿:">
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="dragon">용</option>
              <option value="tiger">호랑이</option>
              <option value="phoenix">봉황</option>
              <option value="turtle">거북이</option>
            </select>
          </FilterGroup>
          <FilterGroup label="상태:">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="expired">만료</option>
              <option value="pending">대기중</option>
            </select>
          </FilterGroup>
          <FilterGroup label="날짜:">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </FilterGroup>
          <SearchGroup
            placeholder="작성자명 또는 ID 검색..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => console.log('Search:', searchQuery)}
          />
        </FilterSection>

        {/* 콘텐츠 목록 */}
        <div className="space-y-6">
          {contentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-6 shadow-sm grid grid-cols-[200px_1fr_auto] gap-6"
            >
              <div className="w-50 h-30 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <i className="fas fa-video text-4xl text-gray-400"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>템플릿:</strong> {item.template}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>작성자:</strong> {item.author}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>소원:</strong> {item.wish}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>생성일:</strong> {item.createdAt}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>노출 기간:</strong> {item.displayPeriod}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>상태:</strong>{' '}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.status === 'active' ? '활성' : '만료'}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[120px]">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm">
                  <i className="fas fa-eye mr-2"></i>미리보기
                </Button>
                <Button className="bg-gray-500 hover:bg-gray-600 text-white text-sm">
                  <i className="fas fa-download mr-2"></i>다운로드
                </Button>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm">
                  <i className="fas fa-edit mr-2"></i>수정
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white text-sm">
                  <i className="fas fa-trash mr-2"></i>삭제
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button className="bg-gray-500 hover:bg-gray-600 text-white text-sm" disabled>
            <i className="fas fa-chevron-left mr-2"></i>이전
          </Button>
          <div className="flex gap-1">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm">1</Button>
            <Button className="bg-gray-500 hover:bg-gray-600 text-white text-sm">2</Button>
            <Button className="bg-gray-500 hover:bg-gray-600 text-white text-sm">3</Button>
          </div>
          <Button className="bg-gray-500 hover:bg-gray-600 text-white text-sm">
            다음<i className="fas fa-chevron-right ml-2"></i>
          </Button>
        </div>
      </div>
    </>
  );
}

