/**
 * Utility functions for formatting activity logs for display
 * Optimized for performance with memoization-friendly functions
 */

import { ActivityLog } from '@/lib/api/activity-logs';

export interface FormattedActivity {
  id?: string; // Original log ID for React key
  icon: string;
  title: string;
  description: string;
  time: string;
  color: string;
  borderColor: string;
}

/**
 * Format time to relative time (e.g., "2분 전", "1시간 전")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const activityDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - activityDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return '방금 전';
  } else if (diffMins < 60) {
    return `${diffMins}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return activityDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Get icon and color based on activity category and action
 */
function getActivityIconAndColor(log: ActivityLog): {
  icon: string;
  color: string;
  borderColor: string;
} {
  const { category, action, level, status } = log;

  // Error/Warning activities
  if (level === 'error' || level === 'critical' || status === 'failed') {
    return {
      icon: 'fas fa-exclamation-triangle',
      color: 'bg-red-500',
      borderColor: 'border-red-500',
    };
  }

  // Category-based icons
  switch (category) {
    case 'payment':
      if (action.includes('refund')) {
        return {
          icon: 'fas fa-undo',
          color: 'bg-orange-500',
          borderColor: 'border-orange-500',
        };
      }
      return {
        icon: 'fas fa-credit-card',
        color: 'bg-green-500',
        borderColor: 'border-green-500',
      };

    case 'content':
      if (action.includes('video')) {
        return {
          icon: 'fas fa-video',
          color: 'bg-purple-500',
          borderColor: 'border-purple-500',
        };
      }
      if (action.includes('image')) {
        return {
          icon: 'fas fa-image',
          color: 'bg-blue-500',
          borderColor: 'border-blue-500',
        };
      }
      if (action.includes('animal')) {
        return {
          icon: 'fas fa-paw',
          color: 'bg-yellow-500',
          borderColor: 'border-yellow-500',
        };
      }
      return {
        icon: 'fas fa-file',
        color: 'bg-blue-500',
        borderColor: 'border-blue-500',
      };

    case 'admin':
      if (action.includes('project')) {
        return {
          icon: 'fas fa-folder',
          color: 'bg-indigo-500',
          borderColor: 'border-indigo-500',
        };
      }
      if (action.includes('kiosk')) {
        return {
          icon: 'fas fa-desktop',
          color: 'bg-teal-500',
          borderColor: 'border-teal-500',
        };
      }
      if (action.includes('content-pc')) {
        return {
          icon: 'fas fa-server',
          color: 'bg-cyan-500',
          borderColor: 'border-cyan-500',
        };
      }
      return {
        icon: 'fas fa-cog',
        color: 'bg-gray-500',
        borderColor: 'border-gray-500',
      };

    case 'security':
      return {
        icon: 'fas fa-shield-alt',
        color: 'bg-red-600',
        borderColor: 'border-red-600',
      };

    case 'system':
      return {
        icon: 'fas fa-tasks',
        color: 'bg-slate-500',
        borderColor: 'border-slate-500',
      };

    default:
      return {
        icon: 'fas fa-info-circle',
        color: 'bg-blue-500',
        borderColor: 'border-blue-500',
      };
  }
}

/**
 * Format activity log title based on action
 */
function formatActivityTitle(log: ActivityLog): string {
  const { action, category } = log;

  // Map common actions to Korean titles
  const actionMap: Record<string, string> = {
    // Payment actions
    'payment.created': '결제 생성',
    'payment.confirmed': '결제 완료',
    'payment.refunded.full': '전액 환불',
    'payment.refunded.partial': '부분 환불',
    'payment.cancelled': '결제 취소',
    'payment.callback.received': '결제 콜백 수신',

    // Content actions
    'video.created': '비디오 생성',
    'video.deleted': '비디오 삭제',
    'video.status_changed': '비디오 상태 변경',
    'video.qr_code.generated': 'QR 코드 생성',
    'image.uploaded': '이미지 업로드',
    'image.deleted': '이미지 삭제',
    'image.proposal_photo.uploaded': '제안 사진 업로드',
    'image.status_changed': '이미지 상태 변경',
    'animal.created': '동물 정보 생성',
    'animal.updated': '동물 정보 수정',
    'animal.deleted': '동물 정보 삭제',

    // Admin actions
    'project.created': '프로젝트 생성',
    'project.updated': '프로젝트 수정',
    'project.deleted': '프로젝트 삭제',
    'project.paused': '프로젝트 일시정지',
    'project.resumed': '프로젝트 재개',
    'project.stopped': '프로젝트 종료',
    'kiosk.created': '키오스크 등록',
    'kiosk.updated': '키오스크 수정',
    'kiosk.deleted': '키오스크 삭제',
    'kiosk.status_changed': '키오스크 상태 변경',
    'content-pc.created': 'Content PC 생성',
    'content-pc.updated': 'Content PC 수정',
    'content-pc.deleted': 'Content PC 삭제',
    'content-pc.started': 'Content PC 시작',
    'content-pc.restarted': 'Content PC 재시작',
    'content-pc.settings.updated': 'Content PC 설정 변경',
    'content-pc:repair-requested': 'Content PC 수리 요청',

    // Security actions
    'api-key.created': 'API 키 생성',
    'api-key.updated': 'API 키 수정',
    'api-key.deleted': 'API 키 삭제',
    'role.created': '역할 생성',
    'role.updated': '역할 수정',
    'role.deleted': '역할 삭제',
    'permission.created': '권한 생성',
    'permission.updated': '권한 수정',
    'permission.deleted': '권한 삭제',

    // Settings actions
    'settings.updated': '설정 변경',
    'settings.exported': '설정 내보내기',
    'settings.imported': '설정 가져오기',
    'settings.backup.created': '설정 백업 생성',
    'settings.backup.restored': '설정 백업 복원',
    'settings.version.created': '설정 버전 생성',
    'settings.version.rolled_back': '설정 버전 롤백',

    // System actions
    'job.content_cleanup.completed': '콘텐츠 정리 완료',
    'job.content_cleanup.failed': '콘텐츠 정리 실패',
    'job.schedule_cleanup.completed': '스케줄 정리 완료',
    'job.schedule_cleanup.failed': '스케줄 정리 실패',
    'job.schedule_sync.completed': '스케줄 동기화 완료',
    'job.schedule_sync.failed': '스케줄 동기화 실패',
  };

  return actionMap[action] || action.replace(/\./g, ' ').replace(/_/g, ' ');
}

/**
 * Format activity log description
 */
function formatActivityDescription(log: ActivityLog): string {
  const { action, details, metadata, resourceType, resourceId, category } = log;

  // Try to extract meaningful description from details/metadata
  if (details) {
    if (typeof details === 'object') {
      // Payment descriptions
      if (action.includes('payment')) {
        const amount = details.amount || details.refundAmount;
        if (amount) {
          return `₩${Number(amount).toLocaleString()}`;
        }
      }

      // Project descriptions
      if (action.includes('project')) {
        const projectName = details.projectName || metadata?.projectName;
        if (projectName) {
          return `프로젝트: ${projectName}`;
        }
      }

      // Kiosk descriptions
      if (action.includes('kiosk')) {
        const kioskName = details.kioskName || metadata?.kioskName;
        if (kioskName) {
          return `키오스크: ${kioskName}`;
        }
      }

      // Content PC descriptions
      if (action.includes('content-pc')) {
        const pcName = details.name || details.pcName || metadata?.name;
        if (pcName) {
          return `Content PC: ${pcName}`;
        }
      }

      // Video descriptions
      if (action.includes('video')) {
        const userName = details.userName || metadata?.userName;
        if (userName) {
          return `사용자: ${userName}`;
        }
      }

      // Generic resource descriptions
      if (resourceType && resourceId) {
        return `${resourceType}: ${resourceId.substring(0, 8)}...`;
      }
    } else if (typeof details === 'string') {
      return details;
    }
  }

  // Fallback to description field
  if (log.description) {
    return log.description;
  }

  // Final fallback
  return `${category} 작업 수행`;
}

/**
 * Format activity log for display in dashboard
 */
export function formatActivityLog(log: ActivityLog): FormattedActivity {
  const { icon, color, borderColor } = getActivityIconAndColor(log);
  const title = formatActivityTitle(log);
  const description = formatActivityDescription(log);
  const time = formatRelativeTime(log.occurredAt || log.createdAt);

  return {
    id: log.id, // Include original log ID for React key
    icon,
    title,
    description,
    time,
    color,
    borderColor,
  };
}

/**
 * Format multiple activity logs
 */
export function formatActivityLogs(logs: ActivityLog[]): FormattedActivity[] {
  return logs.map(formatActivityLog);
}

