'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/app/dashboard/projects/page';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    kioskCount: project.kioskCount,
    contentPCCount: project.contentPCCount,
    owner: project.owner,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProject: Project = {
      ...project,
      ...formData,
    };

    // TODO: API call to update project
    onSuccess(updatedProject);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>프로젝트 설정</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                프로젝트 이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                설명 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  시작일 *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  소유자 *
                </label>
                <Input
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  키오스크 수 *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.kioskCount}
                  onChange={(e) =>
                    setFormData({ ...formData, kioskCount: parseInt(e.target.value) })
                  }
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Content PC 수 *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.contentPCCount}
                  onChange={(e) =>
                    setFormData({ ...formData, contentPCCount: parseInt(e.target.value) })
                  }
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                저장
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

