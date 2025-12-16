# Dashboard Feature Tests

이 디렉토리는 Dashboard 기능에 대한 단위 테스트를 포함합니다.

## 테스트 파일

### API 및 훅 테스트

- **`dashboard-websocket.test.ts`** - Dashboard WebSocket 클라이언트 테스트
  - WebSocket 연결 및 인증
  - 이벤트 핸들링
  - 프로젝트 룸 관리
  - 연결 상태 확인

- **`statistics-api.test.ts`** - 통계 API 테스트
  - 필터 없이 통계 조회
  - 날짜 범위 필터링
  - 프로젝트 ID 필터링
  - 모든 필터 조합

- **`useStatistics.test.ts`** - useStatistics 훅 테스트
  - 필터를 사용한 통계 조회
  - refetch 간격 설정
  - 쿼리 비활성화
  - 필터 변경 시 쿼리 키 업데이트

- **`useDashboardWebSocket.test.ts`** - useDashboardWebSocket 훅 테스트
  - WebSocket 클라이언트 생성
  - 이벤트 리스너 등록
  - 프로젝트 룸 참가/나가기
  - 통계 쿼리 무효화
  - 정리(cleanup) 동작

### 컴포넌트 테스트

- **`RevenueChart.test.tsx`** - 매출 차트 컴포넌트 테스트
  - 차트 렌더링
  - 데이터 포맷팅
  - 차트 옵션 설정
  - 툴팁 및 축 포맷팅

- **`ContentChart.test.tsx`** - 콘텐츠 차트 컴포넌트 테스트
  - 차트 렌더링
  - 데이터 포맷팅
  - 차트 옵션 설정
  - 툴팁 및 축 포맷팅

- **`DateRangePicker.test.tsx`** - 날짜 범위 선택기 테스트
  - 날짜 선택 UI
  - 빠른 선택 옵션 (7일, 30일, 90일, 1년)
  - 날짜 범위 유효성 검사
  - 초기화 및 적용 기능

## 테스트 실행

```bash
# 모든 Dashboard 테스트 실행
npm test -- __tests__/dashboard

# 특정 테스트 파일 실행
npm test -- __tests__/dashboard/dashboard-websocket.test.ts

# Watch 모드로 실행
npm run test:watch -- __tests__/dashboard

# 커버리지 포함 실행
npm run test:coverage -- __tests__/dashboard
```

## 테스트 커버리지 목표

- **Statements**: 80% 이상
- **Branches**: 75% 이상
- **Functions**: 80% 이상
- **Lines**: 80% 이상

## 모킹

테스트에서 다음을 모킹합니다:

- **socket.io-client** - WebSocket 연결 모킹
- **js-cookie** - 쿠키 접근 모킹
- **react-chartjs-2** - Chart.js 컴포넌트 모킹
- **chart.js** - Chart.js 라이브러리 모킹
- **@tanstack/react-query** - React Query 모킹 (필요시)

## 주요 테스트 시나리오

### WebSocket 연결
1. 토큰이 있을 때 연결 성공
2. 토큰이 없을 때 연결 실패
3. 이벤트 리스너 등록 및 제거
4. 프로젝트 룸 참가/나가기

### 통계 조회
1. 필터 없이 전체 통계 조회
2. 날짜 범위로 필터링
3. 프로젝트별 필터링
4. 모든 필터 조합 사용

### 차트 렌더링
1. 데이터가 있을 때 차트 표시
2. 빈 데이터 처리
3. 포맷팅 (통화, 개수)
4. 차트 스타일링

### 날짜 선택
1. 날짜 범위 선택
2. 빠른 선택 옵션
3. 날짜 유효성 검사
4. 초기화 기능

## 참고사항

- 모든 테스트는 독립적으로 실행 가능해야 합니다
- 각 테스트는 `beforeEach`에서 모킹을 초기화합니다
- 비동기 작업은 `waitFor`를 사용하여 처리합니다
- 사용자 상호작용은 `@testing-library/user-event`를 사용합니다

