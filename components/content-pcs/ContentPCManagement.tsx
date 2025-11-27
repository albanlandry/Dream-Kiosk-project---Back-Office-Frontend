'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AddContentPCModal } from './AddContentPCModal';
import { EditContentPCModal } from './EditContentPCModal';
import { ContentPCItem } from './ContentPCItem';
import { ContentPCResourcesModal } from './ContentPCResourcesModal';
import { contentPcsApi, ContentPC } from '@/lib/api/content-pcs';
import { useToastStore } from '@/lib/store/toastStore';
import { LoadingModal } from '@/components/ui/loading-modal';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { projectsApi } from '@/lib/api/projects';
import { PermissionGate } from '@/components/auth/permission-gate';

interface ContentPCManagementProps {
  projectId?: string;
  onClose?: () => void;
}

export function ContentPCManagement({ projectId, onClose }: ContentPCManagementProps) {
  const [contentPCs, setContentPCs] = useState<ContentPC[]>([]);
  const [filteredPCs, setFilteredPCs] = useState<ContentPC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPC, setEditingPC] = useState<ContentPC | null>(null);
  const [viewingResources, setViewingResources] = useState<ContentPC | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>(projectId || 'all');
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [projectOptions, setProjectOptions] = useState<SearchableSelectOption[]>([]);
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadContentPCs();
    loadProjects();
  }, [projectId]);

  useEffect(() => {
    filterContentPCs();
  }, [selectedProjectFilter, contentPCs]);

  const loadProjects = async () => {
    try {
      const projectList = await projectsApi.getAll();
      setProjects(projectList);
      const options: SearchableSelectOption[] = [
        { id: 'all', label: '전체 프로젝트', value: 'all' },
        ...projectList.map((p) => ({
          id: p.id,
          label: p.name,
          value: p.id,
        })),
      ];
      setProjectOptions(options);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadContentPCs = async () => {
    try {
      setIsLoading(true);
      const pcs = await contentPcsApi.getAll(projectId);
      setContentPCs(pcs);
    } catch (error: any) {
      console.error('Failed to load Content PCs:', error);
      showError('Content PC 목록을 불러오는데 실패했습니다.');
      setContentPCs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterContentPCs = () => {
    if (selectedProjectFilter === 'all') {
      setFilteredPCs(contentPCs);
    } else {
      setFilteredPCs(contentPCs.filter((pc) => pc.projectId === selectedProjectFilter));
    }
  };

  const handleAdd = async () => {
    await loadContentPCs();
    setShowAddModal(false);
  };

  const handleEdit = async () => {
    await loadContentPCs();
    setEditingPC(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 Content PC를 삭제하시겠습니까?')) return;

    try {
      await contentPcsApi.delete(id);
      showSuccess('Content PC가 삭제되었습니다.');
      await loadContentPCs();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Content PC 삭제에 실패했습니다.');
    }
  };

  const handleAttach = async (id: string, newProjectId: string) => {
    try {
      await contentPcsApi.attachToProject(id, newProjectId);
      showSuccess('Content PC가 프로젝트에 연결되었습니다.');
      await loadContentPCs();
    } catch (error: any) {
      showError(error.response?.data?.message || '프로젝트 연결에 실패했습니다.');
    }
  };

  const handleDetach = async (id: string) => {
    if (!confirm('이 Content PC를 프로젝트에서 분리하시겠습니까?')) return;

    try {
      await contentPcsApi.detachFromProject(id);
      showSuccess('Content PC가 프로젝트에서 분리되었습니다.');
      await loadContentPCs();
    } catch (error: any) {
      showError(error.response?.data?.message || '프로젝트 분리에 실패했습니다.');
    }
  };

  const handleStart = async (id: string) => {
    try {
      await contentPcsApi.start(id);
      showSuccess('Content PC가 시작되었습니다.');
      await loadContentPCs();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Content PC 시작에 실패했습니다.');
    }
  };

  const handleRestart = async (id: string) => {
    if (!confirm('이 Content PC를 재시작하시겠습니까?')) return;

    try {
      await contentPcsApi.restart(id);
      showSuccess('Content PC가 재시작되었습니다.');
      await loadContentPCs();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Content PC 재시작에 실패했습니다.');
    }
  };

  const handleViewResources = async (pc: ContentPC) => {
    setViewingResources(pc);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6 p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Content PC 관리</h2>
            <p className="text-sm text-gray-600 mt-1">Content PC를 추가, 수정, 삭제하고 프로젝트에 연결합니다.</p>
          </div>
          <div className="flex gap-2">
            {onClose && (
              <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
                <i className="fas fa-arrow-left mr-2"></i>
                프로젝트로 돌아가기
              </Button>
            )}
            <PermissionGate permission="content-pc:create">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <i className="fas fa-plus mr-2"></i>
                새 Content PC 추가
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="p-6">

        {/* Filter */}
        {!projectId && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 필터:
            </label>
            <SearchableSelect
              options={projectOptions}
              value={selectedProjectFilter}
              onChange={(value) => setSelectedProjectFilter(value || 'all')}
              placeholder="전체 프로젝트"
              searchPlaceholder="프로젝트 검색..."
            />
          </div>
        )}

        {/* Content PC List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Content PC를 불러오는 중...</div>
          </div>
        ) : filteredPCs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Content PC가 없습니다.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPCs.map((pc) => (
              <ContentPCItem
                key={pc.id}
                pc={pc}
                projects={projects}
                onEdit={() => setEditingPC(pc)}
                onDelete={() => handleDelete(pc.id)}
                onAttach={(newProjectId) => handleAttach(pc.id, newProjectId)}
                onDetach={() => handleDetach(pc.id)}
                onStart={() => handleStart(pc.id)}
                onRestart={() => handleRestart(pc.id)}
                onViewResources={() => handleViewResources(pc)}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddContentPCModal
          projectId={projectId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAdd}
        />
      )}

      {editingPC && (
        <EditContentPCModal
          pc={editingPC}
          onClose={() => setEditingPC(null)}
          onSuccess={handleEdit}
        />
      )}

      {viewingResources && (
        <ContentPCResourcesModal
          pc={viewingResources}
          onClose={() => setViewingResources(null)}
        />
      )}
    </>
  );
}

