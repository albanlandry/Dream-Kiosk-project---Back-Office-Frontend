'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { apiKeysApi, ApiKeyUsageStatistics } from '@/lib/api/api-keys';
import { useAuthStore } from '@/lib/store/authStore';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

export default function StatisticsPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<ApiKeyUsageStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) {
      router.push('/dashboard');
      return;
    }
    loadApiKeys();
  }, [isSuperadmin]);

  useEffect(() => {
    if (selectedKeyId) {
      loadStatistics();
    }
  }, [selectedKeyId]);

  const loadApiKeys = async () => {
    try {
      const response = await apiKeysApi.list({ limit: 100 });
      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const loadStatistics = async () => {
    if (!selectedKeyId) return;
    try {
      setLoading(true);
      const stats = await apiKeysApi.getUsageStatistics(selectedKeyId);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperadmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="사용 통계"
        description="API 키 사용 통계를 확인합니다."
        action={
          <Button variant="outline" onClick={() => router.push('/dashboard/api-keys')}>
            목록으로
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">API 키 선택</label>
          <select
            value={selectedKeyId}
            onChange={(e) => setSelectedKeyId(e.target.value)}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">선택하세요</option>
            {apiKeys.map((key) => (
              <option key={key.id} value={key.id}>
                {key.name} ({key.owner})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center">로딩 중...</div>
        ) : statistics ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">총 요청</p>
                    <p className="mt-2 text-3xl font-bold">{statistics.totalRequests}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">성공한 요청</p>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                      {statistics.successfulRequests}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">실패한 요청</p>
                    <p className="mt-2 text-3xl font-bold text-red-600">
                      {statistics.failedRequests}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Last Used */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">마지막 사용</h3>
              <p className="text-gray-700">
                {statistics.lastUsedAt
                  ? new Date(statistics.lastUsedAt).toLocaleString()
                  : '사용 기록이 없습니다.'}
              </p>
            </div>

            {/* Actions Breakdown */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">작업별 통계</h3>
              <div className="space-y-2">
                {statistics.actionsBreakdown.map((action) => (
                  <div key={action.action} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{action.action}</span>
                    <span className="font-semibold">{action.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requests Per Day */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">일별 요청 수</h3>
              <div className="space-y-2">
                {statistics.requestsPerDay.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">API 키를 선택하여 통계를 확인하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

