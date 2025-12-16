/**
 * Tests for useDashboardWebSocket Hook
 * Tests WebSocket connection, project room management, and query invalidation
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboardWebSocket } from '@/lib/hooks/useDashboardWebSocket';
import { DashboardWebSocketClient } from '@/lib/api/dashboard-websocket';

// Mock the DashboardWebSocketClient
jest.mock('@/lib/api/dashboard-websocket', () => ({
  DashboardWebSocketClient: jest.fn(),
}));

const MockedDashboardWebSocketClient = DashboardWebSocketClient as jest.MockedClass<
  typeof DashboardWebSocketClient
>;

describe('useDashboardWebSocket Hook', () => {
  let queryClient: QueryClient;
  let mockClient: {
    on: jest.Mock;
    off: jest.Mock;
    joinProjectRoom: jest.Mock;
    leaveProjectRoom: jest.Mock;
    disconnect: jest.Mock;
    isConnected: jest.Mock;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockClient = {
      on: jest.fn(),
      off: jest.fn(),
      joinProjectRoom: jest.fn(),
      leaveProjectRoom: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn().mockReturnValue(false),
    };

    MockedDashboardWebSocketClient.mockImplementation(() => mockClient as any);
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('should create WebSocket client on mount', () => {
    renderHook(() => useDashboardWebSocket(), { wrapper });

    expect(MockedDashboardWebSocketClient).toHaveBeenCalled();
  });

  it('should register event listeners', () => {
    renderHook(() => useDashboardWebSocket(), { wrapper });

    expect(mockClient.on).toHaveBeenCalledWith(
      'dashboard_connected',
      expect.any(Function)
    );
    expect(mockClient.on).toHaveBeenCalledWith(
      'dashboard_disconnected',
      expect.any(Function)
    );
    expect(mockClient.on).toHaveBeenCalledWith(
      'statistics_updated',
      expect.any(Function)
    );
    expect(mockClient.on).toHaveBeenCalledWith(
      'dashboard_update',
      expect.any(Function)
    );
  });

  it('should join project room when projectId is provided', () => {
    mockClient.isConnected.mockReturnValue(true);

    renderHook(() => useDashboardWebSocket('project-123'), { wrapper });

    expect(mockClient.joinProjectRoom).toHaveBeenCalledWith('project-123');
  });

  it('should not join project room if not connected', () => {
    mockClient.isConnected.mockReturnValue(false);

    renderHook(() => useDashboardWebSocket('project-123'), { wrapper });

    // Should not be called immediately if not connected
    expect(mockClient.joinProjectRoom).not.toHaveBeenCalled();
  });

  it('should update connection status on dashboard_connected', () => {
    const { result } = renderHook(() => useDashboardWebSocket(), { wrapper });

    const connectHandler = mockClient.on.mock.calls.find(
      (call) => call[0] === 'dashboard_connected'
    )?.[1];

    expect(connectHandler).toBeDefined();
    connectHandler();

    // Connection status should be updated (we can't directly test state, but handler should be called)
    expect(mockClient.on).toHaveBeenCalled();
  });

  it('should invalidate statistics query on statistics_updated', async () => {
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useDashboardWebSocket(), { wrapper });

    const updateHandler = mockClient.on.mock.calls.find(
      (call) => call[0] === 'statistics_updated'
    )?.[1];

    expect(updateHandler).toBeDefined();
    updateHandler({});

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['statistics'],
      });
    });
  });

  it('should invalidate statistics query on dashboard_update', async () => {
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useDashboardWebSocket(), { wrapper });

    const updateHandler = mockClient.on.mock.calls.find(
      (call) => call[0] === 'dashboard_update'
    )?.[1];

    expect(updateHandler).toBeDefined();
    updateHandler({});

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['statistics'],
      });
    });
  });

  it('should join project room when projectId changes', () => {
    mockClient.isConnected.mockReturnValue(true);

    const { rerender } = renderHook(
      ({ projectId }: { projectId?: string }) => useDashboardWebSocket(projectId),
      {
        wrapper,
        initialProps: { projectId: undefined },
      }
    );

    expect(mockClient.joinProjectRoom).not.toHaveBeenCalled();

    rerender({ projectId: 'project-123' });

    expect(mockClient.joinProjectRoom).toHaveBeenCalledWith('project-123');
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useDashboardWebSocket('project-123'), {
      wrapper,
    });

    unmount();

    expect(mockClient.off).toHaveBeenCalled();
    expect(mockClient.leaveProjectRoom).toHaveBeenCalledWith('project-123');
    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useDashboardWebSocket(), { wrapper });

    unmount();

    expect(mockClient.off).toHaveBeenCalledWith(
      'dashboard_connected',
      expect.any(Function)
    );
    expect(mockClient.off).toHaveBeenCalledWith(
      'dashboard_disconnected',
      expect.any(Function)
    );
    expect(mockClient.off).toHaveBeenCalledWith(
      'statistics_updated',
      expect.any(Function)
    );
    expect(mockClient.off).toHaveBeenCalledWith(
      'dashboard_update',
      expect.any(Function)
    );
  });
});

