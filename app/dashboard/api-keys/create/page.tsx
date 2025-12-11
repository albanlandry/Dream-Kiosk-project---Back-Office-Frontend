'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiKeysApi, CreateApiKeyRequest, ApiKeyPermission } from '@/lib/api/api-keys';
import { useAuthStore } from '@/lib/store/authStore';
import { EndpointTree } from '@/components/api-keys/EndpointTree';
import { ArrowLeft, Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';

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
  const [keyCopied, setKeyCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  // Sanitization functions
  const sanitizeString = (input: string): string => {
    return input
      .trim()
      .replace(/\0/g, '')
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '');
  };

  const sanitizeEmail = (email: string): string => {
    return sanitizeString(email).toLowerCase().trim();
  };

  // Validation functions
  const validateName = (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return '이름은 필수입니다.';
    }
    if (name.length < 1) {
      return '이름은 최소 1자 이상이어야 합니다.';
    }
    if (name.length > 255) {
      return '이름은 최대 255자까지 가능합니다.';
    }
    if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(name)) {
      return '이름은 영문, 숫자, 공백, 하이픈, 언더스코어, 점만 사용할 수 있습니다.';
    }
    return null;
  };

  const validateDescription = (description: string): string | null => {
    if (description && description.length > 1000) {
      return '설명은 최대 1000자까지 가능합니다.';
    }
    return null;
  };

  const validateOwner = (owner: string): string | null => {
    if (!owner || owner.trim().length === 0) {
      return '소유자 이메일은 필수입니다.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(owner)) {
      return '유효한 이메일 주소를 입력하세요.';
    }
    if (owner.length > 255) {
      return '이메일은 최대 255자까지 가능합니다.';
    }
    return null;
  };

  const validatePermissions = (paths: string[], methods: Record<string, string[]>): string | null => {
    if (paths.length === 0) {
      return '최소 하나의 API 경로를 선택해야 합니다.';
    }
    if (paths.length > 1000) {
      return '최대 1000개의 권한만 선택할 수 있습니다.';
    }
    
    for (const path of paths) {
      if (!path.startsWith('/api/v')) {
        return `경로는 /api/v로 시작해야 합니다: ${path}`;
      }
      if (path.length > 500) {
        return `경로가 너무 깁니다: ${path}`;
      }
      const pathMethods = methods[path] || [];
      if (pathMethods.length === 0) {
        return `경로에 최소 하나의 HTTP 메서드를 선택해야 합니다: ${path}`;
      }
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      for (const method of pathMethods) {
        if (!validMethods.includes(method.toUpperCase())) {
          return `유효하지 않은 HTTP 메서드: ${method}`;
        }
      }
    }
    return null;
  };

  const validateForm = (): boolean => {
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
      owner: true,
      permissions: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Sanitize form data
      const sanitizedFormData = {
        ...formData,
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

      const result = await apiKeysApi.create({
        ...sanitizedFormData,
        permissions,
      });
      setCreatedKey(result.key);
    } catch (error: any) {
      console.error('Failed to create API key:', error);
      
      // Handle validation errors from backend
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
        setErrors({ submit: 'API 키 생성에 실패했습니다. 다시 시도해주세요.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTreeSelectionChange = (paths: string[], methods: Record<string, string[]>) => {
    setSelectedPaths(paths);
    setSelectedMethods(methods);
    // Mark permissions as touched when user makes a selection
    setTouched((prev) => ({ ...prev, permissions: true }));
    // Validate immediately
    const error = validatePermissions(paths, methods);
    setErrors((prev) => ({ ...prev, permissions: error || '' }));
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, name: value });
                    if (touched.name) {
                      const error = validateName(value);
                      setErrors((prev) => ({ ...prev, name: error || '' }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, name: true }));
                    const error = validateName(formData.name);
                    setErrors((prev) => ({ ...prev, name: error || '' }));
                  }}
                  className={`mt-1 ${errors.name && touched.name ? 'border-red-500' : ''}`}
                  maxLength={255}
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <Input
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, description: value });
                    if (touched.description) {
                      const error = validateDescription(value);
                      setErrors((prev) => ({ ...prev, description: error || '' }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, description: true }));
                    const error = validateDescription(formData.description || '');
                    setErrors((prev) => ({ ...prev, description: error || '' }));
                  }}
                  className={`mt-1 ${errors.description && touched.description ? 'border-red-500' : ''}`}
                  maxLength={1000}
                />
                {errors.description && touched.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">소유자 *</label>
                <Input
                  required
                  type="email"
                  value={formData.owner}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, owner: value });
                    if (touched.owner) {
                      const error = validateOwner(value);
                      setErrors((prev) => ({ ...prev, owner: error || '' }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, owner: true }));
                    const error = validateOwner(formData.owner);
                    setErrors((prev) => ({ ...prev, owner: error || '' }));
                  }}
                  className={`mt-1 ${errors.owner && touched.owner ? 'border-red-500' : ''}`}
                  maxLength={255}
                />
                {errors.owner && touched.owner && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.owner}
                  </p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">권한 설정</h3>
              <p className="text-sm text-gray-600">
                아래 트리에서 접근을 허용할 API 엔드포인트를 선택하세요.
              </p>
              <div className={errors.permissions && touched.permissions ? 'border-2 border-red-500 rounded-lg p-2' : ''}>
                <EndpointTree
                  selectedPaths={selectedPaths}
                  selectedMethods={selectedMethods}
                  onSelectionChange={(paths, methods) => {
                    handleTreeSelectionChange(paths, methods);
                    if (touched.permissions) {
                      const error = validatePermissions(paths, methods);
                      setErrors((prev) => ({ ...prev, permissions: error || '' }));
                    }
                  }}
                />
              </div>
              {errors.permissions && touched.permissions && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.permissions}
                </p>
              )}
              
              {/* Selected Permissions Summary */}
              {selectedPaths.length > 0 && (
                <div className="mt-4 rounded border p-4 bg-gray-50">
                  <h4 className="mb-2 text-sm font-semibold">선택된 권한 ({selectedPaths.length}개)</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {selectedPaths.map((path) => (
                      <div key={path} className="text-sm">
                        <span className="font-mono text-gray-700">{path}</span>
                        {selectedMethods[path] && selectedMethods[path].length > 0 && (
                          <span className="ml-2 text-gray-500">
                            [{selectedMethods[path].join(', ')}]
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="rounded-lg border border-red-500 bg-red-50 p-4">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={loading || (Object.keys(errors).length > 0 && Object.values(errors).some(e => e !== ''))}
              >
                {loading ? '생성 중...' : '생성'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

