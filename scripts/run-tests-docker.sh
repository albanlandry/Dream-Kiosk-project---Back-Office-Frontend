#!/bin/bash

# Dashboard 테스트를 Docker에서 실행하는 스크립트

set -e

echo "🐳 Docker에서 Dashboard 테스트 실행 중..."

# Docker 이미지 빌드
echo "📦 Docker 이미지 빌드 중..."
docker build -f Dockerfile.test -t kiosk-backoffice-test:latest .

# 테스트 실행
echo "🧪 테스트 실행 중..."
docker run --rm \
  -v "$(pwd)/coverage:/app/coverage" \
  -v "$(pwd)/__tests__:/app/__tests__" \
  -e NODE_ENV=test \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 \
  kiosk-backoffice-test:latest \
  npm test -- __tests__/dashboard --coverage

echo "✅ 테스트 완료!"

