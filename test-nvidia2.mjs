import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8').split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')] })
    .filter(([k]) => k)
)

const models = ['meta/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct-v0.3', 'nvidia/llama-3.1-nemotron-70b-instruct']

for (const model of models) {
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.NVIDIA_API_KEY}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Say "NVIDIA API OK" in Korean.' }], max_tokens: 64, temperature: 0.1 }),
  })
  const j = await res.json()
  const reply = j.choices?.[0]?.message?.content ?? JSON.stringify(j)
  console.log(`[${res.status}] ${model}\n  → ${reply}\n`)
  if (res.ok) break
}
