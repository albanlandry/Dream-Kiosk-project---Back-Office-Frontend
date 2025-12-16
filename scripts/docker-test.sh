#!/bin/bash

# Dashboard 테스트를 Docker에서 실행하는 간단한 스크립트

set -e

echo "🐳 Docker에서 Dashboard 테스트 실행 중..."

# Docker Compose 사용 (가장 간단한 방법)
if command -v docker-compose &> /dev/null; then
    echo "📦 Docker Compose를 사용하여 테스트 실행..."
    docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
else
    # Docker 직접 사용
    echo "📦 Docker를 직접 사용하여 테스트 실행..."
    
    # 이미지가 없으면 빌드
    if ! docker image inspect kiosk-backoffice-test:latest &> /dev/null; then
        echo "🔨 Docker 이미지 빌드 중..."
        docker build -f Dockerfile.test -t kiosk-backoffice-test:latest .
    fi
    
    # 테스트 실행
    docker run --rm \
        -v "$(pwd)/coverage:/app/coverage" \
        -e NODE_ENV=test \
        -e NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 \
        kiosk-backoffice-test:latest \
        npm test -- __tests__/dashboard --coverage
fi

echo "✅ 테스트 완료!"

