'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToastStore } from '@/lib/store/toastStore';
import { cn } from '@/lib/utils/cn';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToastStore();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      showSuccess('비밀번호가 성공적으로 변경되었습니다.');
      router.push('/dashboard/profile');
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      showError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.newPassword.length < 8) {
      showError('새 비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      showError('새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">비밀번호 변경</h1>
          <Button
            onClick={() => router.push('/dashboard/profile')}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            돌아가기
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  현재 비밀번호 *
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    required
                    className="w-full pr-10"
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={cn('fas', showCurrentPassword ? 'fa-eye-slash' : 'fa-eye')}></i>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  새 비밀번호 *
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    minLength={8}
                    className="w-full pr-10"
                    placeholder="최소 8자 이상의 새 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={cn('fas', showNewPassword ? 'fa-eye-slash' : 'fa-eye')}></i>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  비밀번호는 최소 8자 이상이어야 합니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  새 비밀번호 확인 *
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    required
                    minLength={8}
                    className="w-full pr-10"
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i
                      className={cn('fas', showConfirmPassword ? 'fa-eye-slash' : 'fa-eye')}
                    ></i>
                  </button>
                </div>
                {formData.newPassword &&
                  formData.confirmPassword &&
                  formData.newPassword !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/profile')}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

