'use client';

import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { validateName, validateDescription, validateOwner } from '@/lib/utils/validation';
import { CreateApiKeyRequest } from '@/lib/api/api-keys';

interface BasicInfoSectionProps {
  formData: CreateApiKeyRequest;
  onFormDataChange: (data: CreateApiKeyRequest) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onFieldTouched: (field: string) => void;
  onFieldError: (field: string, error: string | null) => void;
}

export function BasicInfoSection({
  formData,
  onFormDataChange,
  errors,
  touched,
  onFieldTouched,
  onFieldError,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">기본 정보</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">이름 *</label>
        <Input
          required
          value={formData.name}
          onChange={(e) => {
            const value = e.target.value;
            onFormDataChange({ ...formData, name: value });
            if (touched.name) {
              const error = validateName(value);
              onFieldError('name', error);
            }
          }}
          onBlur={() => {
            onFieldTouched('name');
            const error = validateName(formData.name);
            onFieldError('name', error);
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
          value={formData.description || ''}
          onChange={(e) => {
            const value = e.target.value;
            onFormDataChange({ ...formData, description: value });
            if (touched.description) {
              const error = validateDescription(value);
              onFieldError('description', error);
            }
          }}
          onBlur={() => {
            onFieldTouched('description');
            const error = validateDescription(formData.description || '');
            onFieldError('description', error);
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
            onFormDataChange({ ...formData, owner: value });
            if (touched.owner) {
              const error = validateOwner(value);
              onFieldError('owner', error);
            }
          }}
          onBlur={() => {
            onFieldTouched('owner');
            const error = validateOwner(formData.owner);
            onFieldError('owner', error);
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
  );
}

