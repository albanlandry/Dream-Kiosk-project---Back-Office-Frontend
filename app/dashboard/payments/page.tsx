'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToastStore } from '@/lib/store/toastStore';
import { Pagination } from '@/components/ui/pagination';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { PaymentItem } from '@/components/payments/PaymentItem';
import { PaymentDetailModal } from '@/components/payments/PaymentDetailModal';
import { RefundModal } from '@/components/payments/RefundModal';
import { PaymentStatisticsCards } from '@/components/payments/PaymentStatisticsCards';
import { paymentsApi, Payment, PaymentStatistics } from '@/lib/api/payments';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { PermissionGate } from '@/components/auth/permission-gate';

const ITEMS_PER_PAGE = 20;

export default function PaymentManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Protect route with permission check
  useRoutePermission('payment:read', '/dashboard');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || '',
  );
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>(
    searchParams.get('method') || '',
  );
  const [startDate, setStartDate] = useState<string>(
    searchParams.get('startDate') || '',
  );
  const [endDate, setEndDate] = useState<string>(searchParams.get('endDate') || '');
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get('search') || '',
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1,
  );

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 1,
    hasMore: false,
  });

  // Modals
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [refundingPayment, setRefundingPayment] = useState<Payment | null>(null);
  const [cancellingPaymentId, setCancellingPaymentId] = useState<string | null>(null);

  const { showSuccess, showError } = useToastStore();

  // Update URL query parameters
  const updateURL = useCallback(
    (updates: {
      status?: string;
      method?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.status !== undefined) {
        if (updates.status) {
          params.set('status', updates.status);
        } else {
          params.delete('status');
        }
      }
      if (updates.method !== undefined) {
        if (updates.method) {
          params.set('method', updates.method);
        } else {
          params.delete('method');
        }
      }
      if (updates.startDate !== undefined) {
        if (updates.startDate) {
          params.set('startDate', updates.startDate);
        } else {
          params.delete('startDate');
        }
      }
      if (updates.endDate !== undefined) {
        if (updates.endDate) {
          params.set('endDate', updates.endDate);
        } else {
          params.delete('endDate');
        }
      }
      if (updates.search !== undefined) {
        if (updates.search) {
          params.set('search', updates.search);
        } else {
          params.delete('search');
        }
      }
      if (updates.page !== undefined) {
        if (updates.page > 1) {
          params.set('page', updates.page.toString());
        } else {
          params.delete('page');
        }
      }

      router.push(`/dashboard/payments?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Load payments
  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (statusFilter) params.status = statusFilter;
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.search = searchTerm;

      const data = await paymentsApi.getAll(params);
      setPayments(data);

      // Update pagination (assuming API returns pagination info)
      // For now, we'll estimate based on data length
      setPagination({
        total: data.length,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        totalPages: Math.ceil(data.length / ITEMS_PER_PAGE) || 1,
        hasMore: data.length === ITEMS_PER_PAGE,
      });
    } catch (error: any) {
      console.error('Failed to load payments:', error);
      showError('결제 내역을 불러오는데 실패했습니다.');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    statusFilter,
    paymentMethodFilter,
    startDate,
    endDate,
    searchTerm,
    showError,
  ]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      setIsLoadingStatistics(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await paymentsApi.getStatistics(params);
      setStatistics(data);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
      // Don't show error for statistics, just log it
    } finally {
      setIsLoadingStatistics(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const handleRefund = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment) {
      setRefundingPayment(payment);
    }
  };

  const handleCancel = async (paymentId: string) => {
    if (!confirm('이 결제를 취소하시겠습니까?')) {
      return;
    }

    try {
      await paymentsApi.cancelPayment(paymentId, {});
      showSuccess('결제가 취소되었습니다.');
      loadPayments();
      loadStatistics();
    } catch (error: any) {
      showError(error.response?.data?.message || '결제 취소에 실패했습니다.');
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

  const statusOptions: SearchableSelectOption[] = [
    { id: '', label: '전체', value: '' },
    { id: 'pending', label: '대기 중', value: 'pending' },
    { id: 'completed', label: '완료', value: 'completed' },
    { id: 'failed', label: '실패', value: 'failed' },
    { id: 'cancelled', label: '취소됨', value: 'cancelled' },
    { id: 'refunded', label: '환불됨', value: 'refunded' },
    { id: 'partially_refunded', label: '부분 환불', value: 'partially_refunded' },
  ];

  const paymentMethodOptions: SearchableSelectOption[] = [
    { id: '', label: '전체', value: '' },
    { id: 'card', label: '신용카드', value: 'card' },
    { id: 'qr', label: 'QR 코드', value: 'qr' },
    { id: 'mobile', label: '모바일', value: 'mobile' },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <PermissionGate permission="payment:read">
        <Header title="결제 관리" description="결제 내역 및 환불 관리" />

        <div className="p-8 min-h-screen">
          {/* Statistics Cards */}
          <div className="mb-8">
            <PaymentStatisticsCards
              statistics={statistics}
              isLoading={isLoadingStatistics}
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">필터</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <SearchableSelect
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                    updateURL({ status: value, page: 1 });
                  }}
                  placeholder="상태 선택"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제 수단
                </label>
                <SearchableSelect
                  options={paymentMethodOptions}
                  value={paymentMethodFilter}
                  onChange={(value) => {
                    setPaymentMethodFilter(value);
                    setCurrentPage(1);
                    updateURL({ method: value, page: 1 });
                  }}
                  placeholder="결제 수단 선택"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                    updateURL({ startDate: e.target.value, page: 1 });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                    updateURL({ endDate: e.target.value, page: 1 });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  검색
                </label>
                <Input
                  type="text"
                  placeholder="결제 ID, 트랜잭션 ID 검색"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                    updateURL({ search: e.target.value, page: 1 });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payments List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">결제 내역</h3>
              <span className="text-sm text-gray-600">
                총 {pagination.total}건
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">결제 내역을 불러오는 중...</div>
              </div>
            ) : payments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">결제 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <PaymentItem
                    key={payment.id}
                    payment={payment}
                    onViewDetails={setSelectedPaymentId}
                    onRefund={handleRefund}
                    onCancel={handleCancel}
                    formatDateTime={formatDateTime}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    updateURL({ page });
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Detail Modal */}
        <PaymentDetailModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
          onRefund={() => {
            if (selectedPaymentId) {
              const payment = payments.find((p) => p.id === selectedPaymentId);
              if (payment) {
                setSelectedPaymentId(null);
                setRefundingPayment(payment);
              }
            }
          }}
          onCancel={() => {
            if (selectedPaymentId) {
              setSelectedPaymentId(null);
              handleCancel(selectedPaymentId);
            }
          }}
        />

        {/* Refund Modal */}
        <RefundModal
          payment={refundingPayment}
          onClose={() => setRefundingPayment(null)}
          onSuccess={() => {
            loadPayments();
            loadStatistics();
          }}
        />
      </PermissionGate>
    </>
  );
}

