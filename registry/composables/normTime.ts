export function normTime(s: string | null | undefined): string {
  if (!s || s === '—') return s ?? '—'
  const t = s.includes(':') ? s : '00:' + s
  const idx = t.indexOf(':')
  return t.slice(0, idx).padStart(2, '0') + ':' + t.slice(idx + 1)
}
