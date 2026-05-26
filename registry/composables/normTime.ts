export function normTime(s: string | null | undefined): string {
  if (!s || s === '—') return s ?? '—'
  const t = s.includes(':') ? s : '00:' + s
  const idx = t.indexOf(':')
  const mm   = t.slice(0, idx).padStart(2, '0')
  const rest = t.slice(idx + 1)
  const dot  = rest.indexOf('.')
  const ss   = dot >= 0
    ? rest.slice(0, dot).padStart(2, '0') + rest.slice(dot)
    : rest.padStart(2, '0')
  return mm + ':' + ss
}
