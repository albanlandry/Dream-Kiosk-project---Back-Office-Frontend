'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/app/dashboard/users/page';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AddUserModal({ onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    role: 'user' as 'admin' | 'user' | 'viewer',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      userId: formData.userId || `user${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
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
        <DialogContent className="w-sm max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>새 사용자 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                사용자 ID
              </label>
              <Input
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="자동 생성 (선택사항)"
                className="w-full"
              />
            </div>

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
                <option value="user">일반 사용자</option>
                <option value="admin">관리자</option>
                <option value="viewer">뷰어</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                비밀번호 *
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="비밀번호"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                비밀번호 확인 *
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="비밀번호 확인"
                required
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                추가
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

