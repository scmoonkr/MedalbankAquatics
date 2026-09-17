#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== [1/6] git pull ==="
cd "$PROJECT_DIR"
# git pull origin master

echo "=== [2/6] Express 패키지 설치 ==="
cd "$PROJECT_DIR/server"
npm install --omit=dev

echo "=== [3/6] Aquatics 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/aquatics"
npm install
npm run build

echo "=== [4/6] Medalbank 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/medalbank"
npm install
npm run build

echo "=== [4/6] SSE 패키지 설치 & 빌드 ==="
cd "$PROJECT_DIR/sse"
npm install
npm run build

echo "=== [5/6] PM2 재시작 ==="
cd "$PROJECT_DIR"

if pm2 list | grep -q "medalbank-node"; then
  pm2 restart medalbank-node
else
  pm2 start "$PROJECT_DIR/server/index.js" --name medalbank-node --cwd "$PROJECT_DIR/server"
fi

if pm2 list | grep -q "medalbank-aquatics"; then
  pm2 restart medalbank-aquatics
else
  PORT=6631 pm2 start "$PROJECT_DIR/aquatics/.output/server/index.mjs" \
    --name medalbank-aquatics --cwd "$PROJECT_DIR/aquatics" --env production
fi

if pm2 list | grep -q "medalbank-medalbank"; then
  pm2 restart medalbank-medalbank
else
  PORT=6632 pm2 start "$PROJECT_DIR/medalbank/.output/server/index.mjs" \
    --name medalbank-medalbank --cwd "$PROJECT_DIR/medalbank" --env production
fi

# swimming stock exchange
if pm2 list | grep -q "medalbank-sse"; then
  pm2 restart medalbank-sse
else
  PORT=6634 pm2 start "$PROJECT_DIR/sse/.output/server/index.mjs" \
    --name medalbank-sse --env production
fi

echo "=== [6/6] PM2 저장 ==="
pm2 save

echo ""
echo "배포 완료!"
pm2 list
