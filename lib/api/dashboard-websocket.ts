import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const WS_BASE_URL = API_BASE_URL.replace('/api/v1', '') || 'http://localhost:3000';

export interface DashboardWebSocketEvent {
  event: string;
  [key: string]: any;
}

export class DashboardWebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    const token = Cookies.get('auth-token');
    if (!token) {
      console.warn('No auth token found, cannot connect to dashboard WebSocket');
      return;
    }

    this.socket = io(`${WS_BASE_URL}/dashboard`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Dashboard WebSocket connected');
      this.emit('dashboard_connected', {});
    });

    this.socket.on('disconnect', () => {
      console.log('Dashboard WebSocket disconnected');
      this.emit('dashboard_disconnected', {});
    });

    this.socket.on('connect_error', (error) => {
      console.error('Dashboard WebSocket connection error:', error);
      this.emit('error', { code: 'CONNECTION_ERROR', message: error.message });
    });

    // Register all server events
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
      this.socket?.on(event, (data) => {
        this.emit(event, data);
      });
    });
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  joinProjectRoom(projectId: string) {
    this.socket?.emit('join_project', { projectId });
  }

  leaveProjectRoom(projectId: string) {
    this.socket?.emit('leave_project', { projectId });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

