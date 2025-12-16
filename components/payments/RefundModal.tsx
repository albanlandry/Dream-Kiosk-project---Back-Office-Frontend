'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paymentsApi, Payment } from '@/lib/api/payments';
import { useToastStore } from '@/lib/store/toastStore';

interface RefundModalProps {
  payment: Payment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundModal({ payment, onClose, onSuccess }: RefundModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToastStore();

  if (!payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (refundType === 'partial' && !refundAmount) {
      showError('환불 금액을 입력해주세요.');
      return;
    }

    if (refundType === 'partial') {
      const amount = parseFloat(refundAmount);
      if (isNaN(amount) || amount <= 0) {
        showError('유효한 환불 금액을 입력해주세요.');
        return;
      }
      if (amount > payment.amount) {
        showError('환불 금액이 결제 금액을 초과할 수 없습니다.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await paymentsApi.processRefund(payment.id, {
        amount: refundType === 'partial' ? parseFloat(refundAmount) : undefined,
        reason: reason || undefined,
      });
      showSuccess('환불이 처리되었습니다.');
      onSuccess();
      onClose();
    } catch (error: any) {
      showError(error.response?.data?.message || '환불 처리에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'KRW',
    }).format(amount);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="min-w-xl w-full">
        <DialogHeader>
          <DialogTitle>환불 처리</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결제 금액
            </label>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(payment.amount, payment.currency)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              환불 유형
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={(e) => {
                    setRefundType('full');
                    setRefundAmount('');
                  }}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">전체 환불</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={(e) => setRefundType('partial')}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">부분 환불</span>
              </label>
            </div>
          </div>

          {refundType === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                환불 금액
              </label>
              <Input
                type="number"
                min="0"
                max={payment.amount}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="환불 금액을 입력하세요"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                최대 환불 가능 금액: {formatCurrency(payment.amount, payment.currency)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              환불 사유 (선택사항)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="환불 사유를 입력하세요"
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
              disabled={isSubmitting}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isSubmitting ? '처리 중...' : '환불 처리'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

