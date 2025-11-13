'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/app/dashboard/users/page';
import { cn } from '@/lib/utils/cn';

interface ViewUserModalProps {
  user: User;
  onClose: () => void;
}

export function ViewUserModal({ user, onClose }: ViewUserModalProps) {
  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'user':
        return '일반 사용자';
      case 'viewer':
        return '뷰어';
      default:
        return role;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'suspended':
        return '정지';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>사용자 정보</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
                <i className="fas fa-user"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-600">ID: {user.userId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  이메일
                </label>
                <p className="text-gray-800">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  권한
                </label>
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    getRoleClass(user.role)
                  )}
                >
                  {getRoleText(user.role)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  상태
                </label>
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                    getStatusClass(user.status)
                  )}
                >
                  {getStatusText(user.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  가입일
                </label>
                <p className="text-gray-800">{user.joinDate}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  마지막 로그인
                </label>
                <p className="text-gray-800">{user.lastLogin}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

