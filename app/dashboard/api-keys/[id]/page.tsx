'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiKeysApi, ApiKey, UpdateApiKeyRequest, ApiKeyPermission } from '@/lib/api/api-keys';
import { useAuthStore } from '@/lib/store/authStore';
import { BasicInfoSection } from '@/components/api-keys/BasicInfoSection';
import { PermissionsSection } from '@/components/api-keys/PermissionsSection';
import { ArrowLeft, Save, Trash2, Ban, RotateCcw, Copy, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { CreateApiKeyRequest } from '@/lib/api/api-keys';

export default function ApiKeyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { admin } = useAuthStore();
  const id = params?.id as string;

  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    name: '',
    description: '',
    owner: '',
    permissions: [],
    ipWhitelist: [],
    tags: [],
  });
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showKeyHash, setShowKeyHash] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) {
      router.push('/dashboard');
      return;
    }
    if (id) {
      loadApiKey();
    }
  }, [id, isSuperadmin]);

  const loadApiKey = async () => {
    try {
      setLoading(true);
      const key = await apiKeysApi.get(id);
      setApiKey(key);

      // Populate form data
      setFormData({
        name: key.name,
        description: key.description || '',
        owner: key.owner,
        permissions: key.permissions || [],
        ipWhitelist: key.ipWhitelist || [],
        tags: key.tags || [],
        rateLimit: key.rateLimit,
        expiresAt: key.expiresAt,
      });

      // Populate selected paths and methods from permissions
      const paths: string[] = [];
      const methods: Record<string, string[]> = {};
      if (key.permissions) {
        key.permissions.forEach((perm) => {
          paths.push(perm.path);
          methods[perm.path] = perm.httpMethods;
        });
      }
      setSelectedPaths(paths);
      setSelectedMethods(methods);
    } catch (error) {
      console.error('Failed to load API key:', error);
      alert('API 키를 불러올 수 없습니다.');
      router.push('/dashboard/api-keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey) return;

    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
      owner: true,
      permissions: true,
    });

    // Validate
    const { validateName, validateDescription, validateOwner, validatePermissions } = await import('@/lib/utils/validation');
    const newErrors: Record<string, string> = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const descriptionError = validateDescription(formData.description || '');
    if (descriptionError) newErrors.description = descriptionError;

    const ownerError = validateOwner(formData.owner);
    if (ownerError) newErrors.owner = ownerError;

    const permissionsError = validatePermissions(selectedPaths, selectedMethods);
    if (permissionsError) newErrors.permissions = permissionsError;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      // Sanitize form data
      const { sanitizeString, sanitizeEmail } = await import('@/lib/utils/sanitization');
      const sanitizedFormData = {
        name: sanitizeString(formData.name),
        description: formData.description ? sanitizeString(formData.description) : undefined,
        owner: sanitizeEmail(formData.owner),
      };

      // Convert selected paths and methods to permissions
      const permissions: Omit<ApiKeyPermission, 'id'>[] = selectedPaths.map((path) => ({
        path: sanitizeString(path),
        matchType: 'exact' as const,
        httpMethods: (selectedMethods[path] || []).map((m) => m.toUpperCase()),
        includeSubpaths: false,
        allow: true,
      }));

      const updateData: UpdateApiKeyRequest = {
        ...sanitizedFormData,
        permissions,
        ipWhitelist: formData.ipWhitelist,
        tags: formData.tags,
        rateLimit: formData.rateLimit,
        expiresAt: formData.expiresAt,
      };

      await apiKeysApi.update(id, updateData);
      alert('API 키가 성공적으로 업데이트되었습니다.');
      loadApiKey(); // Reload to get updated data
    } catch (error: any) {
      console.error('Failed to update API key:', error);
      if (error.response?.data?.message) {
        const backendError = error.response.data.message;
        if (Array.isArray(backendError)) {
          const newErrors: Record<string, string> = {};
          backendError.forEach((err: any) => {
            if (err.property) {
              newErrors[err.property] = Object.values(err.constraints || {}).join(', ');
            }
          });
          setErrors(newErrors);
        } else {
          setErrors({ submit: backendError });
        }
      } else {
        setErrors({ submit: 'API 키 업데이트에 실패했습니다. 다시 시도해주세요.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!apiKey) return;
    const reason = prompt('취소 사유를 입력하세요:');
    if (!reason) return;

    try {
      setActionLoading('revoke');
      await apiKeysApi.revoke(id, reason);
      alert('API 키가 취소되었습니다.');
      loadApiKey();
    } catch (error: any) {
      alert(error.response?.data?.message || 'API 키 취소에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlacklist = async () => {
    if (!apiKey) return;
    const reason = prompt('블랙리스트 사유를 입력하세요:');
    if (!reason) return;

    try {
      setActionLoading('blacklist');
      await apiKeysApi.blacklist(id, reason);
      alert('API 키가 블랙리스트에 추가되었습니다.');
      loadApiKey();
    } catch (error: any) {
      alert(error.response?.data?.message || '블랙리스트 추가에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!apiKey) return;
    if (!confirm(`정말로 "${apiKey.name}" API 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setActionLoading('delete');
      await apiKeysApi.delete(id);
      alert('API 키가 삭제되었습니다.');
      router.push('/dashboard/api-keys');
    } catch (error: any) {
      alert(error.response?.data?.message || 'API 키 삭제에 실패했습니다.');
      setActionLoading(null);
    }
  };

  const handleRotate = async () => {
    if (!apiKey) return;
    if (!confirm('이 API 키를 회전하시겠습니까? 새 키가 생성되고 기존 키는 유예 기간 동안 유효합니다.')) {
      return;
    }

    try {
      setActionLoading('rotate');
      const result = await apiKeysApi.rotate(id, '24h', true);
      if (result.key) {
        const message = `새 API 키가 생성되었습니다.\n\n새 키: ${result.key}\n\n⚠️ 이 키를 안전하게 저장하세요. 다시 표시되지 않습니다.\n\n유예 기간 종료: ${new Date(result.gracePeriodEndsAt).toLocaleString('ko-KR')}`;
        alert(message);
      } else {
        alert('API 키가 회전되었습니다. 새 키 정보를 확인하세요.');
      }
      router.push('/dashboard/api-keys');
    } catch (error: any) {
      alert(error.response?.data?.message || 'API 키 회전에 실패했습니다.');
      setActionLoading(null);
    }
  };

  const handlePermissionsChange = (paths: string[], methods: Record<string, string[]>) => {
    setSelectedPaths(paths);
    setSelectedMethods(methods);
    setTouched((prev) => ({ ...prev, permissions: true }));
  };

  if (!isSuperadmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          title="API 키 상세"
          description="API 키 정보를 불러오는 중..."
        />
        <div className="p-6">
          <div className="text-center text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          title="API 키를 찾을 수 없습니다"
          description="요청하신 API 키를 찾을 수 없습니다."
        />
        <div className="p-6">
          <Button onClick={() => router.push('/dashboard/api-keys')}>목록으로</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'blacklisted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="API 키 상세"
        description={apiKey.name}
        action={
          <Button variant="outline" onClick={() => router.push('/dashboard/api-keys')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
        }
      />

      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Status and Actions */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(apiKey.status)}`}>
                  {apiKey.status === 'active' && '활성'}
                  {apiKey.status === 'revoked' && '취소됨'}
                  {apiKey.status === 'expired' && '만료됨'}
                  {apiKey.status === 'blacklisted' && '블랙리스트'}
                </span>
                <span className="text-sm text-gray-500">
                  생성일: {new Date(apiKey.createdAt).toLocaleString('ko-KR')}
                </span>
                {apiKey.lastUsedAt && (
                  <span className="text-sm text-gray-500">
                    마지막 사용: {new Date(apiKey.lastUsedAt).toLocaleString('ko-KR')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {apiKey.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRevoke}
                      disabled={actionLoading !== null}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      취소
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBlacklist}
                      disabled={actionLoading !== null}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      블랙리스트
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotate}
                      disabled={actionLoading !== null}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      회전
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={actionLoading !== null}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </div>
            </div>
          </div>

          {/* Key Hash (for reference, not the actual key) */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">키 해시</h3>
            <div className="flex items-center gap-2">
              <Input
                value={showKeyHash ? `hash_${apiKey.id.substring(0, 8)}...` : '••••••••••••••••'}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyHash(!showKeyHash)}
              >
                {showKeyHash ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              실제 API 키는 보안상 표시되지 않습니다. 키를 잊어버린 경우 새 키를 생성하세요.
            </p>
          </div>

          {/* Edit Form */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">정보 수정</h3>
              <Button onClick={handleSave} disabled={saving || actionLoading !== null}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>

            <div className="space-y-6">
              <BasicInfoSection
                formData={formData}
                onFormDataChange={setFormData}
                errors={errors}
                touched={touched}
                onFieldTouched={(field) => {
                  setTouched((prev) => ({ ...prev, [field]: true }));
                }}
                onFieldError={(field, error) => {
                  setErrors((prev) => ({ ...prev, [field]: error || '' }));
                }}
              />

              <PermissionsSection
                selectedPaths={selectedPaths}
                selectedMethods={selectedMethods}
                onPermissionsChange={handlePermissionsChange}
                error={errors.permissions}
                touched={touched.permissions}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-4 rounded-lg border border-red-500 bg-red-50 p-4">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">추가 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 font-mono text-gray-900">{apiKey.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">버전:</span>
                <span className="ml-2 text-gray-900">{apiKey.version}</span>
              </div>
              {apiKey.parentKeyId && (
                <div>
                  <span className="font-medium text-gray-700">부모 키:</span>
                  <span className="ml-2 font-mono text-gray-900">{apiKey.parentKeyId}</span>
                </div>
              )}
              {apiKey.expiresAt && (
                <div>
                  <span className="font-medium text-gray-700">만료일:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(apiKey.expiresAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              )}
              {apiKey.tags && apiKey.tags.length > 0 && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">태그:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {apiKey.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

