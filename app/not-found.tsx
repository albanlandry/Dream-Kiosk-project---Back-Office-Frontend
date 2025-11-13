'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-6">
              <i className="fas fa-tools text-white text-5xl"></i>
            </div>
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-gray-700 mb-4">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              죄송합니다. 요청하신 페이지는 현재
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold mb-6">
              <i className="fas fa-hammer"></i>
              <span>공사 중</span>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              곧 만나보실 수 있습니다. 조금만 기다려주세요!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg">
                <i className="fas fa-home mr-2"></i>
                대시보드로 돌아가기
              </Button>
            </Link>
            <Button
              onClick={() => window.history.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 text-lg"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              이전 페이지로
            </Button>
          </div>

          <div className="mt-12 p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              <i className="fas fa-info-circle text-blue-500 mr-2"></i>
              도움이 필요하신가요?
            </h3>
            <p className="text-gray-600 mb-4">
              다른 페이지를 찾고 계신가요? 아래 링크를 확인해보세요.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-tachometer-alt text-purple-500"></i>
                <span className="text-gray-700">대시보드</span>
              </Link>
              <Link
                href="/dashboard/users"
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-users text-blue-500"></i>
                <span className="text-gray-700">사용자 관리</span>
              </Link>
              <Link
                href="/dashboard/projects"
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-project-diagram text-green-500"></i>
                <span className="text-gray-700">프로젝트 관리</span>
              </Link>
              <Link
                href="/dashboard/kiosks"
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-desktop text-orange-500"></i>
                <span className="text-gray-700">키오스크 관리</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              <i className="fas fa-clock mr-2"></i>
              페이지가 곧 준비될 예정입니다
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

