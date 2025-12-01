"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingModal } from "@/components/ui/loading-modal";
import { apiClient } from "@/lib/api/client";
import { useToastStore } from "@/lib/store/toastStore";

interface EditScheduleModalProps {
  open: boolean;
  scheduleId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ScheduleData {
  id: string;
  title: string | null;
  authorName: string | null;
  wishMessage: string | null;
  templateAnimal: string | null;
  priority: number;
  maxPlayCount: number;
  project: {
    id: string;
    name: string;
  };
  contentPcs: Array<{
    id: string;
    name: string;
  }>;
}

interface ContentPC {
  id: string;
  name: string;
}

export function EditScheduleModal({
  open,
  scheduleId,
  onClose,
  onSuccess,
}: EditScheduleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [contentPcs, setContentPcs] = useState<ContentPC[]>([]);
  const { showSuccess, showError } = useToastStore();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    authorName: "",
    wishMessage: "",
    priority: 2, // 1: 낮음, 2: 보통, 3: 높음
    selectedContentPcs: [] as string[],
    autoRepeat: false,
    shuffleMode: false,
    volume: 70,
    brightness: 85,
    displayMode: "fullscreen",
  });

  const loadScheduleData = useCallback(async () => {
    if (!scheduleId) return;

    try {
      setIsLoading(true);
      const response = await apiClient.get(`/schedules/${scheduleId}/details`);
      const data = response.data?.data || response.data;
      const schedule = data.schedule;

      // Load Content PC settings if available
      let volume = 70;
      let brightness = 85;
      let displayMode = "fullscreen";
      const autoRepeat = false;
      const shuffleMode = false;

      // Try to get settings from the first assigned Content PC
      if (data.contentPcs && data.contentPcs.length > 0) {
        try {
          const pcId = data.contentPcs[0].id;
          const pcResponse = await apiClient.get(`/schedules/content-pcs/${pcId}`);
          const pcData = pcResponse.data?.data || pcResponse.data;
          volume = pcData.volume ?? 70;
          brightness = pcData.brightness ?? 85;
          displayMode = pcData.displayMode ?? "fullscreen";
          // Note: autoRepeat and shuffleMode might not be in Content PC entity
        } catch (error) {
          console.error("Failed to load Content PC settings:", error);
        }
      }

      setScheduleData({
        id: schedule.id,
        title: schedule.title,
        authorName: schedule.authorName,
        wishMessage: schedule.wishMessage,
        templateAnimal: schedule.templateAnimal,
        priority: schedule.priority,
        maxPlayCount: schedule.maxPlayCount,
        project: schedule.project,
        contentPcs: data.contentPcs || [],
      });

      // Set form data
      setFormData({
        title:
          schedule.title ||
          `${schedule.templateAnimal || ""}의 꿈 - ${
            schedule.authorName || ""
          }`,
        authorName: schedule.authorName || "",
        wishMessage: schedule.wishMessage || "",
        priority: schedule.priority || 2,
        selectedContentPcs: (data.contentPcs || []).map((pc: { id: string }) => pc.id),
        autoRepeat,
        shuffleMode,
        volume,
        brightness,
        displayMode,
      });
    } catch (error) {
      console.error("Failed to load schedule data:", error);
      showError("스케줄 정보를 불러오는데 실패했습니다.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, showError, onClose]);

  const loadContentPcs = useCallback(async () => {
    try {
      const response = await apiClient.get("/schedules/content-pcs");
      const data = response.data?.data || response.data;
      const pcsList = Array.isArray(data) ? data : [];
      setContentPcs(
        pcsList.map((pc: { id: string; name?: string }) => ({
          id: pc.id,
          name: pc.name || `Content PC #${pcsList.indexOf(pc) + 1}`,
        }))
      );
    } catch (error) {
      console.error("Failed to load Content PCs:", error);
      setContentPcs([]);
    }
  }, []);

  // Load schedule details
  useEffect(() => {
    if (open && scheduleId) {
      loadScheduleData();
      loadContentPcs();
    } else {
      setScheduleData(null);
      setFormData({
        title: "",
        authorName: "",
        wishMessage: "",
        priority: 2,
        selectedContentPcs: [],
        autoRepeat: false,
        shuffleMode: false,
        volume: 70,
        brightness: 85,
        displayMode: "fullscreen",
      });
    }
  }, [open, scheduleId, loadScheduleData, loadContentPcs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleId) return;

    // Ask for confirmation before validation
    const confirmed = window.confirm(
      "스케줄 정보를 수정하시겠습니까?\n\n변경사항이 저장되면 즉시 적용됩니다."
    );

    if (!confirmed) {
      return;
    }

    // Basic validation
    if (!formData.authorName.trim()) {
      showError("작성자명을 입력해주세요.");
      return;
    }

    if (formData.authorName.length > 10) {
      showError("작성자명은 10자 이하여야 합니다.");
      return;
    }

    if (!formData.wishMessage.trim()) {
      showError("소원 메시지를 입력해주세요.");
      return;
    }

    if (formData.wishMessage.length > 20) {
      showError("소원 메시지는 20자 이하여야 합니다.");
      return;
    }

    if (formData.volume < 0 || formData.volume > 100) {
      showError("볼륨은 0-100 사이의 값이어야 합니다.");
      return;
    }

    if (formData.brightness < 0 || formData.brightness > 100) {
      showError("밝기는 0-100 사이의 값이어야 합니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update schedule basic info
      await apiClient.put(`/schedules/${scheduleId}`, {
        title: formData.title,
        authorName: formData.authorName,
        wishMessage: formData.wishMessage,
        priority: formData.priority,
        // Use first selected Content PC if any selected
        contentPcId: formData.selectedContentPcs.length > 0 
          ? formData.selectedContentPcs[0] 
          : null,
      });

      // Update Content PC settings for all selected Content PCs
      const updatePromises = formData.selectedContentPcs.map(async (pcId) => {
        try {
          await apiClient.put(`/schedules/content-pcs/${pcId}/settings`, {
            volume: formData.volume,
            brightness: formData.brightness,
            displayMode: formData.displayMode,
          });
        } catch (error) {
          console.error(`Failed to update Content PC ${pcId} settings:`, error);
          // Continue with other updates even if one fails
        }
      });

      await Promise.all(updatePromises);

      showSuccess("스케줄이 성공적으로 수정되었습니다.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update schedule:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      showError(errorMessage || "스케줄 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduleTitle =
    scheduleData?.title ||
    `${scheduleData?.templateAnimal || ""}의 꿈 - ${
      scheduleData?.authorName || ""
    }`;

  if (!open) return null;

  return (
    <>
      <LoadingModal 
        isOpen={isLoading || isSubmitting} 
        message={isLoading ? "스케줄 정보를 불러오는 중..." : "스케줄을 저장하는 중..."}
      />
      <div className="fixed inset-0 z-50 bg-black/75">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">스케줄 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : !scheduleData ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">스케줄 정보를 불러올 수 없습니다.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-y-auto"
          >
            {/* Schedule Title Section */}
            <div className="px-6 py-5 pt-11 border-b border-gray-200 bg-white text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {scheduleTitle}
              </h3>
              <p className="text-base text-gray-600">스케줄 정보를 수정하세요</p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* 기본 정보 Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">
                  기본 정보
                </h4>
                <div className="space-y-4">
                  {/* 제목 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* 작성자 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      작성자
                    </label>
                    <Input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) =>
                        setFormData({ ...formData, authorName: e.target.value })
                      }
                      className="w-full"
                      maxLength={10}
                    />
                  </div>

                  {/* 소원 메시지 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      소원 메시지
                    </label>
                    <textarea
                      value={formData.wishMessage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          wishMessage: e.target.value,
                        })
                      }
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              {/* 스케줄 설정 Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">
                  스케줄 설정
                </h4>
                <div className="space-y-4">
                  {/* 스케줄 정책 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      스케줄 정책
                    </label>
                    <p className="text-sm font-bold text-gray-900">
                      {scheduleData.maxPlayCount.toLocaleString()}개 제한 정책
                      (FIFO)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      스케줄 개수가 {scheduleData.maxPlayCount.toLocaleString()}
                      개를 초과하면 가장 오래된 항목이 자동으로 제거됩니다.
                    </p>
                  </div>

                  {/* 우선순위 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      우선순위
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>낮음</option>
                      <option value={2}>보통</option>
                      <option value={3}>높음</option>
                    </select>
                  </div>

                  {/* 스케줄 정책 안내 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600">
                      {scheduleData.maxPlayCount.toLocaleString()}개 제한 정책이
                      적용됩니다. 스케줄 개수가 초과하면 가장 오래된 항목이
                      자동으로 제거됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content PC 할당 Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">
                  Content PC 할당
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    할당된 Content PC
                  </label>
                  <div className="space-y-2">
                    {contentPcs.map((pc) => (
                      <label
                        key={pc.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedContentPcs.includes(pc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                selectedContentPcs: [
                                  ...formData.selectedContentPcs,
                                  pc.id,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedContentPcs: formData.selectedContentPcs.filter(
                                  (id) => id !== pc.id
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{pc.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 재생 설정 Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">
                  재생 설정
                </h4>
                <div className="space-y-4">
                  {/* 자동 반복 */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoRepeat}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoRepeat: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">자동 반복</span>
                  </label>

                  {/* 셔플 모드 */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shuffleMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shuffleMode: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">셔플 모드</span>
                  </label>

                  {/* 볼륨 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      볼륨 (%)
                    </label>
                    <ProgressBar
                      value={formData.volume}
                      min={0}
                      max={100}
                      filled={false}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          volume: value,
                        })
                      }
                    />
                  </div>

                  {/* 밝기 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      밝기 (%)
                    </label>
                    <ProgressBar
                      value={formData.brightness}
                      min={0}
                      max={100}
                      filled={false}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          brightness: value,
                        })
                      }
                    />
                  </div>

                  {/* 디스플레이 모드 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      디스플레이 모드
                    </label>
                    <select
                      value={formData.displayMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayMode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fullscreen">전체화면</option>
                      <option value="windowed">창 모드</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg mt-auto">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md"
              >
                {isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        )}
       </div>
     </div>
    </>
  );
}
