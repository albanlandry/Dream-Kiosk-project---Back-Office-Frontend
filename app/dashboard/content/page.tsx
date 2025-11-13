'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

export default function ContentManagementPage() {
  const [stats, setStats] = useState({
    totalImages: 0,
    totalVideos: 0,
    totalResources: 0,
    activeImages: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [imagesRes, videosRes, resourcesRes] = await Promise.all([
        apiClient.get('/images?active_only=false').catch(() => ({ data: { data: { images: [] } } })),
        apiClient.get('/videos').catch(() => ({ data: { data: [] } })),
        apiClient.get('/resources').catch(() => ({ data: { data: [] } })),
      ]);

      // HATEOAS 응답 구조 처리
      const imagesData = imagesRes.data?.data || imagesRes.data;
      const images = imagesData?.images || imagesData || [];
      
      const videosData = videosRes.data?.data || videosRes.data;
      const videos = Array.isArray(videosData) ? videosData : [];
      
      const resourcesData = resourcesRes.data?.data || resourcesRes.data;
      const resources = Array.isArray(resourcesData) ? resourcesData : [];

      setStats({
        totalImages: images.length,
        activeImages: images.filter((img: any) => 
          (img.is_active !== undefined ? img.is_active : img.isActive !== undefined ? img.isActive : true)
        ).length,
        totalVideos: videos.length,
        totalResources: resources.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="콘텐츠 관리"
        description="이미지, 비디오, 리소스 관리"
      />
      <div className="p-8 min-h-screen">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/content/images">
            <StatCard
              icon={<i className="fas fa-image"></i>}
              value={stats.totalImages}
              label="총 이미지"
              change={{ value: `${stats.activeImages} 활성`, type: 'neutral' }}
              iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
              className="cursor-pointer hover:shadow-lg transition-shadow"
            />
          </Link>
          <Link href="/dashboard/content/videos">
            <StatCard
              icon={<i className="fas fa-video"></i>}
              value={stats.totalVideos}
              label="총 비디오"
              iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
              className="cursor-pointer hover:shadow-lg transition-shadow"
            />
          </Link>
          <Link href="/dashboard/content/resources">
            <StatCard
              icon={<i className="fas fa-folder"></i>}
              value={stats.totalResources}
              label="리소스 팩"
              iconBg="bg-gradient-to-br from-green-400 to-teal-500"
              className="cursor-pointer hover:shadow-lg transition-shadow"
            />
          </Link>
          <StatCard
            icon={<i className="fas fa-check-circle"></i>}
            value={stats.activeImages}
            label="활성 이미지"
            iconBg="bg-gradient-to-br from-pink-500 to-red-500"
          />
        </div>

        {/* 빠른 링크 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/content/images">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-image"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">이미지 관리</h3>
                  <p className="text-sm text-gray-600">이미지 업로드 및 관리</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/content/videos">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-video"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">비디오 관리</h3>
                  <p className="text-sm text-gray-600">비디오 목록 및 관리</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/content/resources">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-folder"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">리소스 관리</h3>
                  <p className="text-sm text-gray-600">리소스 팩 생성 및 관리</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

