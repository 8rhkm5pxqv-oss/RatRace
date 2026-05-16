'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', role_category: '',
    compensation_type: '', equity_percent: '', stage: '',
    seeks_investment: false, investment_round: '', monthly_revenue_range: '',
  })

  function set(key: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.role_category || !form.compensation_type || !form.stage) {
      toast.error('Bitte fülle alle Pflichtfelder aus')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data, error } = await supabase.from('listings').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      role_category: form.role_category,
      compensation_type: form.compensation_type,
      equity_percent: form.equity_percent ? parseInt(form.equity_percent) : null,
      stage: form.stage,
      seeks_investment: form.seeks_investment,
      investment_round: form.seeks_investment && form.investment_round ? form.investment_round : null,
      monthly_revenue_range: form.seeks_investment && form.monthly_revenue_range ? form.monthly_revenue_range : null,
    }).select().single()

    if (error) {
      toast.error('Fehler: ' + error.message)
      setLoading(false)
      return
    }
    toast.success('Inserat veröffentlicht!')
    router.push(`/listings/${data.id}`)
  }

  const showEquity = form.compensation_type === 'equity' || form.compensation_type === 'both'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F0F0F5]">Neues Inserat posten</h1>
        <p className="text-sm text-[#6B7280] mt-1">Finde den richtigen Menschen für dein Startup</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[#A0A0B0] text-sm">Titel *</Label>
            <Input
              id="title"
              placeholder='z.B. "Suche CTO für B2B SaaS Startup"'
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-[#F0F0F5] placeholder:text-[#4B4B5A] focus:border-violet-500/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[#A0A0B0] text-sm">Beschreibung *</Label>
            <Textarea
              id="description"
              placeholder="Beschreibe dein Startup, was du suchst und was du bietest..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={5}
              className="bg-white/[0.04] border-white/[0.08] text-[#F0F0F5] placeholder:text-[#4B4B5A] focus:border-violet-500/50 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[#A0A0B0] text-sm">Gesuchte Rolle *</Label>
              <Select value={form.role_category} onValueChange={v => set('role_category', v ?? '')}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-[#A0A0B0] focus:border-violet-500/50">
                  <SelectValue placeholder="Rolle wählen" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A24] border-white/[0.08]">
                  <SelectItem value="cofounder">Mitgründer</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#A0A0B0] text-sm">Startup-Stage *</Label>
              <Select value={form.stage} onValueChange={v => set('stage', v ?? '')}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-[#A0A0B0] focus:border-violet-500/50">
                  <SelectValue placeholder="Stage wählen" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A24] border-white/[0.08]">
                  <SelectItem value="idea">Idee</SelectItem>
                  <SelectItem value="mvp">MVP</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[#A0A0B0] text-sm">Vergütung *</Label>
              <Select value={form.compensation_type} onValueChange={v => set('compensation_type', v ?? '')}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-[#A0A0B0] focus:border-violet-500/50">
                  <SelectValue placeholder="Vergütung wählen" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A24] border-white/[0.08]">
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="salary">Gehalt</SelectItem>
                  <SelectItem value="both">Equity + Gehalt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showEquity && (
              <div className="space-y-1.5">
                <Label htmlFor="equity" className="text-[#A0A0B0] text-sm">Equity-Anteil (%)</Label>
                <Input
                  id="equity"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="z.B. 5"
                  value={form.equity_percent}
                  onChange={e => set('equity_percent', e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-[#F0F0F5] placeholder:text-[#4B4B5A] focus:border-violet-500/50"
                />
              </div>
            )}
          </div>

          {/* Investment Section */}
          <div className="border border-amber-500/20 rounded-xl p-4 space-y-4 bg-amber-500/[0.03]">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  form.seeks_investment
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-white/20 bg-white/[0.04]'
                }`}
                onClick={() => set('seeks_investment', !form.seeks_investment)}
              >
                {form.seeks_investment && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-[#F0F0F5]">Sucht Investition</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Für Investoren sichtbar</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">Dein Startup erscheint im Investor Deal Flow</p>
              </div>
            </label>

            {form.seeks_investment && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-[#A0A0B0] text-sm">Funding Round</Label>
                  <Select value={form.investment_round} onValueChange={v => set('investment_round', v ?? '')}>
                    <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-[#A0A0B0] focus:border-amber-500/50">
                      <SelectValue placeholder="Round wählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A24] border-white/[0.08]">
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#A0A0B0] text-sm">Monatlicher Revenue</Label>
                  <Select value={form.monthly_revenue_range} onValueChange={v => set('monthly_revenue_range', v ?? '')}>
                    <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-[#A0A0B0] focus:border-amber-500/50">
                      <SelectValue placeholder="Revenue-Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A24] border-white/[0.08]">
                      <SelectItem value="<10k">{'< €10k / Monat'}</SelectItem>
                      <SelectItem value="10k-100k">€10k – €100k</SelectItem>
                      <SelectItem value=">100k">{'>€100k / Monat'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-500 border-0 text-white"
            disabled={loading}
          >
            {loading ? 'Wird veröffentlicht...' : 'Inserat veröffentlichen'}
          </Button>
        </form>
      </div>
    </div>
  )
}
