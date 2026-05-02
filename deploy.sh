#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== [1/5] git pull ==="
cd "$PROJECT_DIR"
git pull origin master

echo "=== [2/5] Express 패키지 설치 ==="
cd "$PROJECT_DIR/server"
npm install --omit=dev

echo "=== [3/5] Nuxt 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/nuxt"
npm install
npm run build

echo "=== [4/5] PM2 재시작 ==="
cd "$PROJECT_DIR"

if pm2 list | grep -q "medalbank-api"; then
  pm2 restart medalbank-api
else
  pm2 start server/index.js --name medalbank-api --cwd "$PROJECT_DIR/server"
fi

if pm2 list | grep -q "medalbank-nuxt"; then
  pm2 restart medalbank-nuxt
else
  pm2 start nuxt/.output/server/index.mjs --name medalbank-nuxt \
    --env production \
    -- --port 6631
fi

echo "=== [5/5] PM2 저장 ==="
pm2 save

echo ""
echo "배포 완료!"
pm2 list
