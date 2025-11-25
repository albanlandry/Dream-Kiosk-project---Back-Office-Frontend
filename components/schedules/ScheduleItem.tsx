"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface Schedule {
  id: string;
  projectId: string;
  contentId: string;
  title: string | null;
  authorName: string | null;
  wishMessage: string | null;
  templateAnimal: string | null;
  templateTheme: string | null;
  displayStart: string;
  displayEnd: string;
  purchaseDate: string;
  scheduleOrder: number;
  priority: number;
  status: "scheduled" | "playing" | "completed" | "cancelled";
  contentPcId: string | null;
  playCount?: number;
  maxPlayCount?: number;
}

interface ContentPc {
  id: string;
  name: string;
}

interface ScheduleItemProps {
  schedule: Schedule;
  contentPcs: ContentPc[];
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onStop?: (id: string) => void;
  onRestart?: (id: string) => void;
  onDelete?: (id: string) => void;
  formatDateTime: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityText: (priority: number) => string;
}

export function ScheduleItem({
  schedule,
  contentPcs,
  onViewDetails,
  onEdit,
  onStop,
  onRestart,
  onDelete,
  formatDateTime,
  getStatusBadge,
  getPriorityText,
}: ScheduleItemProps) {
  const isActive =
    schedule.status === "playing" || schedule.status === "scheduled";
  const scheduleTitle =
    schedule.title ||
    `${schedule.templateAnimal || "꿈조각"}의 꿈${
      schedule.authorName ? ` - ${schedule.authorName}` : ""
    }`;

  // Get Content PC names - format as "#1, #2" if multiple
  const getContentPcNames = () => {
    if (!schedule.contentPcId) return "미할당";
    const pc = contentPcs.find((p) => p.id === schedule.contentPcId);
    if (!pc) return "할당됨";
    // Extract number from name (e.g., "Content PC #1" -> "#1")
    const match = pc.name.match(/#(\d+)/);
    return match ? `#${match[1]}` : pc.name;
  };

  const contentPcDisplay = getContentPcNames();

  // Format play count with commas
  const formatPlayCount = (count?: number) => {
    if (count === undefined || count === null) return "0회";
    return `${count.toLocaleString("ko-KR")}회`;
  };

  return (
    <div
      className={cn(
        "rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200",
        isActive ? "bg-gray-50 border-l-4" : "bg-white"
      )}
      style={{
        backgroundColor: "rgb(248, 249, 250)",
        borderLeftColor: "rgb(52, 152, 219)",
        borderLeftWidth: "4px",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">
            {scheduleTitle}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Content PC {contentPcDisplay}
          </p>
        </div>
        <div>{getStatusBadge(schedule.status)}</div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 w-24">시작 시간:</span>
          <span className="text-sm font-medium text-gray-800">
            {formatDateTime(schedule.displayStart)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 w-24">종료 시간:</span>
          <span className="text-sm font-medium text-gray-800">
            {formatDateTime(schedule.displayEnd)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 w-24">재생 횟수:</span>
          <span className="text-sm font-medium text-gray-800">
            {formatPlayCount(schedule.playCount)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 w-24">우선순위:</span>
          <span className="text-sm font-medium text-gray-800">
            {getPriorityText(schedule.priority)}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-purple-500 hover:bg-purple-600 text-white"
          onClick={() => onViewDetails?.(schedule.id)}
        >
          <i className="fas fa-eye mr-1"></i>
          상세보기
        </Button>
        {/* Active schedules: show 수정 and 중지 */}
        {(schedule.status === "playing" || schedule.status === "scheduled") && (
          <>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => onEdit?.(schedule.id)}
            >
              <i className="fas fa-edit mr-1"></i>
              수정
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => onStop?.(schedule.id)}
            >
              <i className="fas fa-stop mr-1"></i>
              중지
            </Button>
          </>
        )}
        {/* Stopped/Completed schedules: show 재실행 and 삭제 */}
        {(schedule.status === "completed" ||
          schedule.status === "cancelled") && (
          <>
            <Button
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={() => onRestart?.(schedule.id)}
            >
              <i className="fas fa-redo mr-1"></i>
              재실행
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => onDelete?.(schedule.id)}
            >
              <i className="fas fa-trash mr-1"></i>
              삭제
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
