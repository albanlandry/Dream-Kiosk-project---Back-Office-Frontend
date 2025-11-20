import { io, Socket } from 'socket.io-client';

// Extract base URL from API URL (remove /api/v1)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const WS_BASE_URL = API_BASE_URL.replace('/api/v1', '') || 'http://localhost:3000';

export interface WebSocketEvent {
  event: string;
  sessionId?: string;
  [key: string]: any;
}

export class KioskWebSocketClient {
  private socket: Socket | null = null;
  private kioskId: string | null = null;
  private sessionId: string | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(kioskId: string, token: string) {
    this.kioskId = kioskId;
    this.connect(token);
  }

  private connect(token: string) {
    this.socket = io(`${WS_BASE_URL}/kiosk`, {
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
      console.log('WebSocket connected');
      this.emit('kiosk_connected', { kioskId: this.kioskId });
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.emit('kiosk_disconnected', {});
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('error', { code: 'CONNECTION_ERROR', message: error.message });
    });

    // Register all server events
    const serverEvents = [
      'kiosk_connected',
      'kiosk_disconnected',
      'session_created',
      'state_transition',
      'payment_qr_generated',
      'payment_status_updated',
      'video_generation_progress',
      'video_generation_completed',
      'ticket_generated',
      'session_completed',
      'error',
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

  // Client event emitters
  personDetected(confidence?: number) {
    this.socket?.emit('person_detected', {
      event: 'person_detected',
      kioskId: this.kioskId,
      confidence,
    });
  }

  motionCompleted(motionData?: Record<string, any>) {
    if (!this.sessionId) return;
    this.socket?.emit('motion_completed', {
      event: 'motion_completed',
      sessionId: this.sessionId,
      motionData,
    });
  }

  animalSelected(animalId: string) {
    if (!this.sessionId) return;
    this.socket?.emit('animal_selected', {
      event: 'animal_selected',
      sessionId: this.sessionId,
      animalId,
    });
  }

  userInputSubmitted(userName: string, userMessage: string) {
    if (!this.sessionId) return;
    this.socket?.emit('user_input_submitted', {
      event: 'user_input_submitted',
      sessionId: this.sessionId,
      userName,
      userMessage,
    });
  }

  durationSelected(duration: '1_day' | '30_days' | '6_months' | '1_year') {
    if (!this.sessionId) return;
    this.socket?.emit('duration_selected', {
      event: 'duration_selected',
      sessionId: this.sessionId,
      duration,
    });
  }

  paymentMethodSelected(paymentMethod: 'mobile_qr' | 'credit_card') {
    if (!this.sessionId) return;
    this.socket?.emit('payment_method_selected', {
      event: 'payment_method_selected',
      sessionId: this.sessionId,
      paymentMethod,
    });
  }

  paymentCompleted(transactionId: string, status: 'completed' | 'failed') {
    if (!this.sessionId) return;
    this.socket?.emit('payment_completed', {
      event: 'payment_completed',
      sessionId: this.sessionId,
      transactionId,
      status,
    });
  }

  videoTemplateSelected(templateId: string) {
    if (!this.sessionId) return;
    this.socket?.emit('video_template_selected', {
      event: 'video_template_selected',
      sessionId: this.sessionId,
      templateId,
    });
  }

  ticketQrDownloaded() {
    if (!this.sessionId) return;
    this.socket?.emit('ticket_qr_downloaded', {
      event: 'ticket_qr_downloaded',
      sessionId: this.sessionId,
    });
  }

  sessionCancelled(reason?: string) {
    if (!this.sessionId) return;
    this.socket?.emit('session_cancelled', {
      event: 'session_cancelled',
      sessionId: this.sessionId,
      reason,
    });
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  getSessionId(): string | null {
    return this.sessionId;
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

