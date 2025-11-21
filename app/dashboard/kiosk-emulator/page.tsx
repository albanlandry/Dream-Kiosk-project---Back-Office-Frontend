'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { kiosksApi } from '@/lib/api/kiosks';
import { animalsApi, type Animal } from '@/lib/api/animals';
import { KioskWebSocketClient } from '@/lib/api/websocket';
import { useToastStore } from '@/lib/store/toastStore';
import { cn } from '@/lib/utils/cn';

type SessionState =
  | 'initial'
  | 'motion_detection'
  | 'animal_selection'
  | 'user_input'
  | 'duration_selection'
  | 'payment_method'
  | 'mobile_payment'
  | 'card_payment'
  | 'video_template_selection'
  | 'video_generation'
  | 'final_preview'
  | 'completed'
  | 'cancelled';

interface Kiosk {
  id: string;
  name: string;
  location: string;
}

export default function KioskEmulatorPage() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedKioskId, setSelectedKioskId] = useState<string>('');
  const [kioskToken, setKioskToken] = useState<string>('');
  const [wsClient, setWsClient] = useState<KioskWebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentState, setCurrentState] = useState<SessionState>('initial');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>({});
  const [videoProgress, setVideoProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToastStore();
  const wsClientRef = useRef<KioskWebSocketClient | null>(null);
  
  // Generate dummy animal IDs (valid UUIDs) for testing
  const [dummyAnimalIds] = useState<string[]>(() => {
    return Array.from({ length: 4 }, () => crypto.randomUUID());
  });

  // Load kiosks
  useEffect(() => {
    const loadKiosks = async () => {
      try {
        const apiKiosks = await kiosksApi.getAll();
        setKiosks(
          apiKiosks.map((k) => ({
            id: k.id,
            name: k.name,
            location: k.location,
          })),
        );
      } catch (error) {
        console.error('Failed to load kiosks:', error);
        showError('키오스크 목록을 불러오는데 실패했습니다.');
      }
    };
    loadKiosks();
  }, [showError]);

  // Load animals
  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const apiAnimals = await animalsApi.getAll();
        setAnimals(apiAnimals.filter((a) => a.isActive));
      } catch (error) {
        console.error('Failed to load animals:', error);
        // Don't show error for animals, just use empty array
        setAnimals([]);
      }
    };
    loadAnimals();
  }, []);

  // Connect WebSocket
  const handleConnect = useCallback(() => {
    if (!selectedKioskId || !kioskToken) {
      showError('키오스크 ID와 토큰을 입력해주세요.');
      return;
    }

    try {
      const client = new KioskWebSocketClient(selectedKioskId, kioskToken);
      wsClientRef.current = client;

      // Setup event listeners
      client.on('kiosk_connected', () => {
        setIsConnected(true);
        setError(null);
        showSuccess('WebSocket 연결 성공');
      });

      client.on('kiosk_disconnected', () => {
        setIsConnected(false);
        showError('WebSocket 연결이 끊어졌습니다.');
      });

      client.on('session_created', (data: any) => {
        setSessionId(data.sessionId);
        setCurrentState(data.state);
        client.setSessionId(data.sessionId);
        showSuccess(`세션이 생성되었습니다: ${data.sessionId}`);
      });

      client.on('state_transition', (data: any) => {
        setCurrentState(data.newState);
        setSessionData((prev: any) => ({ ...prev, ...data.data }));
        console.log('State transition:', data);
      });

      client.on('payment_qr_generated', (data: any) => {
        setSessionData((prev: any) => ({
          ...prev,
          paymentQrCode: data.qrCode,
          paymentUrl: data.paymentUrl,
        }));
        showSuccess('결제 QR 코드가 생성되었습니다.');
      });

      client.on('payment_status_updated', (data: any) => {
        setSessionData((prev: any) => ({
          ...prev,
          paymentStatus: data.status,
          transactionId: data.transactionId,
        }));
        if (data.status === 'completed') {
          showSuccess('결제가 완료되었습니다.');
        }
      });

      client.on('video_generation_progress', (data: any) => {
        setVideoProgress(data.progress);
        console.log('Video generation progress:', data);
      });

      client.on('video_generation_completed', (data: any) => {
        setSessionData((prev: any) => ({
          ...prev,
          videoUrl: data.videoUrl,
          thumbnailUrl: data.thumbnailUrl,
        }));
        setVideoProgress(100);
        showSuccess('비디오 생성이 완료되었습니다.');
      });

      client.on('ticket_generated', (data: any) => {
        setSessionData((prev: any) => ({
          ...prev,
          ticketId: data.ticketId,
          ticketPdfUrl: data.ticketPdfUrl,
          ticketQrCode: data.qrCode,
        }));
        showSuccess('입장권이 생성되었습니다.');
      });

      client.on('session_completed', (data: any) => {
        setCurrentState('completed');
        setSessionData((prev: any) => ({
          ...prev,
          ...data,
        }));
        showSuccess('세션이 완료되었습니다.');
      });

      client.on('error', (data: any) => {
        setError(`${data.code}: ${data.message}`);
        showError(`오류: ${data.message}`);
      });

      setWsClient(client);
    } catch (error: any) {
      showError(`연결 실패: ${error.message}`);
      setError(error.message);
    }
  }, [selectedKioskId, kioskToken, showSuccess, showError]);

  // Disconnect WebSocket
  const handleDisconnect = useCallback(() => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
      setWsClient(null);
      setIsConnected(false);
      setSessionId(null);
      setCurrentState('initial');
      setSessionData({});
      setVideoProgress(0);
      setError(null);
    }
  }, []);

  // Event handlers
  const handlePersonDetected = () => {
    wsClientRef.current?.personDetected(0.95);
  };

  const handleMotionCompleted = () => {
    wsClientRef.current?.motionCompleted();
  };

  const handleAnimalSelected = (animalId: string) => {
    wsClientRef.current?.animalSelected(animalId);
  };

  const handleUserInputSubmit = (userName: string, userMessage: string) => {
    wsClientRef.current?.userInputSubmitted(userName, userMessage);
  };

  const handleDurationSelected = (
    duration: '1_day' | '30_days' | '6_months' | '1_year',
  ) => {
    wsClientRef.current?.durationSelected(duration);
  };

  const handlePaymentMethodSelected = (method: 'mobile_qr' | 'credit_card') => {
    wsClientRef.current?.paymentMethodSelected(method);
  };

  const handlePaymentCompleted = () => {
    wsClientRef.current?.paymentCompleted('TXN' + Date.now(), 'completed');
  };

  const handleVideoTemplateSelected = (templateId: string) => {
    wsClientRef.current?.videoTemplateSelected(templateId);
  };

  const handleTicketQrDownloaded = () => {
    wsClientRef.current?.ticketQrDownloaded();
  };

  const handleSessionCancelled = () => {
    wsClientRef.current?.sessionCancelled('User cancelled');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="키오스크 에뮬레이터"
        description="키오스크 플로우 테스트 도구"
      />
      <div className="p-8 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* JWT Token Generator Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              테스트용 JWT 토큰 생성
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  키오스크 선택
                </label>
                <select
                  value={selectedKioskId}
                  onChange={(e) => setSelectedKioskId(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">키오스크 선택</option>
                  {kiosks.map((kiosk) => (
                    <option key={kiosk.id} value={kiosk.id}>
                      {kiosk.name} - {kiosk.location}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={async () => {
                  if (!selectedKioskId) {
                    showError('키오스크를 선택해주세요.');
                    return;
                  }
                  try {
                    const result = await kiosksApi.generateTestToken(
                      selectedKioskId,
                    );
                    setKioskToken(result.token);
                    showSuccess(
                      `JWT 토큰이 생성되었습니다. (만료: ${Math.floor(result.expiresIn / 3600)}시간)`,
                    );
                  } catch (error: any) {
                    showError(
                      error.response?.data?.message ||
                        'JWT 토큰 생성에 실패했습니다.',
                    );
                  }
                }}
                disabled={!selectedKioskId}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <i className="fas fa-key mr-2"></i>
                JWT 토큰 생성
              </Button>
              {kioskToken && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    생성된 토큰:
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={kioskToken}
                      readOnly
                      className="flex-1 font-mono text-xs"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(kioskToken);
                        showSuccess('토큰이 클립보드에 복사되었습니다.');
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <i className="fas fa-copy mr-2"></i>
                      복사
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Connection Panel */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              연결 설정
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  키오스크 선택
                </label>
                <select
                  value={selectedKioskId}
                  onChange={(e) => setSelectedKioskId(e.target.value)}
                  disabled={isConnected}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">키오스크 선택</option>
                  {kiosks.map((kiosk) => (
                    <option key={kiosk.id} value={kiosk.id}>
                      {kiosk.name} - {kiosk.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  키오스크 토큰 (JWT)
                </label>
                <Input
                  type="text"
                  value={kioskToken}
                  onChange={(e) => setKioskToken(e.target.value)}
                  placeholder="JWT 토큰 입력"
                  disabled={isConnected}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                {!isConnected ? (
                  <Button
                    onClick={handleConnect}
                    disabled={!selectedKioskId || !kioskToken}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    연결
                  </Button>
                ) : (
                  <Button
                    onClick={handleDisconnect}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    연결 해제
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg',
                  isConnected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600',
                )}
              >
                <i
                  className={cn(
                    'fas',
                    isConnected ? 'fa-circle-check' : 'fa-circle-xmark',
                  )}
                ></i>
                <span>{isConnected ? '연결됨' : '연결 안됨'}</span>
              </div>
              {sessionId && (
                <div className="text-sm text-gray-600">
                  세션 ID: <span className="font-mono">{sessionId}</span>
                </div>
              )}
              {currentState && (
                <div className="text-sm text-gray-600">
                  상태: <span className="font-semibold">{currentState}</span>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}
          </div>

          {/* Flow Control Panel */}
          {isConnected && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                플로우 제어
              </h2>

              <div className="space-y-4">
                {/* Step 1: Person Detection */}
                {currentState === 'initial' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      1. 초기 화면 - 사람 감지
                    </h3>
                    <Button
                      onClick={handlePersonDetected}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <i className="fas fa-user mr-2"></i>
                      사람 감지 시뮬레이션
                    </Button>
                  </div>
                )}

                {/* Step 2: Motion Detection */}
                {currentState === 'motion_detection' && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">
                      2. 모션 감지 - 기도 포즈
                    </h3>
                    <Button
                      onClick={handleMotionCompleted}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <i className="fas fa-hands-praying mr-2"></i>
                      모션 완료
                    </Button>
                  </div>
                )}

                {/* Step 3: Animal Selection */}
                {currentState === 'animal_selection' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">
                      3. 수호 동물 선택
                    </h3>
                    {animals.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-2">
                          동물 데이터가 없습니다. 테스트용 더미 동물을 사용합니다.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {dummyAnimalIds.map((animalId, index) => (
                            <Button
                              key={animalId}
                              onClick={() => handleAnimalSelected(animalId)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              동물 {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {animals.map((animal) => (
                          <Button
                            key={animal.id}
                            onClick={() => handleAnimalSelected(animal.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            {animal.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: User Input */}
                {currentState === 'user_input' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      4. 사용자 정보 입력
                    </h3>
                    <UserInputForm onSubmit={handleUserInputSubmit} />
                  </div>
                )}

                {/* Step 5: Duration Selection */}
                {currentState === 'duration_selection' && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h3 className="font-semibold text-indigo-800 mb-2">
                      5. 노출 기간 선택
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: '1_day', label: '1일 (2,000원)' },
                        { value: '30_days', label: '30일 (10,000원)' },
                        { value: '6_months', label: '6개월 (20,000원)' },
                        { value: '1_year', label: '1년 (30,000원)' },
                      ].map((duration) => (
                        <Button
                          key={duration.value}
                          onClick={() =>
                            handleDurationSelected(
                              duration.value as
                                | '1_day'
                                | '30_days'
                                | '6_months'
                                | '1_year',
                            )
                          }
                          className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        >
                          {duration.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 6: Payment Method */}
                {currentState === 'payment_method' && (
                  <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                    <h3 className="font-semibold text-pink-800 mb-2">
                      6. 결제 방법 선택
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePaymentMethodSelected('mobile_qr')}
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        <i className="fas fa-qrcode mr-2"></i>
                        모바일 QR 결제
                      </Button>
                      <Button
                        onClick={() => handlePaymentMethodSelected('credit_card')}
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        <i className="fas fa-credit-card mr-2"></i>
                        신용카드 결제
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 6-1: Mobile Payment */}
                {currentState === 'mobile_payment' && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <h3 className="font-semibold text-teal-800 mb-2">
                      6-1. 모바일 결제 처리
                    </h3>
                    {sessionData.paymentQrCode && (
                      <div className="mb-4">
                        <img
                          src={sessionData.paymentQrCode}
                          alt="Payment QR Code"
                          className="w-48 h-48 mx-auto border border-gray-300 rounded-lg"
                        />
                        <p className="text-center text-sm text-gray-600 mt-2">
                          QR 코드를 스캔하여 결제하세요
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={handlePaymentCompleted}
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      <i className="fas fa-check mr-2"></i>
                      결제 완료 시뮬레이션
                    </Button>
                  </div>
                )}

                {/* Step 6-2: Card Payment */}
                {currentState === 'card_payment' && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <h3 className="font-semibold text-teal-800 mb-2">
                      6-2. 신용카드 결제 처리
                    </h3>
                    <Button
                      onClick={handlePaymentCompleted}
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      <i className="fas fa-check mr-2"></i>
                      결제 완료 시뮬레이션
                    </Button>
                  </div>
                )}

                {/* Step 7: Video Template Selection */}
                {currentState === 'video_template_selection' && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-semibold text-orange-800 mb-2">
                      7. 비디오 템플릿 선택
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['template-1', 'template-2', 'template-3'].map(
                        (templateId) => (
                          <Button
                            key={templateId}
                            onClick={() => handleVideoTemplateSelected(templateId)}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            템플릿 {templateId.split('-')[1]}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Step 7-1: Video Generation */}
                {currentState === 'video_generation' && (
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <h3 className="font-semibold text-cyan-800 mb-2">
                      7-1. 비디오 생성 중...
                    </h3>
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-cyan-500 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-2">
                        {videoProgress}% 완료
                      </p>
                    </div>
                    {sessionData.videoUrl && (
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600">
                          비디오 URL: {sessionData.videoUrl}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 8: Final Preview */}
                {currentState === 'final_preview' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2">
                      8. 최종 미리보기
                    </h3>
                    {sessionData.ticketQrCode && (
                      <div className="mb-4">
                        <img
                          src={sessionData.ticketQrCode}
                          alt="Entry Ticket QR"
                          className="w-48 h-48 mx-auto border border-gray-300 rounded-lg"
                        />
                        <p className="text-center text-sm text-gray-600 mt-2">
                          입장권 QR 코드
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={handleTicketQrDownloaded}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <i className="fas fa-download mr-2"></i>
                        QR 코드 다운로드
                      </Button>
                    </div>
                  </div>
                )}

                {/* Completed */}
                {currentState === 'completed' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">
                      세션 완료!
                    </h3>
                    <div className="space-y-2 text-sm">
                      {sessionData.videoUrl && (
                        <p>
                          <strong>비디오:</strong> {sessionData.videoUrl}
                        </p>
                      )}
                      {sessionData.ticketPdfUrl && (
                        <p>
                          <strong>입장권:</strong> {sessionData.ticketPdfUrl}
                        </p>
                      )}
                      {sessionData.displayStart && (
                        <p>
                          <strong>노출 시작:</strong>{' '}
                          {new Date(sessionData.displayStart).toLocaleString()}
                        </p>
                      )}
                      {sessionData.displayEnd && (
                        <p>
                          <strong>노출 종료:</strong>{' '}
                          {new Date(sessionData.displayEnd).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancel Button */}
                {currentState !== 'initial' &&
                  currentState !== 'completed' &&
                  currentState !== 'cancelled' && (
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleSessionCancelled}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        <i className="fas fa-times mr-2"></i>
                        세션 취소
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Session Data Display */}
          {isConnected && sessionId && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                세션 데이터
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// User Input Form Component
function UserInputForm({
  onSubmit,
}: {
  onSubmit: (userName: string, userMessage: string) => void;
}) {
  const [userName, setUserName] = useState('');
  const [userMessage, setUserMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName && userMessage) {
      onSubmit(userName, userMessage);
      setUserName('');
      setUserMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="이름 입력"
        required
        className="w-full"
      />
      <Input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="소원 메시지 입력"
        required
        className="w-full"
      />
      <Button
        type="submit"
        disabled={!userName || !userMessage}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        제출
      </Button>
    </form>
  );
}

