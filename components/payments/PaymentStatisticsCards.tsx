'use client';

import { StatCard } from '@/components/ui/stat-card';
import { PaymentStatistics } from '@/lib/api/payments';

interface PaymentStatisticsCardsProps {
  statistics: PaymentStatistics | null;
  isLoading?: boolean;
}

export function PaymentStatisticsCards({
  statistics,
  isLoading,
}: PaymentStatisticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-16 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const { summary } = statistics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<i className="fas fa-credit-card"></i>}
        value={summary.totalPayments.toLocaleString()}
        label="총 결제 건수"
        iconBg="bg-gradient-to-br from-blue-500 to-blue-700"
      />
      <StatCard
        icon={<i className="fas fa-check-circle"></i>}
        value={summary.completedPayments.toLocaleString()}
        label="완료된 결제"
        iconBg="bg-gradient-to-br from-green-500 to-green-700"
        change={{
          value: `${summary.successRate.toFixed(1)}%`,
          type: 'positive',
        }}
      />
      <StatCard
        icon={<i className="fas fa-won-sign"></i>}
        value={`₩${summary.netRevenue.toLocaleString()}`}
        label="순수익"
        iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
      />
      <StatCard
        icon={<i className="fas fa-undo"></i>}
        value={`₩${summary.totalRefunded.toLocaleString()}`}
        label="환불 금액"
        iconBg="bg-gradient-to-br from-yellow-500 to-yellow-700"
        change={{
          value: `${summary.refundRate.toFixed(1)}%`,
          type: summary.refundRate > 10 ? 'negative' : 'neutral',
        }}
      />
    </div>
  );
}

