'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectSelect } from '@/components/projects/ProjectSelect';
import { kiosksApi } from '@/lib/api/kiosks';
import { useToastStore } from '@/lib/store/toastStore';

interface Kiosk {
  id: string;
  name: string;
  location: string;
  ip: string;
  projectId?: string;
  project?: string;
}

interface KioskSettingsModalProps {
  kiosk: Kiosk;
  onClose: () => void;
}

export function KioskSettingsModal({ kiosk, onClose }: KioskSettingsModalProps) {
  const [formData, setFormData] = useState({
    name: kiosk.name,
    location: kiosk.location,
    ip: kiosk.ip,
    projectId: kiosk.projectId || '',
    cameraSensitivity: 7,
    cardReaderTimeout: 15,
    printerPaperCheck: true,
    microphoneVolume: 75,
    autoRestart: true,
    restartTime: '03:00',
    logLevel: 'INFO',
  });
  const { showSuccess, showError } = useToastStore();

  // Load kiosk details to get projectId if not available
  useEffect(() => {
    const loadKioskDetails = async () => {
      if (!kiosk.projectId && kiosk.id) {
        try {
          const kioskDetails = await kiosksApi.getById(kiosk.id);
          if (kioskDetails.projectId) {
            setFormData((prev) => ({
              ...prev,
              projectId: kioskDetails.projectId || '',
            }));
          }
        } catch (error) {
          console.error('Failed to load kiosk details:', error);
        }
      }
    };
    loadKioskDetails();
  }, [kiosk.id, kiosk.projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update kiosk basic info
      await kiosksApi.update(kiosk.id, {
        name: formData.name,
        location: formData.location,
        ipAddress: formData.ip,
        projectId: formData.projectId || undefined,
      });
      
      // TODO: Save hardware and system settings when API is ready
      showSuccess('설정이 저장되었습니다.');
      onClose();
    } catch (error: any) {
      showError(error.response?.data?.message || '설정 저장에 실패했습니다.');
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>키오스크 설정</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 키오스크 정보 */}
            <div className="text-center pb-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{kiosk.name}</h3>
              <p className="text-gray-600">{kiosk.location}</p>
            </div>

            {/* 기본 설정 */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                기본 설정
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    키오스크 이름
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    위치
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    IP 주소
                  </label>
                  <Input
                    value={formData.ip}
                    onChange={(e) =>
                      setFormData({ ...formData, ip: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    프로젝트
                  </label>
                  <ProjectSelect
                    value={formData.projectId}
                    onChange={(value) => setFormData({ ...formData, projectId: value })}
                    placeholder="프로젝트 선택"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 하드웨어 설정 */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                하드웨어 설정
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    카메라 감도: {formData.cameraSensitivity}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.cameraSensitivity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cameraSensitivity: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    카드 리더기 타임아웃 (초)
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="30"
                    value={formData.cardReaderTimeout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cardReaderTimeout: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.printerPaperCheck}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          printerPaperCheck: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      용지 부족 알림
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    마이크 볼륨: {formData.microphoneVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.microphoneVolume}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        microphoneVolume: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 시스템 설정 */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                시스템 설정
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoRestart}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoRestart: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      자동 재시작
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    재시작 시간
                  </label>
                  <Input
                    type="time"
                    value={formData.restartTime}
                    onChange={(e) =>
                      setFormData({ ...formData, restartTime: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    로그 레벨
                  </label>
                  <select
                    value={formData.logLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, logLevel: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                    <option value="DEBUG">DEBUG</option>
                  </select>
                </div>
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

