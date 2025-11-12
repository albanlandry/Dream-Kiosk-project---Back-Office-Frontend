'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { Image as ImageIcon, Video, CheckCircle, XCircle, Clock } from 'lucide-react';

export function StatisticsCards() {
  const { data, isLoading, error } = useStatistics();

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Failed to load statistics
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Images',
      value: data?.images.total ?? 0,
      icon: ImageIcon,
      color: 'text-blue-600',
    },
    {
      title: 'Active Images',
      value: data?.images.active ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Total Videos',
      value: data?.videos.total ?? 0,
      icon: Video,
      color: 'text-purple-600',
    },
    {
      title: 'Processing',
      value: data?.videos.processing ?? 0,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Ready',
      value: data?.videos.ready ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Failed',
      value: data?.videos.failed ?? 0,
      icon: XCircle,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

