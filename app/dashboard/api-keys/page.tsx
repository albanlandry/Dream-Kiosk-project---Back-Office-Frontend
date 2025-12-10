'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiKeysApi, ApiKey } from '@/lib/api/api-keys';
import { useAuthStore } from '@/lib/store/authStore';
import { Plus, Search, Filter, Trash2, Ban, RotateCcw, Key } from 'lucide-react';

export default function ApiKeysPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) {
      router.push('/dashboard');
      return;
    }
    loadApiKeys();
  }, [page, statusFilter, searchTerm, isSuperadmin]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeysApi.list({
        page,
        limit: 20,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setApiKeys(response.data);
      setTotalPages(response.pagination.total_pages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await apiKeysApi.delete(id);
      loadApiKeys();
    } catch (error) {
      console.error('Failed to delete API key:', error);
      alert('Failed to delete API key');
    }
  };

  const handleRevoke = async (id: string) => {
    const reason = prompt('Enter revocation reason:');
    if (!reason) return;
    try {
      await apiKeysApi.revoke(id, reason);
      loadApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      alert('Failed to revoke API key');
    }
  };

  const handleBlacklist = async (id: string) => {
    const reason = prompt('Enter blacklist reason (optional):');
    try {
      await apiKeysApi.blacklist(id, reason || undefined);
      loadApiKeys();
    } catch (error) {
      console.error('Failed to blacklist API key:', error);
      alert('Failed to blacklist API key');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedKeys.length} API keys?`)) return;
    try {
      await apiKeysApi.bulkDelete(selectedKeys);
      setSelectedKeys([]);
      loadApiKeys();
    } catch (error) {
      console.error('Failed to delete API keys:', error);
      alert('Failed to delete API keys');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'blacklisted':
        return 'bg-gray-100 text-gray-800';
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
        title="API 키 관리"
        description="API 키를 생성, 관리하고 권한을 설정할 수 있습니다."
        action={
          <Button onClick={() => router.push('/dashboard/api-keys/create')}>
            <Plus className="mr-2 h-4 w-4" />
            새 API 키 생성
          </Button>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="revoked">취소됨</option>
            <option value="expired">만료됨</option>
            <option value="blacklisted">블랙리스트</option>
          </select>
          {selectedKeys.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              선택 삭제 ({selectedKeys.length})
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg bg-white shadow">
          {loading ? (
            <div className="p-8 text-center">로딩 중...</div>
          ) : apiKeys.length === 0 ? (
            <div className="p-8 text-center text-gray-500">API 키가 없습니다.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedKeys.length === apiKeys.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedKeys(apiKeys.map((k) => k.id));
                        } else {
                          setSelectedKeys([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    소유자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    마지막 사용
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(key.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKeys([...selectedKeys, key.id]);
                          } else {
                            setSelectedKeys(selectedKeys.filter((id) => id !== key.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Key className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{key.name}</span>
                      </div>
                      {key.description && (
                        <p className="text-sm text-gray-500">{key.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{key.owner}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          key.status,
                        )}`}
                      >
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/api-keys/${key.id}`)}
                        >
                          보기
                        </Button>
                        {key.status === 'active' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleRevoke(key.id)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleBlacklist(key.id)}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(key.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 {total}개의 API 키 중 {page * 20 - 19}-{Math.min(page * 20, total)}개 표시
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                이전
              </Button>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

