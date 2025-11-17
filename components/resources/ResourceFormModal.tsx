'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Resource {
  id: string;
  name: string;
  description?: string;
  images: Array<{ id: string; originalName: string; thumbnailPath?: string }>;
  videos: Array<{ id: string; userName: string; thumbnailUrl?: string }>;
  animals: Array<{ id: string; name: string; thumbnailUrl?: string }>;
  kiosks: Array<{ id: string; name: string }>;
  createdAt: Date;
  updatedAt: Date;
}

interface ResourceFormModalProps {
  open: boolean;
  editingResource: Resource | null;
  formData: {
    name: string;
    description: string;
    imageIds: string[];
    videoIds: string[];
    animalIds: string[];
    kioskIds: string[];
  };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: Partial<ResourceFormModalProps['formData']>) => void;
}

export function ResourceFormModal({
  open,
  editingResource,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
}: ResourceFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {editingResource ? '리소스 수정' : '리소스 생성'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              리소스 이름 *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              placeholder="예: 강남점 리소스 팩"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="리소스에 대한 설명을 입력하세요."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
            >
              {editingResource ? '수정' : '생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

