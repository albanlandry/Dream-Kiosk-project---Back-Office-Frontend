'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ActivityLog } from '@/lib/api/activity-logs';
import { formatRelativeTime } from '@/lib/utils/activity-formatter';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface ActivityLogDetailModalProps {
  log: ActivityLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DetailRowProps {
  label: string;
  value: any;
  copyable?: boolean;
}

function DetailRow({ label, value, copyable = false }: DetailRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value === null || value === undefined) return;
    const textToCopy = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  const displayValue = formatValue(value);

  return (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
          <dd className="text-sm text-gray-900 break-words whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded">
            {displayValue}
          </dd>
        </div>
        {copyable && value !== null && value !== undefined && (
          <button
            onClick={handleCopy}
            className="mt-5 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="복사"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

const levelColors = {
  critical: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
  warn: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  debug: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export function ActivityLogDetailModal({ log, open, onOpenChange }: ActivityLogDetailModalProps) {
  if (!log) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">활동 로그 상세 정보</DialogTitle>
          <DialogDescription>로그 ID: {log.id}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* 기본 정보 */}
          <Section title="기본 정보">
            <DetailRow label="카테고리" value={log.category} />
            <DetailRow label="액션" value={log.action} />
            {log.subCategory && <DetailRow label="서브 카테고리" value={log.subCategory} />}
            <div className="py-2 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500 mb-1">레벨</dt>
              <dd>
                <span className={cn('inline-flex px-2 py-1 text-xs font-semibold rounded', levelColors[log.level])}>
                  {log.level}
                </span>
              </dd>
            </div>
            <div className="py-2 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500 mb-1">상태</dt>
              <dd>
                <span className={cn('inline-flex px-2 py-1 text-xs font-semibold rounded', statusColors[log.status])}>
                  {log.status}
                </span>
              </dd>
            </div>
            {log.description && <DetailRow label="설명" value={log.description} copyable />}
          </Section>

          {/* 타임스탬프 */}
          <Section title="타임스탬프">
            <DetailRow label="생성 시간" value={formatDate(log.createdAt)} copyable />
            {log.occurredAt && <DetailRow label="발생 시간" value={formatDate(log.occurredAt)} copyable />}
            <DetailRow label="상대 시간" value={formatRelativeTime(log.createdAt)} />
          </Section>

          {/* 액터 정보 */}
          {(log.userId || log.adminId || log.sessionId) && (
            <Section title="액터 정보">
              {log.userId && <DetailRow label="사용자 ID" value={log.userId} copyable />}
              {log.adminId && <DetailRow label="관리자 ID" value={log.adminId} copyable />}
              {log.sessionId && <DetailRow label="세션 ID" value={log.sessionId} copyable />}
            </Section>
          )}

          {/* 디바이스 정보 */}
          {(log.kioskId ||
            log.contentPcId ||
            log.ipAddress ||
            log.userAgent ||
            log.deviceId ||
            log.deviceType ||
            log.location) && (
            <Section title="디바이스 정보">
              {log.kioskId && <DetailRow label="키오스크 ID" value={log.kioskId} copyable />}
              {log.contentPcId && <DetailRow label="콘텐츠 PC ID" value={log.contentPcId} copyable />}
              {log.ipAddress && <DetailRow label="IP 주소" value={log.ipAddress} copyable />}
              {log.userAgent && <DetailRow label="User Agent" value={log.userAgent} copyable />}
              {log.deviceId && <DetailRow label="디바이스 ID" value={log.deviceId} copyable />}
              {log.deviceType && <DetailRow label="디바이스 타입" value={log.deviceType} />}
              {log.location && <DetailRow label="위치" value={log.location} />}
            </Section>
          )}

          {/* 리소스 정보 */}
          {(log.resourceType || log.resourceId || log.resourceMetadata) && (
            <Section title="리소스 정보">
              {log.resourceType && <DetailRow label="리소스 타입" value={log.resourceType} />}
              {log.resourceId && <DetailRow label="리소스 ID" value={log.resourceId} copyable />}
              {log.resourceMetadata && <DetailRow label="리소스 메타데이터" value={log.resourceMetadata} copyable />}
            </Section>
          )}

          {/* 상태 변경 */}
          {(log.beforeState || log.afterState) && (
            <Section title="상태 변경">
              {log.beforeState && <DetailRow label="이전 상태" value={log.beforeState} copyable />}
              {log.afterState && <DetailRow label="이후 상태" value={log.afterState} copyable />}
            </Section>
          )}

          {/* 성능 메트릭 */}
          {(log.durationMs !== undefined || log.responseSize !== undefined || log.requestSize !== undefined) && (
            <Section title="성능 메트릭">
              {log.durationMs !== undefined && (
                <DetailRow label="소요 시간" value={`${log.durationMs}ms`} />
              )}
              {log.responseSize !== undefined && (
                <DetailRow label="응답 크기" value={`${(log.responseSize / 1024).toFixed(2)} KB`} />
              )}
              {log.requestSize !== undefined && (
                <DetailRow label="요청 크기" value={`${(log.requestSize / 1024).toFixed(2)} KB`} />
              )}
            </Section>
          )}

          {/* 에러 정보 */}
          {log.errorDetails && (
            <Section title="에러 정보">
              {log.errorDetails.code && <DetailRow label="에러 코드" value={log.errorDetails.code} copyable />}
              {log.errorDetails.message && <DetailRow label="에러 메시지" value={log.errorDetails.message} copyable />}
              {log.errorDetails.stack && <DetailRow label="스택 트레이스" value={log.errorDetails.stack} copyable />}
              {log.errorDetails.context && <DetailRow label="에러 컨텍스트" value={log.errorDetails.context} copyable />}
            </Section>
          )}

          {/* 메타데이터 */}
          {log.metadata && (
            <Section title="메타데이터">
              <DetailRow label="메타데이터" value={log.metadata} copyable />
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

