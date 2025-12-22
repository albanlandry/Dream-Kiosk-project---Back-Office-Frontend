'use client';

import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ContentItem } from './ContentPreviewModal';

interface ContentItemCardProps {
  item: ContentItem;
  onPreview: (item: ContentItem) => void;
  onDownload: (item: ContentItem) => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
}

export const ContentItemCard = memo(function ContentItemCard({
  item,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
}: ContentItemCardProps) {
  const handlePreview = useCallback(() => {
    onPreview(item);
  }, [item, onPreview]);

  const handleDownload = useCallback(() => {
    onDownload(item);
  }, [item, onDownload]);

  const handleEdit = useCallback(() => {
    onEdit(item);
  }, [item, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(item);
  }, [item, onDelete]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm grid grid-cols-[200px_1fr_auto] gap-6">
      <div className="w-50 h-30 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center self-center">
        <i className="fas fa-video text-4xl text-gray-400"></i>
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">{item.title}</h4>
        <p className="text-sm text-gray-600 mb-1">
          <strong>템플릿:</strong> {item.template}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <strong>작성자:</strong> {item.author}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <strong>소원:</strong> {item.wish}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <strong>생성일:</strong> {item.createdAt}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <strong>노출 기간:</strong> {item.displayPeriod}
        </p>
        <p className="text-sm text-gray-600">
          <strong>상태:</strong>{' '}
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              item.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {item.status === 'active' ? '활성' : '만료'}
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-2 min-w-[120px]">
        <Button
          onClick={handlePreview}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
        >
          <i className="fas fa-eye mr-2"></i>미리보기
        </Button>
        <Button
          onClick={handleDownload}
          className="bg-gray-500 hover:bg-gray-600 text-white text-sm"
        >
          <i className="fas fa-download mr-2"></i>다운로드
        </Button>
        <Button
          onClick={handleEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
        >
          <i className="fas fa-edit mr-2"></i>수정
        </Button>
        <Button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white text-sm"
        >
          <i className="fas fa-trash mr-2"></i>삭제
        </Button>
      </div>
    </div>
  );
});

