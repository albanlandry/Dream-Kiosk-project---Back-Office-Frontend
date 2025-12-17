'use client';

import { useState } from 'react';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileJson, FileText, File } from 'lucide-react';
import { useToastStore } from '@/lib/store/toastStore';
import { cn } from '@/lib/utils/cn';

export default function ActivityLogsExportPage() {
  useRoutePermission('activity_logs:export', '/dashboard');
  const { showSuccess, showError } = useToastStore();

  const [format, setFormat] = useState<'csv' | 'json'>('json');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeErrorDetails, setIncludeErrorDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      params.append('format', format);
      if (includeMetadata) params.append('includeMetadata', 'true');
      if (includeErrorDetails) params.append('includeErrorDetails', 'true');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = `${apiUrl}/api/v1/activity-logs/export/sync/${format}?${params.toString()}`;
      
      // Create a temporary link to download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs.${format}`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('내보내기가 시작되었습니다');
    } catch (error) {
      console.error('Export failed:', error);
      showError('내보내기에 실패했습니다');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="로그 내보내기"
        description="활동 로그를 다양한 형식으로 내보낼 수 있습니다"
      />

      <Card>
        <CardHeader>
          <CardTitle>내보내기 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>파일 형식</Label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeMetadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              />
              <Label htmlFor="includeMetadata" className="cursor-pointer">
                메타데이터 포함
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeErrorDetails"
                checked={includeErrorDetails}
                onCheckedChange={(checked) => setIncludeErrorDetails(checked as boolean)}
              />
              <Label htmlFor="includeErrorDetails" className="cursor-pointer">
                에러 상세 정보 포함
              </Label>
            </div>
          </div>

          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? '내보내는 중...' : '내보내기'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비동기 내보내기</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            대용량 로그의 경우 비동기 내보내기를 사용하세요. 작업이 완료되면 알림을 받을 수 있습니다.
          </p>
          <Button variant="outline" disabled>
            <File className="h-4 w-4 mr-2" />
            비동기 내보내기 (곧 제공 예정)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

