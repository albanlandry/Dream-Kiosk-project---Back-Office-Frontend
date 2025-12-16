/**
 * Tests for Dashboard WebSocket Client
 * Tests WebSocket connection, event handling, and room management
 */

import { DashboardWebSocketClient } from '@/lib/api/dashboard-websocket';
import Cookies from 'js-cookie';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };

  return {
    io: jest.fn(() => mockSocket),
  };
});

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

import { io } from 'socket.io-client';

const mockedIo = io as jest.MockedFunction<typeof io>;
const mockedCookies = Cookies as jest.Mocked<typeof Cookies>;

describe('DashboardWebSocketClient', () => {
  let client: DashboardWebSocketClient;
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: false,
    };
    mockedIo.mockReturnValue(mockSocket as any);
    mockedCookies.get.mockReturnValue('mock-token');
  });

  afterEach(() => {
    if (client) {
      client.disconnect();
    }
  });

  describe('Connection', () => {
    it('should connect to dashboard WebSocket namespace', () => {
      client = new DashboardWebSocketClient();

      expect(mockedIo).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard'),
        expect.objectContaining({
          auth: { token: 'mock-token' },
          transports: ['websocket', 'polling'],
          reconnection: true,
        })
      );
    });

    it('should not connect if no auth token', () => {
      mockedCookies.get.mockReturnValue(undefined);

      client = new DashboardWebSocketClient();

      expect(mockedIo).not.toHaveBeenCalled();
    });

    it('should setup event handlers on connection', () => {
      client = new DashboardWebSocketClient();

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    });

    it('should register server event listeners', () => {
      client = new DashboardWebSocketClient();

      const serverEvents = [
        'dashboard_connected',
        'dashboard_update',
        'schedule_status_update',
        'schedule_created',
        'schedule_updated',
        'schedule_deleted',
        'content_pc_status_update',
        'content_pc_created',
        'content_pc_updated',
        'content_pc_deleted',
        'statistics_updated',
      ];

      serverEvents.forEach((event) => {
        expect(mockSocket.on).toHaveBeenCalledWith(event, expect.any(Function));
      });
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      client = new DashboardWebSocketClient();
    });

    it('should emit dashboard_connected event on connect', () => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connect'
      )?.[1];

      expect(connectHandler).toBeDefined();

      const mockEmit = jest.fn();
      client['emit'] = mockEmit;

      connectHandler();

      expect(mockEmit).toHaveBeenCalledWith('dashboard_connected', {});
    });

    it('should emit dashboard_disconnected event on disconnect', () => {
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'disconnect'
      )?.[1];

      expect(disconnectHandler).toBeDefined();

      const mockEmit = jest.fn();
      client['emit'] = mockEmit;

      disconnectHandler();

      expect(mockEmit).toHaveBeenCalledWith('dashboard_disconnected', {});
    });

    it('should handle event listeners', () => {
      const callback = jest.fn();
      const unsubscribe = client.on('dashboard_update', callback);

      expect(typeof unsubscribe).toBe('function');

      // Simulate event
      const updateHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'dashboard_update'
      )?.[1];

      const mockEmit = jest.fn();
      client['emit'] = mockEmit;

      updateHandler({ data: 'test' });
      expect(mockEmit).toHaveBeenCalledWith('dashboard_update', { data: 'test' });
    });

    it('should remove event listener on unsubscribe', () => {
      const callback = jest.fn();
      const unsubscribe = client.on('dashboard_update', callback);

      unsubscribe();

      // Listener should be removed
      const mockEmit = jest.fn();
      client['emit'] = mockEmit;

      const updateHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'dashboard_update'
      )?.[1];

      updateHandler({ data: 'test' });
      expect(mockEmit).toHaveBeenCalledWith('dashboard_update', { data: 'test' });
    });
  });

  describe('Room Management', () => {
    beforeEach(() => {
      client = new DashboardWebSocketClient();
      mockSocket.connected = true;
    });

    it('should join project room', () => {
      client.joinProjectRoom('project-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('join_project', {
        projectId: 'project-123',
      });
    });

    it('should leave project room', () => {
      client.leaveProjectRoom('project-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('leave_project', {
        projectId: 'project-123',
      });
    });
  });

  describe('Connection Status', () => {
    it('should return connection status', () => {
      client = new DashboardWebSocketClient();

      mockSocket.connected = true;
      expect(client.isConnected()).toBe(true);

      mockSocket.connected = false;
      expect(client.isConnected()).toBe(false);
    });
  });

  describe('Disconnection', () => {
    it('should disconnect socket and clear listeners', () => {
      client = new DashboardWebSocketClient();
      client.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });
});

