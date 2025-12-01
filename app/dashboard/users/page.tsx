'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterSection, FilterGroup, SearchGroup } from '@/components/ui/filter-section';
import { useState, useEffect, useCallback } from 'react';
import { UserTable } from '@/components/users/UserTable';
import { BulkActions } from '@/components/users/BulkActions';
import { AddUserModal } from '@/components/users/AddUserModal';
import { ViewUserModal } from '@/components/users/ViewUserModal';
import { EditUserModal } from '@/components/users/EditUserModal';
import { Pagination } from '@/components/ui/pagination';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { useToastStore } from '@/lib/store/toastStore';
import { useRouter } from 'next/navigation';
import { UsersPageSkeleton } from '@/components/skeletons/UsersPageSkeleton';

export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  memo?: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    userId: 'user001',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    department: '개발팀',
    memo: '일반 사용자 계정',
    role: 'user',
    status: 'active',
    joinDate: '2024-12-01',
    lastLogin: '2024-12-22 14:30',
  },
  {
    id: '2',
    userId: 'user002',
    name: '이영희',
    email: 'lee@example.com',
    role: 'admin',
    status: 'active',
    joinDate: '2024-11-15',
    lastLogin: '2024-12-22 13:15',
  },
  {
    id: '3',
    userId: 'user003',
    name: '박민수',
    email: 'park@example.com',
    role: 'user',
    status: 'inactive',
    joinDate: '2024-10-20',
    lastLogin: '2024-12-15 09:45',
  },
  {
    id: '4',
    userId: 'user004',
    name: '최지영',
    email: 'choi@example.com',
    role: 'viewer',
    status: 'suspended',
    joinDate: '2024-09-10',
    lastLogin: '2024-12-10 16:20',
  },
  {
    id: '5',
    userId: 'user005',
    name: '정수진',
    email: 'jung@example.com',
    role: 'user',
    status: 'active',
    joinDate: '2024-12-05',
    lastLogin: '2024-12-22 15:00',
  },
  {
    id: '6',
    userId: 'user006',
    name: '한미영',
    email: 'han@example.com',
    role: 'user',
    status: 'active',
    joinDate: '2024-11-20',
    lastLogin: '2024-12-22 12:30',
  },
  {
    id: '7',
    userId: 'user007',
    name: '송대현',
    email: 'song@example.com',
    role: 'viewer',
    status: 'active',
    joinDate: '2024-11-10',
    lastLogin: '2024-12-21 18:45',
  },
  {
    id: '8',
    userId: 'user008',
    name: '윤서연',
    email: 'yoon@example.com',
    role: 'user',
    status: 'inactive',
    joinDate: '2024-10-15',
    lastLogin: '2024-12-18 10:20',
  },
  {
    id: '9',
    userId: 'user009',
    name: '강민호',
    email: 'kang@example.com',
    role: 'admin',
    status: 'active',
    joinDate: '2024-11-01',
    lastLogin: '2024-12-22 16:15',
  },
  {
    id: '10',
    userId: 'user010',
    name: '오지은',
    email: 'oh@example.com',
    role: 'user',
    status: 'active',
    joinDate: '2024-12-10',
    lastLogin: '2024-12-22 14:00',
  },
  {
    id: '11',
    userId: 'user011',
    name: '임동욱',
    email: 'lim@example.com',
    role: 'user',
    status: 'suspended',
    joinDate: '2024-09-25',
    lastLogin: '2024-12-05 11:30',
  },
  {
    id: '12',
    userId: 'user012',
    name: '조은혜',
    email: 'cho@example.com',
    role: 'viewer',
    status: 'active',
    joinDate: '2024-11-30',
    lastLogin: '2024-12-22 13:45',
  },
  {
    id: '13',
    userId: 'user013',
    name: '신동훈',
    email: 'shin@example.com',
    role: 'user',
    status: 'active',
    joinDate: '2024-12-08',
    lastLogin: '2024-12-22 15:30',
  },
  {
    id: '14',
    userId: 'user014',
    name: '배수진',
    email: 'bae@example.com',
    role: 'user',
    status: 'inactive',
    joinDate: '2024-10-05',
    lastLogin: '2024-12-12 09:15',
  },
  {
    id: '15',
    userId: 'user015',
    name: '홍길동',
    email: 'hong@example.com',
    role: 'admin',
    status: 'active',
    joinDate: '2024-10-01',
    lastLogin: '2024-12-22 17:00',
  },
];

const ITEMS_PER_PAGE = 10;

export default function UserManagementPage() {
  const { admin, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { showError } = useToastStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [joinDateFilter, setJoinDateFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || !admin) {
      showError('관리자 권한이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!admin.roles || !admin.roles.includes('admin')) {
      showError('관리자 권한이 필요합니다.');
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, admin, router, showError]);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/backoffice/admins?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      const responseData = response.data?.data || response.data;
      const usersList = responseData?.items || [];
      const total = responseData?.total_count || 0;
      
      setUsers(usersList);
      setTotalPages(responseData?.total_pages || Math.ceil(total / ITEMS_PER_PAGE));
    } catch (error: any) {
      console.error('Failed to load users:', error);
      showError('사용자 목록을 불러오는데 실패했습니다.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, showError]);

  // Load users from API
  useEffect(() => {
    if (isAuthenticated && admin && admin.roles?.includes('admin')) {
      loadUsers();
    }
  }, [isAuthenticated, admin, loadUsers]);

  // Show skeleton while loading
  if (isLoading) {
    return <UsersPageSkeleton />;
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const inactiveUsers = users.filter((u) => u.status === 'inactive').length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  const filteredUsers = users.filter((user) => {
    if (statusFilter && user.status !== statusFilter) return false;
    if (roleFilter && user.role !== roleFilter) return false;
    if (searchInput) {
      const searchLower = searchInput.toLowerCase();
      if (
        !user.name.toLowerCase().includes(searchLower) &&
        !user.email.toLowerCase().includes(searchLower) &&
        !user.userId.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  // 페이지네이션 계산
  const paginatedUsers = filteredUsers;

  // 필터 변경 시 첫 페이지로 리셋
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleBulkActivate = () => {
    setUsers(
      users.map((u) =>
        selectedUsers.includes(u.id) ? { ...u, status: 'active' as const } : u
      )
    );
    setSelectedUsers([]);
    alert('선택한 사용자가 활성화되었습니다.');
  };

  const handleBulkSuspend = () => {
    setUsers(
      users.map((u) =>
        selectedUsers.includes(u.id) ? { ...u, status: 'suspended' as const } : u
      )
    );
    setSelectedUsers([]);
    alert('선택한 사용자가 정지되었습니다.');
  };

  const handleBulkDelete = () => {
    if (confirm('선택한 사용자를 삭제하시겠습니까?')) {
      setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      alert('선택한 사용자가 삭제되었습니다.');
    }
  };

  // 페이지 변경 시 선택 해제
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedUsers([]);
  };

  if (!isAuthenticated || !admin || !admin.roles?.includes('admin')) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <>
        <Header title="사용자 관리" description="시스템 사용자 관리" />
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </>
    );
  }

  const handleView = (user: User) => {
    setViewingUser(user);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDelete = (user: User) => {
    if (confirm(`${user.name} 사용자를 삭제하시겠습니까?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
      alert('사용자가 삭제되었습니다.');
    }
  };

  const handleActivate = (user: User) => {
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: 'active' as const } : u)));
    alert(`${user.name} 사용자가 활성화되었습니다.`);
  };

  const handleSuspend = (user: User) => {
    setUsers(
      users.map((u) => (u.id === user.id ? { ...u, status: 'suspended' as const } : u))
    );
    alert(`${user.name} 사용자가 정지되었습니다.`);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="사용자 관리"
        description="사용자 계정 및 권한 관리"
        action={{
          label: '새 사용자 추가',
          icon: 'fas fa-plus',
          onClick: () => setShowAddModal(true),
        }}
      />
      <div className="p-8 min-h-screen">
        {/* 사용자 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<i className="fas fa-users"></i>}
            value={totalUsers}
            label="총 사용자"
            iconBg="bg-gradient-to-br from-blue-500 to-blue-700"
          />
          <StatCard
            icon={<i className="fas fa-user-check"></i>}
            value={activeUsers}
            label="활성 사용자"
            iconBg="bg-gradient-to-br from-green-500 to-green-700"
          />
          <StatCard
            icon={<i className="fas fa-user-clock"></i>}
            value={inactiveUsers}
            label="비활성 사용자"
            iconBg="bg-gradient-to-br from-orange-500 to-orange-700"
          />
          <StatCard
            icon={<i className="fas fa-user-shield"></i>}
            value={adminUsers}
            label="관리자"
            iconBg="bg-gradient-to-br from-red-500 to-red-700"
          />
        </div>

        {/* 필터 및 검색 */}
        <FilterSection>
          <FilterGroup label="사용자 상태:">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="suspended">정지</option>
            </select>
          </FilterGroup>
          <FilterGroup label="권한:">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                handleFilterChange();
              }}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="">전체</option>
              <option value="admin">관리자</option>
              <option value="user">일반 사용자</option>
              <option value="viewer">뷰어</option>
            </select>
          </FilterGroup>
          <FilterGroup label="가입일:">
            <Input
              type="date"
              value={joinDateFilter}
              onChange={(e) => {
                setJoinDateFilter(e.target.value);
                handleFilterChange();
              }}
            />
          </FilterGroup>
          <SearchGroup>
            <Input
              type="text"
              placeholder="이름, 이메일, ID 검색..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                handleFilterChange();
              }}
            />
            <Button variant="secondary">
              <i className="fas fa-search"></i>
            </Button>
          </SearchGroup>
        </FilterSection>

        {/* 사용자 테이블 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <UserTable
            users={paginatedUsers}
            selectedUsers={selectedUsers}
            onSelectAll={handleSelectAll}
            onSelectUser={handleSelectUser}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivate}
            onSuspend={handleSuspend}
          />
        </div>

        {/* 일괄 작업 */}
        <div className="my-6">
            <BulkActions
            selectedCount={selectedUsers.length}
            onActivate={handleBulkActivate}
            onSuspend={handleBulkSuspend}
            onDelete={handleBulkDelete}
            />
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newUser) => {
            setUsers([...users, newUser]);
            setShowAddModal(false);
          }}
        />
      )}

      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={(updatedUser) => {
            setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
            setEditingUser(null);
          }}
        />
      )}
    </>
  );
}

