'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiKeysApi } from '@/lib/api/api-keys';
import { useAuthStore } from '@/lib/store/authStore';
import { Search, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  apiKeyId: string;
  action: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  reason?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export default function AuditLogPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeyId, setSelectedKeyId] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      loadAuditLogs();
    }
  }, [selectedKeyId, page]);

  const loadApiKeys = async () => {
    try {
      const response = await apiKeysApi.list({ limit: 100 });
      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const loadAuditLogs = async () => {
    if (!selectedKeyId) return;
    try {
      setLoading(true);
      // Note: This would need to be implemented in the backend
      // For now, we'll use a placeholder
      const response = await apiKeysApi.getUsageStatistics(selectedKeyId);
      // In a real implementation, we'd have an audit log endpoint
      setLogs([]);
      setTotalPages(1);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isSuperadmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="감사 로그"
        description="API 키 사용 이력을 확인합니다."
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
            onChange={(e) => {
              setSelectedKeyId(e.target.value);
              setPage(1);
            }}
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
        ) : selectedKeyId ? (
          <div className="rounded-lg bg-white shadow">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                감사 로그가 없습니다.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      작업
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      IP 주소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      경로
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      메서드
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.action}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                            log.status,
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.ipAddress || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.path || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.method || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">API 키를 선택하여 감사 로그를 확인하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

