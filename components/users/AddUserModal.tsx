'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/app/dashboard/users/page';
import { generateSecurePassword } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'user' as 'admin' | 'user' | 'viewer',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    password: '',
    memo: '',
    permissions: {
      read: true,
      write: false,
      admin: false,
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    setFormData({ ...formData, password: newPassword });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newUser: User = {
      id: Date.now().toString(),
      userId: `user${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      memo: formData.memo,
      role: formData.role,
      status: formData.status,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: '-',
    };

    // TODO: API call to create user
    onSuccess(newUser);
  };

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
            <h2 className="text-xl font-semibold text-gray-800">새 사용자 추가</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-6">
              {/* Two-column layout for most fields */}
              <div className="grid grid-cols-2 gap-6">
                {/* 이름 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    이름 *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="사용자 이름"
                    required
                    className="w-full"
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    이메일 *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                    className="w-full"
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    전화번호
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full"
                  />
                </div>

                {/* 부서 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    부서
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="부서명"
                    className="w-full"
                  />
                </div>

                {/* 권한 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    권한 *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'admin' | 'user' | 'viewer',
                      })
                    }
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">권한 선택</option>
                    <option value="user">일반 사용자</option>
                    <option value="admin">관리자</option>
                    <option value="viewer">뷰어</option>
                  </select>
                </div>

                {/* 상태 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'inactive' | 'suspended',
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="suspended">정지</option>
                  </select>
                </div>
              </div>

              {/* 임시 비밀번호 - Full width */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  임시 비밀번호 *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="임시 비밀번호"
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={cn('fas', showPassword ? 'fa-eye-slash' : 'fa-eye')}></i>
                    </button>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4"
                  >
                    <i className="fas fa-sync-alt mr-2"></i>
                    생성
                  </Button>
                </div>
              </div>

              {/* 메모 - Full width */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  메모
                </label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="사용자에 대한 메모"
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>

              {/* 권한 설정 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  권한 설정
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.read}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, read: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">읽기 권한</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.write}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, write: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">쓰기 권한</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.admin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, admin: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">관리자 권한</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                저장
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

