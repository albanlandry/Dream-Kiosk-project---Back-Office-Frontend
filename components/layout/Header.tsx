'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
  } | React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  const router = useRouter();
  const { logout, admin } = useAuthStore();

  const handleProfileClick = () => {
    router.push('/dashboard/profile');
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {action && (
              typeof action === 'object' && 'onClick' in action ? (
                <Button
                  onClick={action.onClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {action.icon && <i className={cn('mr-2', action.icon)}></i>}
                  {action.label}
                </Button>
              ) : (
                action
              )
            )}
            <DropdownMenu
              trigger={
                <div className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-gray-800 transition-colors">
                  <span>{admin?.name || '관리자'}</span>
                  <i className="fas fa-user-circle text-2xl text-blue-500"></i>
                </div>
              }
              align="right"
            >
              <DropdownMenuItem
                onClick={handleProfileClick}
                icon="fas fa-user"
              >
                프로필
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                icon="fas fa-sign-out-alt"
                className="text-red-600 hover:bg-red-50"
              >
                로그아웃
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}

