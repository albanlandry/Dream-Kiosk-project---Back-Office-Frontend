'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { contentPcsApi, ContentPC, ContentPCResources } from '@/lib/api/content-pcs';
import { useToastStore } from '@/lib/store/toastStore';

interface ContentPCResourcesModalProps {
  pc: ContentPC;
  onClose: () => void;
}

export function ContentPCResourcesModal({ pc, onClose }: ContentPCResourcesModalProps) {
  const [resources, setResources] = useState<ContentPCResources | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useToastStore();

  useEffect(() => {
    loadResources();
    // Refresh resources every 5 seconds
    const interval = setInterval(loadResources, 5000);
    return () => clearInterval(interval);
  }, [pc.id]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const data = await contentPcsApi.getResources(pc.id);
      setResources(data);
    } catch (error: any) {
      console.error('Failed to load resources:', error);
      showError('리소스 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-red-600';
    if (usage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (usage: number) => {
    if (usage >= 80) return 'bg-red-500';
    if (usage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="min-w-xl w-full">
        <DialogHeader>
          <DialogTitle>Content PC 리소스 사용량 - {pc.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">리소스 정보를 불러오는 중...</div>
          </div>
        ) : resources ? (
          <div className="space-y-6">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">CPU 사용률</span>
                <span className={`text-lg font-bold ${getUsageColor(resources.cpuUsage)}`}>
                  {resources.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getUsageBarColor(resources.cpuUsage)} transition-all duration-300`}
                  style={{ width: `${Math.min(resources.cpuUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">메모리 사용률</span>
                <span className={`text-lg font-bold ${getUsageColor(resources.memoryUsage)}`}>
                  {resources.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getUsageBarColor(resources.memoryUsage)} transition-all duration-300`}
                  style={{ width: `${Math.min(resources.memoryUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Disk Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">디스크 사용률</span>
                <span className={`text-lg font-bold ${getUsageColor(resources.diskUsage)}`}>
                  {resources.diskUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${getUsageBarColor(resources.diskUsage)} transition-all duration-300`}
                  style={{ width: `${Math.min(resources.diskUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Network Status */}
            <div>
              <span className="text-sm font-medium text-gray-700">네트워크 상태</span>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                {resources.networkStatus || 'Unknown'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">리소스 정보를 불러올 수 없습니다.</div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-6">
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

