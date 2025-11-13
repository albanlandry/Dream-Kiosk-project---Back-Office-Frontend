'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddKioskModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddKioskModal({ onClose, onSuccess }: AddKioskModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ip: '',
    project: '',
    mac: '',
    serial: '',
    description: '',
    camera: true,
    cardReader: true,
    printer: true,
    microphone: true,
    autoSetup: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // IP 주소 형식 검사
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(formData.ip)) {
      alert('올바른 IP 주소 형식을 입력해주세요.');
      return;
    }

    // TODO: API call to add kiosk
    alert('새 키오스크가 추가되었습니다.');
    onSuccess();
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
            <DialogTitle>새 키오스크 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  키오스크 이름 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="예: 키오스크 #13"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  위치 *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="예: 대구점 - 1층 로비"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  IP 주소 *
                </label>
                <Input
                  value={formData.ip}
                  onChange={(e) =>
                    setFormData({ ...formData, ip: e.target.value })
                  }
                  placeholder="예: 192.168.4.113"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  프로젝트 *
                </label>
                <select
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">프로젝트 선택</option>
                  <option value="강남점 프로젝트">강남점 프로젝트</option>
                  <option value="홍대점 프로젝트">홍대점 프로젝트</option>
                  <option value="부산점 프로젝트">부산점 프로젝트</option>
                  <option value="대구점 프로젝트">대구점 프로젝트</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  MAC 주소
                </label>
                <Input
                  value={formData.mac}
                  onChange={(e) =>
                    setFormData({ ...formData, mac: e.target.value })
                  }
                  placeholder="예: 00:1B:44:11:3A:B7"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  시리얼 번호
                </label>
                <Input
                  value={formData.serial}
                  onChange={(e) =>
                    setFormData({ ...formData, serial: e.target.value })
                  }
                  placeholder="예: KIO-2024-001"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="키오스크에 대한 추가 설명"
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                하드웨어 구성
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.camera}
                    onChange={(e) =>
                      setFormData({ ...formData, camera: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-800">Femto 카메라</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cardReader}
                    onChange={(e) =>
                      setFormData({ ...formData, cardReader: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-800">카드 리더기</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.printer}
                    onChange={(e) =>
                      setFormData({ ...formData, printer: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-800">영수증 프린터</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.microphone}
                    onChange={(e) =>
                      setFormData({ ...formData, microphone: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-800">마이크</span>
                </label>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSetup}
                  onChange={(e) =>
                    setFormData({ ...formData, autoSetup: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-800">
                  자동 설정 (기본 설정으로 자동 구성)
                </span>
              </label>
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
                추가
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

