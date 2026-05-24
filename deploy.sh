#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== [1/6] git pull ==="
cd "$PROJECT_DIR"
# git pull origin master

echo "=== [2/6] Express 패키지 설치 ==="
cd "$PROJECT_DIR/server"
npm install --omit=dev

echo "=== [3/6] Nuxt 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/nuxt"
npm install
npm run build

echo "=== [4/6] Registry 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/registry"
npm install
npm run build

echo "=== [4/6] SSE 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/sse"
npm install
npm run build

echo "=== [5/6] PM2 재시작 ==="
cd "$PROJECT_DIR"

if pm2 list | grep -q "medalbank-aquatics-api"; then
  pm2 restart medalbank-aquatics-api
else
  pm2 start "$PROJECT_DIR/server/index.js" --name medalbank-aquatics-api --cwd "$PROJECT_DIR/server"
fi

if pm2 list | grep -q "medalbank-aquatics-nuxt"; then
  pm2 restart medalbank-aquatics-nuxt
else
  PORT=6631 pm2 start "$PROJECT_DIR/nuxt/.output/server/index.mjs" \
    --name medalbank-aquatics-nuxt --env production
fi

if pm2 list | grep -q "medalbank-aquatics-registry"; then
  pm2 restart medalbank-aquatics-registry
else
  PORT=6632 pm2 start "$PROJECT_DIR/registry/.output/server/index.mjs" \
    --name medalbank-aquatics-registry --env production
fi

if pm2 list | grep -q "medalbank-aquatics-sse"; then
  pm2 restart medalbank-aquatics-sse
else
  PORT=6632 pm2 start "$PROJECT_DIR/sse/.output/server/index.mjs" \
    --name medalbank-aquatics-sse --env production
fi

echo "=== [6/6] PM2 저장 ==="
pm2 save

echo ""
echo "배포 완료!"
pm2 list
