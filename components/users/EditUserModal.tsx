'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/app/dashboard/users/page';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: User = {
      ...user,
      ...formData,
    };

    // TODO: API call to update user
    onSuccess(updatedUser);
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
            <DialogTitle>사용자 수정</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                required
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
                상태 *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'inactive' | 'suspended',
                  })
                }
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지</option>
              </select>
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
                저장
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

