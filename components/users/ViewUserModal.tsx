'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/app/dashboard/users/page';
import { cn } from '@/lib/utils/cn';
import { LabelValuePair } from '@/components/ui/label-value-pair';
import { maskUserId } from '@/lib/utils/format';

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

  // Format last login date to match image format: "2024. 12. 22. 오후 02:30"
  const formatLastLogin = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      // Handle both Date objects and string formats
      const date = typeof dateString === 'string' 
        ? new Date(dateString.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:00'))
        : new Date(dateString);
      
      if (isNaN(date.getTime())) {
        // Try parsing as simple date string
        const parts = dateString.split(' ');
        if (parts.length >= 2) {
          const datePart = parts[0];
          const timePart = parts[1] || '00:00';
          const [year, month, day] = datePart.split('-');
          const [hours, minutes] = timePart.split(':');
          const yearNum = parseInt(year);
          const monthNum = parseInt(month);
          const dayNum = parseInt(day);
          const hoursNum = parseInt(hours);
          const minutesNum = parseInt(minutes);
          
          const ampm = hoursNum >= 12 ? '오후' : '오전';
          const displayHours = hoursNum > 12 ? hoursNum - 12 : (hoursNum === 0 ? 12 : hoursNum);
          
          return `${yearNum}. ${String(monthNum).padStart(2, '0')}. ${String(dayNum).padStart(2, '0')}. ${ampm} ${String(displayHours).padStart(2, '0')}:${String(minutesNum).padStart(2, '0')}`;
        }
        return dateString;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? '오후' : '오전';
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
      
      return `${year}. ${month}. ${day}. ${ampm} ${String(displayHours).padStart(2, '0')}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  // Get user permissions based on role (mock for now)
  const getUserPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return ['읽기', '쓰기', '삭제', '관리'];
      case 'user':
        return ['읽기', '쓰기'];
      case 'viewer':
        return ['읽기'];
      default:
        return ['읽기'];
    }
  };

  const permissions = getUserPermissions(user.role);
  const phone = user.phone || '010-1234-5678';
  const department = user.department || '개발팀';
  const memo = user.memo || '일반 사용자 계정';

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">사용자 상세보기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* User Profile Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <i className="fas fa-user text-4xl text-gray-400"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{user.email}</span>
                  <span>ID: {maskUserId(user.userId)}</span>
                </div>
              </div>
            </div>

            {/* Information Panels - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Top Left: Basic Information */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">기본 정보</h4>
                <div className="space-y-3">
                  <LabelValuePair
                    label="이름:"
                    value={user.name}
                    showBorder={true}
                  />
                  <LabelValuePair
                    label="이메일:"
                    value={user.email}
                    showBorder={true}
                  />
                  <LabelValuePair
                    label="전화번호:"
                    value={phone}
                    showBorder={true}
                  />
                  <LabelValuePair
                    label="부서:"
                    value={department}
                    showBorder={false}
                  />
                </div>
              </div>

              {/* Top Right: Account Information */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">계정 정보</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-sm font-bold text-black min-w-24">권한:</span>
                    <span
                      className={cn(
                        'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                        getRoleClass(user.role)
                      )}
                    >
                      {getRoleText(user.role)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-sm font-bold text-black min-w-24">상태:</span>
                    <span
                      className={cn(
                        'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                        getStatusClass(user.status)
                      )}
                    >
                      {getStatusText(user.status)}
                    </span>
                  </div>
                  <LabelValuePair
                    label="가입일:"
                    value={user.joinDate}
                    showBorder={true}
                  />
                  <LabelValuePair
                    label="마지막 로그인:"
                    value={formatLastLogin(user.lastLogin)}
                    showBorder={false}
                  />
                </div>
              </div>

              {/* Bottom Left: Permissions */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">권한</h4>
                <div className="flex flex-wrap gap-2">
                  {permissions.map((perm, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Right: Memo */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">메모</h4>
                <p className="text-sm text-gray-600">{memo}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200">
            <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

