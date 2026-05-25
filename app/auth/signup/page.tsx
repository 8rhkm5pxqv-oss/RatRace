'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Rocket } from 'lucide-react'
import { toast } from 'sonner'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen haben')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username: username.toLowerCase().replace(/\s+/g, '_') },
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Konto erstellt!')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-hero">
      <div className="w-full max-w-[340px]">
        <div className="text-center mb-7">
          <div className="w-10 h-10 rounded-xl bg-violet-600/90 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-900/40">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Konto erstellen</h1>
          <p className="text-[#5A5A6A] text-sm mt-1">Finde deinen Mitgründer oder dein Investment</p>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-6 shadow-2xl shadow-black/50">
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-[#8A8A9A] text-xs font-medium">Name</Label>
                <Input
                  id="fullName"
                  placeholder="Max M."
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="h-9 bg-white/[0.03] border-white/[0.07] text-[#F0F0F5] placeholder:text-[#3A3A4A] focus:border-violet-500/40 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[#8A8A9A] text-xs font-medium">Username</Label>
                <Input
                  id="username"
                  placeholder="maxm"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="h-9 bg-white/[0.03] border-white/[0.07] text-[#F0F0F5] placeholder:text-[#3A3A4A] focus:border-violet-500/40 text-sm"
                  required
                />
              </div>
            </div>
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
                placeholder="Mindestens 6 Zeichen"
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
              {loading ? 'Erstellen...' : 'Konto erstellen'}
            </Button>
          </form>
          <p className="text-xs text-[#4B4B5A] text-center mt-4">
            Schon ein Konto?{' '}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
