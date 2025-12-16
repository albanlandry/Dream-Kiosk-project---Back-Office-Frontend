import { apiClient } from './client';

export interface Payment {
  id: string;
  videoId: string;
  video?: {
    id: string;
    userName: string;
    userMessage: string;
  };
  amount: number;
  currency: string;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  transactionId?: string;
  paymentUrl?: string;
  expiresAt?: string | Date;
  completedAt?: string | Date;
  cancelledAt?: string | Date;
  refundedAt?: string | Date;
  refundedAmount?: number;
  refundId?: string;
  refundReason?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PaymentStatistics {
  summary: {
    totalPayments: number;
    completedPayments: number;
    failedPayments: number;
    cancelledPayments: number;
    refundedPayments: number;
    totalRevenue: number;
    totalRefunded: number;
    netRevenue: number;
    successRate: number;
    refundRate: number;
  };
  paymentMethods: Array<{
    method: string;
    count: number;
    total: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}

export interface CancelRequest {
  reason?: string;
}

export const paymentsApi = {
  getAll: async (params?: {
    status?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Payment[]> => {
    const response = await apiClient.get('/payments', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data?.data || response.data;
  },

  getStatus: async (id: string) => {
    const response = await apiClient.get(`/payments/${id}/status`);
    return response.data?.data || response.data;
  },

  processRefund: async (id: string, refundRequest: RefundRequest): Promise<Payment> => {
    const response = await apiClient.post(`/payments/${id}/refund`, refundRequest);
    return response.data?.data || response.data;
  },

  cancelPayment: async (id: string, cancelRequest: CancelRequest): Promise<Payment> => {
    const response = await apiClient.post(`/payments/${id}/cancel`, cancelRequest);
    return response.data?.data || response.data;
  },

  getStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentStatistics> => {
    const response = await apiClient.get('/payments/statistics', { params });
    return response.data?.data || response.data;
  },
};

