# Docker에서 테스트 실행하기

이 문서는 Docker 환경에서 Dashboard 테스트를 실행하는 방법을 설명합니다.

## 방법 1: Docker Compose 사용 (권장)

### 모든 Dashboard 테스트 실행

```bash
cd backoffice-frontend
docker-compose -f docker-compose.test.yml up --build
```

### 특정 테스트 파일 실행

```bash
docker-compose -f docker-compose.test.yml run --rm test npm test -- __tests__/dashboard/statistics-api.test.ts
```

### Watch 모드로 실행

```bash
docker-compose -f docker-compose.test.yml run --rm test npm run test:watch -- __tests__/dashboard
```

### 커버리지 포함 실행

```bash
docker-compose -f docker-compose.test.yml run --rm test npm run test:coverage -- __tests__/dashboard
```

## 방법 2: Docker 직접 사용

### 스크립트 사용 (가장 간단)

```bash
cd backoffice-frontend
./scripts/run-tests-docker.sh
```

### 수동 실행

```bash
cd backoffice-frontend

# 이미지 빌드
docker build -f Dockerfile.test -t kiosk-backoffice-test:latest .

# 테스트 실행
docker run --rm \
  -v "$(pwd)/coverage:/app/coverage" \
  -v "$(pwd)/__tests__:/app/__tests__" \
  -e NODE_ENV=test \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 \
  kiosk-backoffice-test:latest \
  npm test -- __tests__/dashboard --coverage
```

## 방법 3: 기존 docker-compose에 테스트 서비스 추가

```bash
cd backoffice-frontend
docker-compose --profile test run --rm test npm test -- __tests__/dashboard
```

## 테스트 옵션

### 특정 테스트 파일만 실행

```bash
docker-compose -f docker-compose.test.yml run --rm test npm test -- __tests__/dashboard/statistics-api.test.ts
```

### 특정 테스트만 실행 (패턴 매칭)

```bash
docker-compose -f docker-compose.test.yml run --rm test npm test -- __tests__/dashboard -t "should fetch statistics"
```

### Verbose 모드

```bash
docker-compose -f docker-compose.test.yml run --rm test npm test -- __tests__/dashboard --verbose
```

### 커버리지 리포트 생성

```bash
docker-compose -f docker-compose.test.yml run --rm test npm run test:coverage -- __tests__/dashboard
```

커버리지 리포트는 `coverage/` 디렉토리에 생성됩니다.

## 환경 변수

테스트 실행 시 다음 환경 변수를 설정할 수 있습니다:

- `NODE_ENV=test` - 테스트 환경 설정
- `NEXT_PUBLIC_API_URL` - API URL (기본값: `http://localhost:3000/api/v1`)

## 볼륨 마운트

다음 디렉토리가 볼륨으로 마운트됩니다:

- `./coverage:/app/coverage` - 커버리지 리포트
- `./__tests__:/app/__tests__` - 테스트 파일 (변경 시 자동 반영)

## 문제 해결

### 권한 오류

```bash
chmod +x scripts/run-tests-docker.sh
```

### 캐시 문제

```bash
docker-compose -f docker-compose.test.yml build --no-cache
```

### 컨테이너 정리

```bash
docker-compose -f docker-compose.test.yml down
docker rmi kiosk-backoffice-test:latest
```

### 로그 확인

```bash
docker-compose -f docker-compose.test.yml logs test
```

## CI/CD 통합

GitHub Actions나 GitLab CI에서 사용할 수 있는 예시:

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd backoffice-frontend
          docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## 참고사항

- 테스트는 독립적으로 실행되므로 외부 서비스가 필요하지 않습니다
- 모든 의존성은 Docker 이미지에 포함됩니다
- 커버리지 리포트는 호스트 머신의 `coverage/` 디렉토리에 저장됩니다

