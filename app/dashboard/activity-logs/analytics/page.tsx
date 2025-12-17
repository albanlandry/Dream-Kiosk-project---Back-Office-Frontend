'use client';

import { useEffect, useState } from 'react';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, AlertCircle, Clock, Activity } from 'lucide-react';
import { activityLogsApi } from '@/lib/api/activity-logs';
import { useToastStore } from '@/lib/store/toastStore';

export default function ActivityLogsAnalyticsPage() {
  useRoutePermission('activity_logs:read', '/dashboard');
  const { showError } = useToastStore();

  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await activityLogsApi.getStatistics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      setStatistics(stats);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
      showError('통계를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header title="통계 및 분석" description="활동 로그 통계 및 분석 데이터" />
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="통계 및 분석"
        description="활동 로그 통계 및 분석 데이터를 확인할 수 있습니다"
        action={
          <Button onClick={loadStatistics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 로그</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total || 0}</div>
            <p className="text-xs text-muted-foreground">총 로그 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">에러 로그</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics?.byLevel?.ERROR || 0}
            </div>
            <p className="text-xs text-muted-foreground">에러 발생 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics?.byStatus?.SUCCESS
                ? Math.round(
                    (statistics.byStatus.SUCCESS / statistics.total) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">성공 비율</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">경고 로그</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics?.byLevel?.WARN || 0}
            </div>
            <p className="text-xs text-muted-foreground">경고 발생 수</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {statistics?.byCategory ? (
              <div className="space-y-2">
                {Object.entries(statistics.byCategory).map(([category, count]: [string, any]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>레벨별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {statistics?.byLevel ? (
              <div className="space-y-2">
                {Object.entries(statistics.byLevel).map(([level, count]: [string, any]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{level}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

