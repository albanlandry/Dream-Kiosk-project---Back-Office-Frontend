'use client';

import { User } from '@/app/dashboard/users/page';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { maskUserId } from '@/lib/utils/format';

interface UserTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onActivate: (user: User) => void;
  onSuspend: (user: User) => void;
}

export function UserTable({
  users,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onSuspend,
}: UserTableProps) {
  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

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

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                사용자
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                이메일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                권한
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                상태
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                가입일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                마지막 로그인
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => onSelectUser(user.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">ID: {maskUserId(user.userId)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      getRoleClass(user.role)
                    )}
                  >
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      getStatusClass(user.status)
                    )}
                  >
                    {getStatusText(user.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{user.joinDate}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{user.lastLogin}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onView(user)}
                      className="bg-blue-500 hover:bg-blue-600 w-12 text-white p-2"
                      size="sm"
                    >
                      <i className="fas fa-eye"></i>
                    </Button>
                    <Button
                      onClick={() => onEdit(user)}
                      className="bg-yellow-500 hover:bg-yellow-600 w-12 text-white p-2"
                      size="sm"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    {user.status === 'active' ? (
                      <Button
                        onClick={() => onSuspend(user)}
                        className="bg-red-500 hover:bg-red-600 w-12 text-white p-2"
                        size="sm"
                      >
                        <i className="fas fa-ban"></i>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onActivate(user)}
                        className="bg-green-500 hover:bg-green-600 w-12 text-white p-2"
                        size="sm"
                      >
                        <i className="fas fa-check"></i>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

