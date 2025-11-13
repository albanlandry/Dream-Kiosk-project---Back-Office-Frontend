'use client';

import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col ml-0 lg:ml-[280px]">
        <MobileSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

