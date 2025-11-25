'use client';

import { Header } from '@/components/layout/Header';
import { ContentPCManagement } from '@/components/content-pcs/ContentPCManagement';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ContentPCManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const projectIdParam = searchParams.get('projectId');
    setProjectId(projectIdParam || undefined);
  }, [searchParams]);

  const handleClose = () => {
    router.push('/dashboard/projects');
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="Content PC 관리"
        description="Content PC를 추가, 수정, 삭제하고 프로젝트에 연결합니다."
      />
      <div className="p-8 min-h-screen bg-gray-50">
        <ContentPCManagement projectId={projectId} onClose={handleClose} />
      </div>
    </>
  );
}

