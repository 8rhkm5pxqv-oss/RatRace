'use client'

import { useState, useEffect, useRef } from 'react'
import { Globe } from 'lucide-react'
import { translateToEnglish } from '@/lib/translate'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  className?: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div'
}

export default function TranslatableBlock({ text, className, as: Tag = 'p' }: Props) {
  const [translated, setTranslated] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    translateToEnglish(text).then(r => {
      if (alive.current) setTranslated(r)
    })
    return () => { alive.current = false }
  }, [text])

  const display = showOriginal ? text : (translated ?? text)
  const isDifferent = !!translated && translated.trim().toLowerCase() !== text.trim().toLowerCase()

  return (
    <div>
      <Tag className={className}>{display}</Tag>
      {isDifferent && (
        <button
          onClick={e => { e.stopPropagation(); setShowOriginal(p => !p) }}
          className="mt-1 inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <Globe className="h-2.5 w-2.5" />
          {showOriginal ? 'Show in English' : 'Show original'}
        </button>
      )}
    </div>
  )
}
