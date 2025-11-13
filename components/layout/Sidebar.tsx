'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/lib/store/authStore';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: 'fas fa-tachometer-alt' },
  { name: '콘텐츠 관리', href: '/dashboard/content', icon: 'fas fa-video' },
  { name: '프로포즈 관리', href: '/dashboard/propose', icon: 'fas fa-heart' },
  { name: '결제 관리', href: '/dashboard/payments', icon: 'fas fa-credit-card' },
  { name: '사용자 관리', href: '/dashboard/users', icon: 'fas fa-users' },
  { name: '키오스크 관리', href: '/dashboard/kiosks', icon: 'fas fa-desktop' },
  { name: '분석 & 리포트', href: '/dashboard/analytics', icon: 'fas fa-chart-bar' },
  { name: '프로젝트 관리', href: '/dashboard/projects', icon: 'fas fa-project-diagram' },
  { name: '스케줄 관리', href: '/dashboard/schedule', icon: 'fas fa-calendar-alt' },
  { name: '시스템 설정', href: '/dashboard/settings', icon: 'fas fa-cog' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, admin } = useAuthStore();

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-70 flex-col bg-gradient-to-b from-slate-700 to-slate-800 text-white z-50 shadow-lg">
        <div className="px-5 py-6 border-b border-white/10 text-center">
          <h2 className="text-2xl font-bold mb-2">
            <i className="fas fa-magic mr-2"></i>Dream Piece
          </h2>
          <p className="text-sm text-gray-300">관리자 시스템</p>
        </div>
        <ul className="flex-1 overflow-y-auto py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.name} className={cn(isActive && 'active')}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-5 py-4 text-gray-200 transition-all border-l-3 border-transparent',
                    isActive
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'hover:bg-white/10 hover:border-blue-500/50'
                  )}
                >
                  <i className={cn('w-5 text-center', item.icon)}></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <style jsx>{`
        nav {
          width: 280px;
        }
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </>
  );
}

