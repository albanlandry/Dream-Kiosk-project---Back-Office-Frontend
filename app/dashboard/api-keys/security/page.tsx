'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { apiKeysApi, SecurityAlert, SecurityDashboard } from '@/lib/api/api-keys';
import { useAuthStore } from '@/lib/store/authStore';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SecurityDashboardPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [dashboard, setDashboard] = useState<SecurityDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) {
      router.push('/dashboard');
      return;
    }
    loadDashboard();
  }, [isSuperadmin]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiKeysApi.getSecurityDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load security dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await apiKeysApi.acknowledgeAlert(alertId);
      loadDashboard();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!isSuperadmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="보안 대시보드"
        description="API 키 보안 이벤트 및 알림을 모니터링합니다."
        action={
          <Button variant="outline" onClick={() => router.push('/dashboard/api-keys')}>
            목록으로
          </Button>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="text-center">로딩 중...</div>
        ) : dashboard ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">총 알림</p>
                    <p className="mt-2 text-3xl font-bold">{dashboard.totalAlerts}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">미확인 알림</p>
                    <p className="mt-2 text-3xl font-bold text-orange-600">
                      {dashboard.unacknowledgedAlerts}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">알림 유형</p>
                    <p className="mt-2 text-3xl font-bold">
                      {Object.keys(dashboard.alertsByType).length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">심각도 분포</p>
                    <p className="mt-2 text-3xl font-bold">
                      {Object.keys(dashboard.alertsBySeverity).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Alerts by Type */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">알림 유형별 통계</h3>
              <div className="space-y-2">
                {Object.entries(dashboard.alertsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">최근 알림</h3>
              <div className="space-y-4">
                {dashboard.recentAlerts.length === 0 ? (
                  <p className="text-center text-gray-500">알림이 없습니다.</p>
                ) : (
                  dashboard.recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded border p-4 ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{alert.type}</span>
                            <span
                              className={`rounded px-2 py-1 text-xs font-semibold ${getSeverityColor(
                                alert.severity,
                              )}`}
                            >
                              {alert.severity}
                            </span>
                            {alert.acknowledged && (
                              <span className="text-xs text-gray-600">(확인됨)</span>
                            )}
                          </div>
                          <p className="mt-2 text-sm">{alert.message}</p>
                          <p className="mt-1 text-xs text-gray-600">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            확인
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">데이터를 불러올 수 없습니다.</div>
        )}
      </div>
    </div>
  );
}

