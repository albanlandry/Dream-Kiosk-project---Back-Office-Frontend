'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
import { projectsApi, type Project as ApiProject } from '@/lib/api/projects';
import { useToastStore } from '@/lib/store/toastStore';

interface ProjectSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ProjectSelect({
  value,
  onChange,
  placeholder = '프로젝트 선택',
  required = false,
  disabled = false,
  className,
}: ProjectSelectProps) {
  const [projectOptions, setProjectOptions] = useState<SearchableSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { showError } = useToastStore();

  // Load projects with pagination and search
  const loadProjects = useCallback(
    async (pageNum: number = 1, search: string = '', append: boolean = false) => {
      try {
        setIsLoading(true);
        const result = await projectsApi.getAllPaginated({
          page: pageNum,
          limit: 20,
          search: search || undefined,
          fields: 'id,name,location',
        });

        const newOptions: SearchableSelectOption[] = result.data.map((p: ApiProject) => ({
          id: p.id,
          label: p.name,
          value: p.id,
        }));

        if (append) {
          setProjectOptions((prev) => [...prev, ...newOptions]);
        } else {
          setProjectOptions(newOptions);
        }

        setHasMore(result.pagination.hasMore);
      } catch (error: unknown) {
        console.error('Failed to load projects:', error);
        showError('프로젝트 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [showError],
  );

  // Initial load
  useEffect(() => {
    loadProjects(1, '', false);
  }, [loadProjects]);

  // Handle search
  const handleSearch = useCallback(
    (search: string) => {
      setSearchTerm(search);
      setPage(1);
      loadProjects(1, search, false);
    },
    [loadProjects],
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProjects(nextPage, searchTerm, true);
    }
  }, [isLoading, hasMore, page, searchTerm, loadProjects]);

  return (
    <SearchableSelect
      options={projectOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="프로젝트 검색..."
      disabled={disabled}
      required={required}
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      emptyMessage="프로젝트가 없습니다."
      className={className}
    />
  );
}

