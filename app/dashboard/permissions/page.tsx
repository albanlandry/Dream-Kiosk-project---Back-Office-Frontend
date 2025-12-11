'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { permissionsApi, Permission } from '@/lib/api/roles';
import { useAuthStore } from '@/lib/store/authStore';
import { Plus, Search, Edit, Trash2, Key, Filter } from 'lucide-react';

export default function PermissionsPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    resource: '',
    action: '',
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) {
      router.push('/dashboard');
      return;
    }
    loadPermissions();
  }, [page, resourceFilter, isSuperadmin]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      // Load all permissions for filtering (we'll filter client-side for now)
      const response = await permissionsApi.list({
        page: 1,
        limit: 1000, // Get all for client-side filtering
      });
      setPermissions(response.data || []);
      setTotalPages(response.pagination?.total_pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPermission(null);
    setFormData({ name: '', resource: '', action: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingPermission) {
        await permissionsApi.update(editingPermission.id, formData);
      } else {
        await permissionsApi.create(formData);
      }
      setShowModal(false);
      loadPermissions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save permission');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;
    try {
      await permissionsApi.delete(id);
      loadPermissions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete permission');
    }
  };

  const filteredPermissions = permissions.filter(
    (perm) =>
      (!resourceFilter || perm.resource === resourceFilter) &&
      (perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Get unique resources for filter
  const uniqueResources = Array.from(
    new Set(permissions.map((p) => p.resource).filter(Boolean)),
  ).sort();

  if (!isSuperadmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="권한 관리"
        description="시스템 권한을 생성, 수정하고 관리할 수 있습니다."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            새 권한 생성
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
                placeholder="권한 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">모든 리소스</option>
            {uniqueResources.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </select>
        </div>

        {/* Permissions Table */}
        <div className="rounded-lg bg-white shadow">
          {loading ? (
            <div className="p-8 text-center">로딩 중...</div>
          ) : filteredPermissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">권한이 없습니다.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    리소스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    액션
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    설명
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Key className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{permission.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{permission.resource}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{permission.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {permission.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(permission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(permission.id)}
                        >
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

        {/* Results Count */}
        <div className="mt-6 text-sm text-gray-700">
          총 {filteredPermissions.length}개의 권한 표시
          {searchTerm || resourceFilter ? ` (전체 ${total}개 중)` : ''}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">
              {editingPermission ? '권한 수정' : '새 권한 생성'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름 *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: schedule:create"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">리소스 *</label>
                <Input
                  required
                  value={formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  placeholder="예: schedule"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">액션 *</label>
                <Input
                  required
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  placeholder="예: create, read, update, delete"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name || !formData.resource || !formData.action}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

