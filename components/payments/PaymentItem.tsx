'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Payment } from '@/lib/api/payments';

interface PaymentItemProps {
  payment: Payment;
  onViewDetails?: (id: string) => void;
  onRefund?: (id: string) => void;
  onCancel?: (id: string) => void;
  formatDateTime: (dateString: string) => string;
  formatCurrency: (amount: number, currency: string) => string;
}

export function PaymentItem({
  payment,
  onViewDetails,
  onRefund,
  onCancel,
  formatDateTime,
  formatCurrency,
}: PaymentItemProps) {
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

  const canRefund = payment.status === 'completed' && !payment.refundedAmount;
  const canCancel = payment.status === 'pending';
  const isRefunded = payment.status === 'refunded' || payment.status === 'partially_refunded';

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-800">
              결제 ID: {payment.id.slice(0, 8)}...
            </h4>
            {getStatusBadge(payment.status)}
          </div>
          {payment.video && (
            <p className="text-sm text-gray-600 mb-1">
              사용자: {payment.video.userName || 'N/A'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <span className="text-sm text-gray-600">금액:</span>
          <p className="text-sm font-medium text-gray-800">
            {formatCurrency(payment.amount, payment.currency)}
          </p>
        </div>
        {isRefunded && payment.refundedAmount && (
          <div>
            <span className="text-sm text-gray-600">환불 금액:</span>
            <p className="text-sm font-medium text-red-600">
              {formatCurrency(payment.refundedAmount, payment.currency)}
            </p>
          </div>
        )}
        <div>
          <span className="text-sm text-gray-600">결제 수단:</span>
          <p className="text-sm font-medium text-gray-800">
            {payment.paymentMethod || 'N/A'}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-600">
            {payment.status === 'completed' ? '완료일:' : '생성일:'}
          </span>
          <p className="text-sm font-medium text-gray-800">
            {payment.completedAt
              ? formatDateTime(payment.completedAt.toString())
              : formatDateTime(payment.createdAt.toString())}
          </p>
        </div>
      </div>

      {payment.transactionId && (
        <div className="mb-3">
          <span className="text-sm text-gray-600">트랜잭션 ID: </span>
          <span className="text-sm font-mono text-gray-700">{payment.transactionId}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => onViewDetails?.(payment.id)}
        >
          <i className="fas fa-eye mr-1"></i>
          상세 보기
        </Button>
        {canRefund && (
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => onRefund?.(payment.id)}
          >
            <i className="fas fa-undo mr-1"></i>
            환불
          </Button>
        )}
        {canCancel && (
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onCancel?.(payment.id)}
          >
            <i className="fas fa-times mr-1"></i>
            취소
          </Button>
        )}
      </div>
    </div>
  );
}

