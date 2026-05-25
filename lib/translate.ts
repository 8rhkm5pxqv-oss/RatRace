const MEM: Record<string, string> = {}

function cacheKey(text: string) {
  let h = 5381
  for (let i = 0; i < Math.min(text.length, 120); i++) {
    h = (Math.imul(h, 33) ^ text.charCodeAt(i)) >>> 0
  }
  return 'rr_tr_' + h.toString(36)
}

async function fetchTranslation(text: string): Promise<string> {
  const r = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=de|en`,
    { signal: AbortSignal.timeout(5000) }
  )
  const d = await r.json()
  const t: string = d.responseData?.translatedText ?? text
  // MyMemory returns the original if it can't translate
  return t.includes('MYMEMORY WARNING') ? text : t
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

  // Split into ≤450-char chunks (MyMemory limit)
  const chunks: string[] = []
  let buf = ''
  for (const sentence of text.split(/(?<=[.!?…])\s+/)) {
    if (buf.length + sentence.length > 450) {
      if (buf) chunks.push(buf.trim())
      buf = sentence
    } else {
      buf += (buf ? ' ' : '') + sentence
    }
  }
  if (buf) chunks.push(buf.trim())

  try {
    const parts = await Promise.all(chunks.map(c => fetchTranslation(c).catch(() => c)))
    const result = parts.join(' ')
    MEM[key] = result
    try { localStorage.setItem(key, result) } catch {}
    return result
  } catch {
    return text
  }
}
