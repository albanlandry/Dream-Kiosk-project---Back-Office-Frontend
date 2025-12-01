"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { useToastStore } from "@/lib/store/toastStore";
import { cn } from "@/lib/utils/cn";
import { Clock, CheckCircle2, Heart, AlertTriangle } from "lucide-react";

interface ScheduleDetailModalProps {
  open: boolean;
  scheduleId: string | null;
  onClose: () => void;
  onSave?: (scheduleId: string) => void;
}

interface ScheduleDetails {
  schedule: {
    id: string;
    title: string | null;
    authorName: string | null;
    wishMessage: string | null;
    templateAnimal: string | null;
    templateTheme: string | null;
    status: string;
    priority: number;
    displayStart: string;
    displayEnd: string;
    purchaseDate: string;
    createdAt: string;
    maxPlayCount: number;
    project: {
      id: string;
      name: string;
    };
    content: {
      id: string;
      userName: string;
      userMessage: string;
    } | null;
  };
  performance: {
    averagePlaybackTime: number;
    completionRate: number;
    userEngagement: number;
    errorCount: number;
    lastError?: {
      time: string;
      message: string;
    };
  };
  logs: Array<{
    timestamp: string;
    event: string;
    details: string;
    source: string;
    userId?: string;
  }>;
  contentPcs: Array<{
    id: string;
    name: string;
  }>;
}

type TabType = "overview" | "content" | "performance" | "logs";

export function ScheduleDetailModal({
  open,
  scheduleId,
  onClose,
  onSave,
}: ScheduleDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [details, setDetails] = useState<ScheduleDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useToastStore();

  const loadScheduleDetails = async () => {
    if (!scheduleId) return;

    try {
      setIsLoading(true);
      const response = await apiClient.get(`/schedules/${scheduleId}/details`);
      const data = response.data?.data || response.data;
      setDetails(data);
    } catch (error) {
      console.error("Failed to load schedule details:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      showError(errorMessage || "스케줄 상세 정보를 불러오는데 실패했습니다.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && scheduleId) {
      loadScheduleDetails();
    } else {
      setDetails(null);
      setActiveTab("overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scheduleId]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "오후" : "오전";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${year}. ${month}. ${day}. ${ampm} ${displayHours}:${minutes}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: "대기", className: "bg-yellow-100 text-yellow-800" },
      playing: { label: "활성", className: "bg-green-100 text-green-800" },
      completed: { label: "완료", className: "bg-green-50 text-green-700" },
      cancelled: { label: "취소", className: "bg-red-100 text-red-800" },
    };
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.scheduled;
    return (
      <span
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          statusInfo.className
        )}
      >
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityText = (priority: number) => {
    if (priority >= 3) return "높음";
    if (priority >= 2) return "보통";
    return "낮음";
  };

  const handleSave = () => {
    if (scheduleId && onSave) {
      onSave(scheduleId);
    }
    onClose();
  };

  if (!open) return null;

  const schedule = details?.schedule;
  const performance = details?.performance;
  const logs = details?.logs || [];
  const contentPcs = details?.contentPcs || [];

  const scheduleTitle =
    schedule?.title ||
    `${schedule?.templateAnimal || ""}의 꿈 - ${schedule?.authorName || ""}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            스케줄 상세보기
          </h2>
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
        ) : !schedule ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">스케줄 정보를 불러올 수 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col flex-1 overflow-y-auto">
              {/* Schedule Title and Status */}
              <div className="px-6 py-5 pt-12 border-b border-gray-200 bg-white text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {scheduleTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{scheduleTitle}</p>
                <div className="flex items-center gap-4 justify-center">
                  {getStatusBadge(schedule.status)}
                  <span className="text-sm text-gray-600">
                    우선순위: {getPriorityText(schedule.priority)}
                  </span>
                </div>
              </div>

              {/* Tab Container */}
              <div className="px-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white pt-6">
                  {[
                    { id: "overview", label: "개요" },
                    { id: "content", label: "콘텐츠" },
                    { id: "performance", label: "성능" },
                    { id: "logs", label: "로그" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={cn(
                        "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-gray-800"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto py-6">
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                      <div className="flex flex-row gap-1 justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">
                          프로젝트
                        </label>
                        <p className="text-sm text-gray-900">
                          {schedule.project.name}
                        </p>
                      </div>

                      <div className="flex flex-row gap-1 justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">
                          Content PC
                        </label>
                        <p className="text-sm text-gray-900">
                          {contentPcs.length > 0
                            ? contentPcs
                                .map((pc, idx) => `Content PC #${idx + 1}`)
                                .join(", ")
                            : "없음"}
                        </p>
                      </div>

                      <div className="flex flex-row gap-1 justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">
                          시작 시간
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatDateTime(schedule.displayStart)}
                        </p>
                      </div>
                      <div className="flex flex-row gap-1 justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">
                          스케줄 정책
                        </label>
                        <p className="text-sm text-gray-900">
                          {schedule.maxPlayCount.toLocaleString()}개 제한 (FIFO)
                        </p>
                      </div>
                      <div className="flex flex-row gap-1 justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">
                          재생 횟수
                        </label>
                        <p className="text-sm text-gray-900">
                          {performance?.completionRate
                            ? Math.round(
                                (performance.completionRate / 100) *
                                  schedule.maxPlayCount
                              ).toLocaleString()
                            : "0"}
                          회
                        </p>
                      </div>
                      <div className="flex flex-row gap-1 justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">
                          최대 재생 횟수
                        </label>
                        <p className="text-sm text-gray-900">
                          {schedule.maxPlayCount.toLocaleString()}회
                        </p>
                      </div>
                      <div className="flex flex-row gap-1 justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">
                          생성일
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatDateTime(schedule.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-row gap-1 justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700">
                          생성자
                        </label>
                        <p className="text-sm text-gray-900">
                          {schedule.authorName || "시스템"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Content Tab */}
                  {activeTab === "content" && (
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4">
                          콘텐츠 정보
                        </h4>
                        <div className="space-y-1">
                          {/* Template Field */}
                          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="grid grid-cols-[200px_1fr_auto] gap-6 items-start">
                              <label className="text-sm font-medium text-gray-700 font-semibold">
                                템플릿:
                              </label>
                              <p className="text-sm text-gray-500">
                                {schedule.templateAnimal || "없음"}
                              </p>
                            </div>
                          </div>
                          {/* Author Field */}
                          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="grid grid-cols-[200px_1fr_auto] gap-6 items-start">
                              <label className="text-sm font-medium text-gray-700 font-semibold">
                                작성자:
                              </label>
                              <p className="text-sm text-gray-500">
                                {schedule.authorName || "없음"}
                              </p>
                            </div>
                          </div>
                          {/* Wish Message Field */}
                          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="grid grid-cols-[200px_1fr_auto] gap-6 items-start">
                              <label className="text-sm font-medium text-gray-700 font-semibold">
                                소원 메시지:
                              </label>
                              <p className="text-sm text-gray-500 flex-1 text-gray-500">
                                {schedule.wishMessage || "없음"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 재생 설정 */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4">
                          재생 설정
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {/* Auto Repeat Field */}
                          <div className="bg-white border-b p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">
                                자동 반복:
                              </label>
                              <p className="text-sm text-gray-600">비활성화</p>
                            </div>
                          </div>
                          {/* Shuffle Mode Field */}
                          <div className="bg-white border-b p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">
                                셔플 모드:
                              </label>
                              <p className="text-sm text-gray-600">비활성화</p>
                            </div>
                          </div>
                          {/* Volume Field */}
                          <div className="bg-white border-b p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">
                                볼륨:
                              </label>
                              <p className="text-sm text-gray-600">70%</p>
                            </div>
                          </div>
                          {/* Brightness Field */}
                          <div className="bg-white border-b p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">
                                밝기:
                              </label>
                              <p className="text-sm text-gray-600">85%</p>
                            </div>
                          </div>
                          {/* Display Mode Field */}
                          <div className="bg-white border-b p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">
                                디스플레이 모드:
                              </label>
                              <p className="text-sm text-gray-600">전체화면</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Performance Tab */}
                  {activeTab === "performance" && performance && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Average Playback Time Card */}
                        <div className="bg-gray-50 rounded-lg px-5 py-8 flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-2">
                            <Clock className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-gray-900">
                              {performance.averagePlaybackTime}분
                            </p>
                            <span className="text-sm font-medium text-gray-600">
                              평균 재생 시간
                            </span>
                          </div>
                        </div>

                        {/* Completion Rate Card */}
                        <div className="bg-gray-50 rounded-lg px-5 py-8 flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-2">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-gray-900">
                              {performance.completionRate.toFixed(1)}%
                            </p>
                            <span className="text-sm font-medium text-gray-600">
                              완료율
                            </span>
                          </div>
                        </div>

                        {/* User Engagement Card */}
                        <div className="bg-gray-50 rounded-lg px-5 py-8 flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-2">
                            <Heart className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-gray-900">
                              {performance.userEngagement.toFixed(1)}%
                            </p>
                            <span className="text-sm font-medium text-gray-600">
                              사용자 참여도
                            </span>
                          </div>
                        </div>

                        {/* Error Count Card */}
                        <div className="bg-gray-50 rounded-lg px-5 py-8 flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-2">
                            <AlertTriangle className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-gray-900">
                              {performance.errorCount}회
                            </p>
                            <span className="text-sm font-medium text-gray-600">
                              오류 횟수
                            </span>
                          </div>
                        </div>
                      </div>
                      {performance.lastError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-red-800 mb-2">
                            마지막 오류
                          </h4>
                          <p className="text-sm text-red-700 mb-1">
                            시간: {formatDateTime(performance.lastError.time)}
                          </p>
                          <p className="text-sm text-red-700">
                            {performance.lastError.message}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Logs Tab */}
                  {activeTab === "logs" && (
                    <div className="space-y-4">
                      {logs.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          로그가 없습니다.
                        </p>
                      ) : (
                        logs.map((log, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-200 pb-4 last:border-0"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {log.event}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                  {formatDateTime(log.timestamp)}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {log.details}
                                </p>
                                {log.userId && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    사용자: {log.userId}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-4">
                                {log.source}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                저장
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
