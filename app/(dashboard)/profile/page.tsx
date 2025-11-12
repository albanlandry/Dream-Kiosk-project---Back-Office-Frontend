'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';

export default function ProfilePage() {
  const { admin } = useAuthStore();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: authApi.getProfile,
    enabled: !!admin,
  });

  const displayAdmin = profile || admin;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!displayAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Failed to load profile
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-sm">{displayAdmin.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm">{displayAdmin.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Roles</p>
            <div className="mt-1 flex gap-2">
              {displayAdmin.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <Badge variant={displayAdmin.is_active ? 'success' : 'secondary'}>
              {displayAdmin.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {displayAdmin.last_login_at && (
            <div>
              <p className="text-sm font-medium text-gray-500">Last Login</p>
              <p className="text-sm">{formatDate(displayAdmin.last_login_at)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

