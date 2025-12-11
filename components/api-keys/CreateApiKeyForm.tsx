'use client';

import { useState } from 'react';
import { BasicInfoSection } from './BasicInfoSection';
import { PermissionsSection } from './PermissionsSection';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { validateName, validateDescription, validateOwner, validatePermissions } from '@/lib/utils/validation';
import { sanitizeString, sanitizeEmail } from '@/lib/utils/sanitization';
import { CreateApiKeyRequest, ApiKeyPermission } from '@/lib/api/api-keys';

interface CreateApiKeyFormProps {
  formData: CreateApiKeyRequest;
  onFormDataChange: (data: CreateApiKeyRequest) => void;
  selectedPaths: string[];
  selectedMethods: Record<string, string[]>;
  onPermissionsChange: (paths: string[], methods: Record<string, string[]>) => void;
  onSubmit: (data: CreateApiKeyRequest, permissions: Omit<ApiKeyPermission, 'id'>[]) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

export function CreateApiKeyForm({
  formData,
  onFormDataChange,
  selectedPaths,
  selectedMethods,
  onPermissionsChange,
  onSubmit,
  loading,
  onCancel,
}: CreateApiKeyFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

    try {
      await onSubmit(sanitizedFormData, permissions);
    } catch (error: any) {
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
      <div className="space-y-6 rounded-lg bg-white p-6 shadow">
        <BasicInfoSection
          formData={formData}
          onFormDataChange={onFormDataChange}
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
          onPermissionsChange={(paths, methods) => {
            onPermissionsChange(paths, methods);
            setTouched((prev) => ({ ...prev, permissions: true }));
            const error = validatePermissions(paths, methods);
            setErrors((prev) => ({ ...prev, permissions: error || '' }));
          }}
          error={errors.permissions}
          touched={touched.permissions}
        />

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
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button
            type="submit"
            disabled={loading || (Object.keys(errors).length > 0 && Object.values(errors).some((e) => e !== ''))}
          >
            {loading ? '생성 중...' : '생성'}
          </Button>
        </div>
      </div>
    </form>
  );
}

