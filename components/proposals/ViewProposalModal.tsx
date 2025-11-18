'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Proposal } from '@/lib/api/proposals';
import { cn } from '@/lib/utils/cn';

interface ViewProposalModalProps {
  proposal: Proposal;
  onClose: () => void;
}

export function ViewProposalModal({ proposal, onClose }: ViewProposalModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDurationLabel = (duration: number) => {
    switch (duration) {
      case 1:
        return '1개월';
      case 3:
        return '3개월';
      case 6:
        return '6개월';
      case 12:
        return '12개월';
      default:
        return `${duration}개월`;
    }
  };

  const getStatusBadge = () => {
    const now = new Date();
    const displayEnd = new Date(proposal.displayEnd);
    const isExpired = displayEnd < now;

    if (isExpired) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
          만료됨
        </span>
      );
    }
    if (proposal.status === 'disabled') {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          비활성화
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
        활성
      </span>
    );
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="min-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>프로포즈 미리보기</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* 이미지 */}
            {proposal.image && (
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${proposal.image}`}
                  alt={proposal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <i className="fas fa-image text-4xl text-gray-400 hidden"></i>
              </div>
            )}

            {/* 프로포즈 정보 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">{proposal.name}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{proposal.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="text-sm font-semibold text-gray-600">프로젝트</label>
                  <p className="text-gray-800 mt-1">{proposal.project?.name || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">기간</label>
                  <p className="text-gray-800 mt-1">{getDurationLabel(proposal.duration)}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">표시 시작</label>
                  <p className="text-gray-800 mt-1">{formatDate(proposal.displayStart)}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">표시 종료</label>
                  <p className="text-gray-800 mt-1">{formatDate(proposal.displayEnd)}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">상태</label>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">생성일</label>
                  <p className="text-gray-800 mt-1">{formatDate(proposal.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

