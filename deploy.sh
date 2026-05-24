#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== [1/5] git pull ==="
cd "$PROJECT_DIR"
# git pull origin master

echo "=== [2/5] Express 패키지 설치 ==="
cd "$PROJECT_DIR/server"
npm install --omit=dev

echo "=== [3/5] Nuxt 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/nuxt"
npm install
npm run build

echo "=== [4/5] Registry 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/registry"
npm install
npm run build

echo "=== [4/5] SSE 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/sse"
npm install
npm run build

echo "=== [5/5] PM2 재시작 (ecosystem.config.cjs) ==="
cd "$PROJECT_DIR"
pm2 reload ecosystem.config.cjs --update-env

echo "=== [6/5] PM2 저장 ==="
pm2 save

echo ""
echo "배포 완료!"
pm2 list
