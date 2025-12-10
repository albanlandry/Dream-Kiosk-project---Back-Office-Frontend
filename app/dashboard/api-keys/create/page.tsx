'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiKeysApi, CreateApiKeyRequest, ApiKeyPermission } from '@/lib/api/api-keys';
import { useAuthStore } from '@/lib/store/authStore';
import { ArrowLeft, Plus, Trash2, Copy, Check } from 'lucide-react';

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
  const [newPermission, setNewPermission] = useState<Partial<ApiKeyPermission>>({
    path: '',
    matchType: 'exact',
    httpMethods: ['GET'],
    includeSubpaths: false,
    allow: true,
  });
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await apiKeysApi.create(formData);
      setCreatedKey(result.key);
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const addPermission = () => {
    if (!newPermission.path) return;
    setFormData({
      ...formData,
      permissions: [
        ...(formData.permissions || []),
        {
          path: newPermission.path!,
          matchType: newPermission.matchType || 'exact',
          httpMethods: newPermission.httpMethods || ['GET'],
          includeSubpaths: newPermission.includeSubpaths || false,
          allow: newPermission.allow !== false,
        },
      ],
    });
    setNewPermission({
      path: '',
      matchType: 'exact',
      httpMethods: ['GET'],
      includeSubpaths: false,
      allow: true,
    });
  };

  const removePermission = (index: number) => {
    setFormData({
      ...formData,
      permissions: formData.permissions?.filter((_, i) => i !== index) || [],
    });
  };

  const copyToClipboard = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  if (!isSuperadmin) {
    router.push('/dashboard');
    return null;
  }

  if (createdKey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          title="API 키 생성 완료"
          description="새로운 API 키가 생성되었습니다. 이 키를 안전하게 저장하세요."
        />
        <div className="p-6">
          <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">API 키</label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={createdKey}
                  readOnly
                  className="font-mono"
                />
                <Button onClick={copyToClipboard}>
                  {keyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-2 text-sm text-red-600">
                ⚠️ 이 키는 한 번만 표시됩니다. 안전하게 저장하세요.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/dashboard/api-keys')}>
                목록으로
              </Button>
              <Button variant="outline" onClick={() => setCreatedKey(null)}>
                다른 키 생성
              </Button>
            </div>
          </div>
        </div>
      </div>
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
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="space-y-6 rounded-lg bg-white p-6 shadow">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">기본 정보</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">이름 *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">소유자 *</label>
                <Input
                  required
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">권한 설정</h3>
              <div className="space-y-2 rounded border p-4">
                <div className="grid grid-cols-12 gap-2">
                  <Input
                    placeholder="경로 (예: /api/v1/users)"
                    value={newPermission.path}
                    onChange={(e) => setNewPermission({ ...newPermission, path: e.target.value })}
                    className="col-span-4"
                  />
                  <select
                    value={newPermission.matchType}
                    onChange={(e) =>
                      setNewPermission({
                        ...newPermission,
                        matchType: e.target.value as any,
                      })
                    }
                    className="col-span-2 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="exact">정확히</option>
                    <option value="prefix">접두사</option>
                    <option value="wildcard">와일드카드</option>
                    <option value="regex">정규식</option>
                  </select>
                  <Input
                    placeholder="HTTP 메서드 (예: GET,POST)"
                    value={newPermission.httpMethods?.join(',')}
                    onChange={(e) =>
                      setNewPermission({
                        ...newPermission,
                        httpMethods: e.target.value.split(',').map((m) => m.trim().toUpperCase()),
                      })
                    }
                    className="col-span-3"
                  />
                  <label className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={newPermission.includeSubpaths}
                      onChange={(e) =>
                        setNewPermission({
                          ...newPermission,
                          includeSubpaths: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    하위 경로 포함
                  </label>
                  <Button type="button" onClick={addPermission} className="col-span-1">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Permission List */}
              {formData.permissions && formData.permissions.length > 0 && (
                <div className="space-y-2">
                  {formData.permissions.map((perm, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded border p-3"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{perm.path}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({perm.matchType}) - {perm.httpMethods.join(', ')}
                        </span>
                        {perm.includeSubpaths && (
                          <span className="ml-2 text-xs text-blue-600">하위 경로 포함</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePermission(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '생성 중...' : '생성'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

