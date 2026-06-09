// NVIDIA NIM API 연결 테스트
// 실행: node test-nvidia.mjs
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// .env 수동 파싱
const envText = readFileSync(resolve(__dirname, '.env'), 'utf-8')
const env = Object.fromEntries(
  envText.split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim().replace(/^['"]|['"]$/g, '')))
    .filter(([k, v]) => k && v !== undefined)
)

const API_KEY = env.NVIDIA_API_KEY
const NAME    = env.NVIDIA_NAME

if (!API_KEY) { console.error('NVIDIA_API_KEY not found in .env'); process.exit(1) }

console.log(`NVIDIA_NAME : ${NAME}`)
console.log(`API_KEY     : ${API_KEY.slice(0, 12)}...`)
console.log()

// 사용 가능한 모델 목록 조회
console.log('── 모델 목록 조회 중...')
const modelsRes = await fetch('https://integrate.api.nvidia.com/v1/models', {
  headers: { Authorization: `Bearer ${API_KEY}` },
})
if (!modelsRes.ok) {
  console.error('모델 목록 조회 실패:', modelsRes.status, await modelsRes.text())
  process.exit(1)
}
const models = await modelsRes.json()
console.log(`사용 가능한 모델 수: ${models.data?.length ?? 0}`)
models.data?.slice(0, 10).forEach(m => console.log(' •', m.id))
if ((models.data?.length ?? 0) > 10) console.log(`  ... 외 ${models.data.length - 10}개`)
console.log()

// 첫 번째 chat 모델로 간단 테스트
const chatModel = models.data?.find(m => m.id.includes('llama') || m.id.includes('mistral') || m.id.includes('nemotron'))?.id
  ?? 'meta/llama-3.1-8b-instruct'

console.log(`── Chat 테스트 (모델: ${chatModel})`)
const chatRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: chatModel,
    messages: [{ role: 'user', content: 'Say "NVIDIA API OK" in Korean.' }],
    max_tokens: 64,
    temperature: 0.1,
  }),
})

if (!chatRes.ok) {
  console.error('Chat 요청 실패:', chatRes.status, await chatRes.text())
  process.exit(1)
}
const chat = await chatRes.json()
console.log('응답:', chat.choices?.[0]?.message?.content)
console.log()
console.log('✓ NVIDIA API 연결 성공')
