'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { rolesApi, permissionsApi, Role, Permission } from '@/lib/api/roles';
import { useAuthStore } from '@/lib/store/authStore';
import { Plus, Search, Edit, Trash2, Shield, Users } from 'lucide-react';

export default function RolesPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const isSuperadmin = admin?.roles?.includes('super_admin') || admin?.roles?.includes('superadmin');

  useEffect(() => {
    if (!isSuperadmin) {
      router.push('/dashboard');
      return;
    }
    loadRoles();
    loadAllPermissions();
  }, [page, isSuperadmin]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesApi.list({
        page,
        limit: 20,
      });
      setRoles(response.data || []);
      setTotalPages(response.pagination?.total_pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllPermissions = async () => {
    try {
      const response = await permissionsApi.list({ limit: 1000 });
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissionIds: [] });
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions?.map((p) => p.id) || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingRole) {
        await rolesApi.update(editingRole.id, formData);
      } else {
        await rolesApi.create(formData);
      }
      setShowModal(false);
      loadRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await rolesApi.delete(id);
      loadRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isSuperadmin) {
    return null;
  }

  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="역할 관리"
        description="시스템 역할을 생성, 수정하고 권한을 할당할 수 있습니다."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            새 역할 생성
          </Button>
        }
      />

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="역할 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Roles Table */}
        <div className="rounded-lg bg-white shadow">
          {loading ? (
            <div className="p-8 text-center">로딩 중...</div>
          ) : filteredRoles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">역할이 없습니다.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    권한 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    시스템 역할
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{role.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {role.permissions?.length || 0}개
                    </td>
                    <td className="px-6 py-4">
                      {role.isSystemRole ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                          시스템
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.isSystemRole && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(role.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
              총 {total}개의 역할 중 {page * 20 - 19}-{Math.min(page * 20, total)}개 표시
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">
              {editingRole ? '역할 수정' : '새 역할 생성'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름 *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={editingRole?.isSystemRole}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">권한 선택</label>
                <div className="max-h-96 overflow-y-auto rounded border p-4">
                  {Object.entries(permissionsByResource).map(([resource, perms]) => (
                    <div key={resource} className="mb-4">
                      <h4 className="mb-2 font-semibold text-gray-700">{resource}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center space-x-2 rounded border p-2 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissionIds.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="rounded"
                            />
                            <span className="text-sm">
                              {perm.action} {perm.description && `(${perm.description})`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={!formData.name}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

