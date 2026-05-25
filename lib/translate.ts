const MEM: Record<string, string> = {}

function cacheKey(text: string) {
  let h = 5381
  for (let i = 0; i < Math.min(text.length, 120); i++) {
    h = (Math.imul(h, 33) ^ text.charCodeAt(i)) >>> 0
  }
  return 'rr_tr2_' + h.toString(36)
}

async function fetchTranslation(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=en&dt=t&q=${encodeURIComponent(text)}`
  const r = await fetch(url, { signal: AbortSignal.timeout(6000) })
  const d = await r.json()
  // Response is [[['translated', 'original', ...], ...], ...]
  const translated: string = (d[0] as [string, string][])
    .map(x => x[0] ?? '')
    .join('')
  return translated.trim() || text
}

export async function translateToEnglish(text: string): Promise<string> {
  if (!text || text.trim().length < 5) return text

  const key = cacheKey(text)
  if (MEM[key]) return MEM[key]

  // Try localStorage first
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    if (stored) { MEM[key] = stored; return stored }
  } catch {}

  // Google Translate unofficial endpoint handles long text natively — no chunking needed
  try {
    const result = await fetchTranslation(text)
    MEM[key] = result
    try { localStorage.setItem(key, result) } catch {}
    return result
  } catch {
    return text
  }
}
