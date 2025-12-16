'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { paymentsApi, Payment } from '@/lib/api/payments';
import { useToastStore } from '@/lib/store/toastStore';
import { cn } from '@/lib/utils/cn';

interface PaymentDetailModalProps {
  paymentId: string | null;
  onClose: () => void;
  onRefund?: () => void;
  onCancel?: () => void;
}

export function PaymentDetailModal({
  paymentId,
  onClose,
  onRefund,
  onCancel,
}: PaymentDetailModalProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useToastStore();

  useEffect(() => {
    if (paymentId) {
      loadPayment();
    }
  }, [paymentId]);

  const loadPayment = async () => {
    if (!paymentId) return;

    try {
      setIsLoading(true);
      const data = await paymentsApi.getById(paymentId);
      setPayment(data);
    } catch (error: any) {
      console.error('Failed to load payment:', error);
      showError('결제 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'KRW',
    }).format(amount);
  };

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      pending: { label: '대기 중', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: '완료', className: 'bg-green-100 text-green-800' },
      failed: { label: '실패', className: 'bg-red-100 text-red-800' },
      cancelled: { label: '취소됨', className: 'bg-gray-100 text-gray-800' },
      refunded: { label: '환불됨', className: 'bg-blue-100 text-blue-800' },
      partially_refunded: { label: '부분 환불', className: 'bg-purple-100 text-purple-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          config.className,
        )}
      >
        {config.label}
      </span>
    );
  };

  if (!paymentId) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="min-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>결제 상세 정보</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">결제 정보를 불러오는 중...</div>
          </div>
        ) : payment ? (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                기본 정보
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">결제 ID</span>
                  <p className="text-sm font-medium text-gray-800 font-mono">
                    {payment.id}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">상태</span>
                  <div className="mt-1">{getStatusBadge(payment.status)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">금액</span>
                  <p className="text-sm font-medium text-gray-800">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">결제 수단</span>
                  <p className="text-sm font-medium text-gray-800">
                    {payment.paymentMethod || 'N/A'}
                  </p>
                </div>
                {payment.transactionId && (
                  <div>
                    <span className="text-sm text-gray-600">트랜잭션 ID</span>
                    <p className="text-sm font-medium text-gray-800 font-mono">
                      {payment.transactionId}
                    </p>
                  </div>
                )}
                {payment.refundId && (
                  <div>
                    <span className="text-sm text-gray-600">환불 ID</span>
                    <p className="text-sm font-medium text-gray-800 font-mono">
                      {payment.refundId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 날짜 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                날짜 정보
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">생성일</span>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDateTime(payment.createdAt)}
                  </p>
                </div>
                {payment.completedAt && (
                  <div>
                    <span className="text-sm text-gray-600">완료일</span>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDateTime(payment.completedAt)}
                    </p>
                  </div>
                )}
                {payment.cancelledAt && (
                  <div>
                    <span className="text-sm text-gray-600">취소일</span>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDateTime(payment.cancelledAt)}
                    </p>
                  </div>
                )}
                {payment.refundedAt && (
                  <div>
                    <span className="text-sm text-gray-600">환불일</span>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDateTime(payment.refundedAt)}
                    </p>
                  </div>
                )}
                {payment.expiresAt && (
                  <div>
                    <span className="text-sm text-gray-600">만료일</span>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDateTime(payment.expiresAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 환불 정보 */}
            {(payment.status === 'refunded' || payment.status === 'partially_refunded') && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  환불 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">환불 금액</span>
                    <p className="text-sm font-medium text-red-600">
                      {payment.refundedAmount
                        ? formatCurrency(payment.refundedAmount, payment.currency)
                        : 'N/A'}
                    </p>
                  </div>
                  {payment.refundReason && (
                    <div>
                      <span className="text-sm text-gray-600">환불 사유</span>
                      <p className="text-sm font-medium text-gray-800">
                        {payment.refundReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 비디오 정보 */}
            {payment.video && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  비디오 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">비디오 ID</span>
                    <p className="text-sm font-medium text-gray-800 font-mono">
                      {payment.videoId}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">사용자 이름</span>
                    <p className="text-sm font-medium text-gray-800">
                      {payment.video.userName || 'N/A'}
                    </p>
                  </div>
                  {payment.video.userMessage && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">사용자 메시지</span>
                      <p className="text-sm font-medium text-gray-800">
                        {payment.video.userMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              {payment.status === 'completed' && !payment.refundedAmount && (
                <Button
                  onClick={() => {
                    onClose();
                    onRefund?.();
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <i className="fas fa-undo mr-1"></i>
                  환불 처리
                </Button>
              )}
              {payment.status === 'pending' && (
                <Button
                  onClick={() => {
                    onClose();
                    onCancel?.();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <i className="fas fa-times mr-1"></i>
                  결제 취소
                </Button>
              )}
              <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
                닫기
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">결제 정보를 불러올 수 없습니다.</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

