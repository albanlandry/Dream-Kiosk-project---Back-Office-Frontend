'use client';

import { useEffect, useState } from 'react';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Archive, Download, RefreshCw, Trash2 } from 'lucide-react';
import { activityLogsApi } from '@/lib/api/activity-logs';
import { useToastStore } from '@/lib/store/toastStore';

export default function ActivityLogsArchivePage() {
  useRoutePermission('activity_logs:archive', '/dashboard');
  const { showSuccess, showError } = useToastStore();

  const [retentionDays, setRetentionDays] = useState(90);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archives, setArchives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadArchives = async () => {
    try {
      setIsLoading(true);
      const response = await activityLogsApi.listArchives();
      setArchives(response.archives || []);
    } catch (error: any) {
      console.error('Failed to load archives:', error);
      showError('아카이브 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchives();
  }, []);

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${apiUrl}/api/v1/activity-logs/archive/s3?olderThanDays=${retentionDays}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Archive failed');
      }
      
      const result = await response.json();
      showSuccess(`아카이브가 완료되었습니다: ${result.data?.archived || 0}개 로그`);
      await loadArchives();
    } catch (error: any) {
      console.error('Archive failed:', error);
      showError(error.message || '아카이브에 실패했습니다');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="아카이브 관리"
        description="오래된 로그를 S3에 아카이브하고 관리할 수 있습니다"
        action={
          <Button onClick={loadArchives} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>새 아카이브 생성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>보관 기간 (일)</Label>
            <Input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value) || 90)}
              min={1}
              max={365}
            />
            <p className="text-sm text-muted-foreground">
              {retentionDays}일 이전의 로그가 아카이브됩니다
            </p>
          </div>

          <Button onClick={handleArchive} disabled={isArchiving} className="w-full">
            <Archive className="h-4 w-4 mr-2" />
            {isArchiving ? '아카이브 중...' : '아카이브 시작'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>아카이브 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : archives.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              아카이브된 로그가 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {archives.map((archive, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="text-sm font-mono">{archive}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      다운로드
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

