'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Rocket } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-hero">
      <div className="w-full max-w-[340px]">
        <div className="text-center mb-7">
          <div className="w-10 h-10 rounded-xl bg-violet-600/90 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-900/40">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Willkommen zurück</h1>
          <p className="text-[#5A5A6A] text-sm mt-1">Melde dich bei RatRace an</p>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-6 shadow-2xl shadow-black/50">
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#8A8A9A] text-xs font-medium">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="du@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-9 bg-white/[0.03] border-white/[0.07] text-[#F0F0F5] placeholder:text-[#3A3A4A] focus:border-violet-500/40 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#8A8A9A] text-xs font-medium">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-9 bg-white/[0.03] border-white/[0.07] text-[#F0F0F5] placeholder:text-[#3A3A4A] focus:border-violet-500/40 text-sm"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-9 bg-violet-600 hover:bg-violet-500 border-0 text-white text-sm font-medium mt-1 shadow-sm shadow-violet-900/30"
              disabled={loading}
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </Button>
          </form>
          <p className="text-xs text-[#4B4B5A] text-center mt-4">
            Noch kein Konto?{' '}
            <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
              Registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
