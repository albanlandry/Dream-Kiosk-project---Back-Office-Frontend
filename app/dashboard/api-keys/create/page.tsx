'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { apiKeysApi, CreateApiKeyRequest, ApiKeyPermission } from '@/lib/api/api-keys';
import { useAuthStore } from '@/lib/store/authStore';
import { CreateApiKeyForm } from '@/components/api-keys/CreateApiKeyForm';
import { ApiKeySuccessView } from '@/components/api-keys/ApiKeySuccessView';

export default function CreateApiKeyPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    name: '',
    description: '',
    owner: admin?.email || '',
    permissions: [],
    ipWhitelist: [],
    tags: [],
  });
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<Record<string, string[]>>({});
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) {
      router.push('/dashboard');
    }
  }, [isSuperadmin, router]);

  const handleSubmit = async (
    sanitizedFormData: CreateApiKeyRequest,
    permissions: Omit<ApiKeyPermission, 'id'>[],
  ) => {
    setLoading(true);
    try {
      const result = await apiKeysApi.create({
        ...sanitizedFormData,
        permissions,
      });
      setCreatedKey(result.key);
    } catch (error: any) {
      console.error('Failed to create API key:', error);
      throw error; // Re-throw to let form handle it
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionsChange = (paths: string[], methods: Record<string, string[]>) => {
    setSelectedPaths(paths);
    setSelectedMethods(methods);
  };

  if (!isSuperadmin) {
    return null;
  }

  if (createdKey) {
    return (
      <ApiKeySuccessView
        apiKey={createdKey}
        onBackToList={() => router.push('/dashboard/api-keys')}
        onCreateAnother={() => {
          setCreatedKey(null);
          setFormData({
            name: '',
            description: '',
            owner: admin?.email || '',
            permissions: [],
            ipWhitelist: [],
            tags: [],
          });
          setSelectedPaths([]);
          setSelectedMethods({});
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="새 API 키 생성"
        description="새로운 API 키를 생성하고 권한을 설정합니다."
        action={
          <Button variant="outline" onClick={() => router.push('/dashboard/api-keys')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        }
      />

      <div className="p-6">
        <CreateApiKeyForm
          formData={formData}
          onFormDataChange={setFormData}
          selectedPaths={selectedPaths}
          selectedMethods={selectedMethods}
          onPermissionsChange={handlePermissionsChange}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

