'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToastStore } from '@/lib/store/toastStore';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export default function ProfilePage() {
  const router = useRouter();
  const { admin, setAdmin } = useAuthStore();
  const { showSuccess, showError } = useToastStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: authApi.getProfile,
    enabled: !!admin,
    onSuccess: (data) => {
      setFormData({
        name: data.name,
        email: data.email,
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedProfile) => {
      showSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
      setAdmin(updatedProfile);
      queryClient.setQueryData(['admin-profile'], updatedProfile);
    },
    onError: (error: any) => {
      showError(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    },
  });

  const handleEdit = () => {
    // Auto-fill form with current profile data when entering edit mode
    const currentProfile = profile || admin;
    if (currentProfile) {
      setFormData({
        name: currentProfile.name || '',
        email: currentProfile.email || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const displayAdmin = profile || admin;

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <h1 className="text-3xl font-bold">프로필</h1>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!displayAdmin) {
    return (
      <div className="space-y-6 p-8">
        <h1 className="text-3xl font-bold">프로필</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          프로필을 불러오는데 실패했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">프로필</h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <i className="fas fa-edit mr-2"></i>
                수정
              </Button>
              <Button
                onClick={() => router.push('/dashboard/profile/password')}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                <i className="fas fa-key mr-2"></i>
                비밀번호 변경
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateProfileMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {updateProfileMutation.isPending ? '저장 중...' : '저장'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계정 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
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
            </form>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">이름</p>
                <p className="text-sm font-semibold text-gray-800">{displayAdmin.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">이메일</p>
                <p className="text-sm font-semibold text-gray-800">{displayAdmin.email}</p>
              </div>
            </>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">권한</p>
            <div className="mt-1 flex gap-2">
              {displayAdmin.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">상태</p>
            <Badge
              className={cn(
                'mt-1',
                displayAdmin.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              )}
            >
              {displayAdmin.is_active ? '활성' : '비활성'}
            </Badge>
          </div>
          {displayAdmin.last_login_at && (
            <div>
              <p className="text-sm font-medium text-gray-500">마지막 로그인</p>
              <p className="text-sm text-gray-800">{formatDate(displayAdmin.last_login_at)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

