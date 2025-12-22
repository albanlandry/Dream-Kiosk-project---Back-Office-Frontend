'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ContentItem } from './ContentPreviewModal';

interface ContentEditModalProps {
  content: ContentItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedContent: ContentItem) => void;
}

export function ContentEditModal({ content, open, onClose, onSuccess }: ContentEditModalProps) {
  const [formData, setFormData] = useState<Partial<ContentItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title,
        template: content.template,
        author: content.author,
        wish: content.wish,
        displayPeriod: content.displayPeriod,
        status: content.status,
      });
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    setIsSubmitting(true);
    try {
      // TODO: 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const updatedContent: ContentItem = {
        ...content,
        ...formData,
      } as ContentItem;

      onSuccess(updatedContent);
      onClose();
    } catch (error) {
      console.error('Failed to update content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">콘텐츠 수정</DialogTitle>
          <DialogDescription>{content.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              템플릿
            </label>
            <select
              value={formData.template || ''}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="용 (Dragon)">용 (Dragon)</option>
              <option value="호랑이 (Tiger)">호랑이 (Tiger)</option>
              <option value="봉황 (Phoenix)">봉황 (Phoenix)</option>
              <option value="거북이 (Turtle)">거북이 (Turtle)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              작성자
            </label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소원 메시지
            </label>
            <textarea
              value={formData.wish || ''}
              onChange={(e) => setFormData({ ...formData, wish: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentItem['status'] })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="active">활성</option>
              <option value="expired">만료</option>
              <option value="pending">대기중</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-gray-300"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

