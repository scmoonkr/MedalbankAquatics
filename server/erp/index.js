// erp 단독 실행 진입점 (API + 관리 화면). 코드와 의존성은 server/ 하나를 쓰되 프로세스만 분리한다.
//   실행: npm run erp (루트)  또는  node erp/index.js (server/)    → http://localhost:6643
// server/index.js 에 같이 띄우려면 .env 에 ERP_MOUNT=true (그러면 /erp/ 로 서비스).
import app from './app.js'
import { ensureIndexes } from './db.js'

const PORT = process.env.ERP_PORT || 6643

ensureIndexes().catch((e) => console.error('[erp] 인덱스 생성 실패:', e.message))

app.listen(PORT, () => {
  console.log(`ERP running on http://localhost:${PORT}`)
})
