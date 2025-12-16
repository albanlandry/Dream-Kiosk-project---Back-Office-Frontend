'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { contentPcsApi, ContentPC } from '@/lib/api/content-pcs';
import { useToastStore } from '@/lib/store/toastStore';

interface ContentPCSettingsModalProps {
  pc: ContentPC;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContentPCSettingsModal({ pc, onClose, onSuccess }: ContentPCSettingsModalProps) {
  const [settings, setSettings] = useState({
    autoStart: pc.autoStart ?? true,
    updateInterval: pc.updateInterval ?? 30,
    volume: pc.volume ?? 80,
    brightness: pc.brightness ?? 100,
    displayMode: pc.displayMode ?? 'fullscreen',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await contentPcsApi.updateSettings(pc.id, settings);
      showSuccess('설정이 저장되었습니다.');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      showError(error.response?.data?.message || '설정 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="min-w-xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Content PC 설정 - {pc.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">기본 설정</h3>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) => setSettings({ ...settings, autoStart: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">부팅 시 자동 시작</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                업데이트 간격 (초)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={settings.updateInterval}
                onChange={(e) =>
                  setSettings({ ...settings, updateInterval: parseInt(e.target.value) || 30 })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">10초 ~ 300초 사이의 값을 입력하세요.</p>
            </div>
          </div>

          {/* 재생 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">재생 설정</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                볼륨: {settings.volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => setSettings({ ...settings, volume: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                밝기: {settings.brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.brightness}
                onChange={(e) => setSettings({ ...settings, brightness: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">디스플레이 모드</label>
              <select
                value={settings.displayMode}
                onChange={(e) =>
                  setSettings({ ...settings, displayMode: e.target.value as 'fullscreen' | 'windowed' })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="fullscreen">전체 화면</option>
                <option value="windowed">창 모드</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

