'use client';

import { useEffect, useRef, useState } from 'react';
import { DashboardWebSocketClient } from '@/lib/api/dashboard-websocket';
import { useQueryClient } from '@tanstack/react-query';

export function useDashboardWebSocket(projectId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<DashboardWebSocketClient | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const client = new DashboardWebSocketClient();
    clientRef.current = client;

    const handleConnect = () => {
      setIsConnected(true);
      if (projectId) {
        client.joinProjectRoom(projectId);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleStatisticsUpdate = (data: any) => {
      // Invalidate statistics query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    };

    const handleDashboardUpdate = (data: any) => {
      // Invalidate statistics query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    };

    client.on('dashboard_connected', handleConnect);
    client.on('dashboard_disconnected', handleDisconnect);
    client.on('statistics_updated', handleStatisticsUpdate);
    client.on('dashboard_update', handleDashboardUpdate);

    // Join project room if projectId is provided
    if (projectId && client.isConnected()) {
      client.joinProjectRoom(projectId);
    }

    return () => {
      client.off('dashboard_connected', handleConnect);
      client.off('dashboard_disconnected', handleDisconnect);
      client.off('statistics_updated', handleStatisticsUpdate);
      client.off('dashboard_update', handleDashboardUpdate);
      if (projectId) {
        client.leaveProjectRoom(projectId);
      }
      client.disconnect();
    };
  }, [projectId, queryClient]);

  // Update project room when projectId changes
  useEffect(() => {
    if (clientRef.current && isConnected) {
      if (projectId) {
        clientRef.current.joinProjectRoom(projectId);
      }
    }
  }, [projectId, isConnected]);

  return { isConnected };
}

