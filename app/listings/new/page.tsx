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
      toast.error('Please fill in all required fields')
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
      toast.error('Error: ' + error.message)
      setLoading(false)
      return
    }
    toast.success('Listing published!')
    router.push(`/listings/${data.id}`)
  }

  const showEquity = form.compensation_type === 'equity' || form.compensation_type === 'both'

  const inputCls = "h-9 bg-white/[0.03] border-white/[0.07] text-zinc-100 placeholder:text-zinc-700 focus:border-violet-500/40 text-sm"
  const selectTriggerCls = "h-9 bg-white/[0.03] border-white/[0.07] text-zinc-400 focus:border-violet-500/40 text-sm"
  const selectContentCls = "bg-[#1a1a1a] border-white/[0.08] text-zinc-300"
  const labelCls = "text-zinc-500 text-xs font-medium"

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Post a listing</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Find the right person for your startup</p>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-[#141414] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className={labelCls}>Title *</Label>
            <Input
              id="title"
              placeholder='e.g. "Looking for a CTO for B2B SaaS"'
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={inputCls}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className={labelCls}>Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your startup, what you're looking for and what you offer..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={5}
              className="bg-white/[0.03] border-white/[0.07] text-zinc-100 placeholder:text-zinc-700 focus:border-violet-500/40 resize-none text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelCls}>Role needed *</Label>
              <Select value={form.role_category} onValueChange={v => set('role_category', v ?? '')}>
                <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent className={selectContentCls}>
                  <SelectItem value="cofounder">Co-Founder</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Startup stage *</Label>
              <Select value={form.stage} onValueChange={v => set('stage', v ?? '')}>
                <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent className={selectContentCls}>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="mvp">MVP</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelCls}>Compensation *</Label>
              <Select value={form.compensation_type} onValueChange={v => set('compensation_type', v ?? '')}>
                <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Select compensation" /></SelectTrigger>
                <SelectContent className={selectContentCls}>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="both">Equity + Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showEquity && (
              <div className="space-y-1.5">
                <Label htmlFor="equity" className={labelCls}>Equity stake (%)</Label>
                <Input
                  id="equity"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 5"
                  value={form.equity_percent}
                  onChange={e => set('equity_percent', e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {/* Investment section */}
          <div className="border border-amber-500/15 rounded-xl p-4 space-y-4 bg-amber-500/[0.02]">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  form.seeks_investment ? 'bg-amber-500 border-amber-500' : 'border-white/20 bg-white/[0.03]'
                }`}
                onClick={() => set('seeks_investment', !form.seeks_investment)}
              >
                {form.seeks_investment && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-zinc-200">Seeking investment</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">Visible to investors</span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">Your startup will appear in the investor deal flow</p>
              </div>
            </label>

            {form.seeks_investment && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className={labelCls}>Funding round</Label>
                  <Select value={form.investment_round} onValueChange={v => set('investment_round', v ?? '')}>
                    <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Select round" /></SelectTrigger>
                    <SelectContent className={selectContentCls}>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className={labelCls}>Monthly revenue</Label>
                  <Select value={form.monthly_revenue_range} onValueChange={v => set('monthly_revenue_range', v ?? '')}>
                    <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Revenue range" /></SelectTrigger>
                    <SelectContent className={selectContentCls}>
                      <SelectItem value="<10k">{'< €10k / month'}</SelectItem>
                      <SelectItem value="10k-100k">€10k – €100k</SelectItem>
                      <SelectItem value=">100k">{'>€100k / month'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-9 bg-violet-600 hover:bg-violet-500 border-0 text-white text-sm font-medium shadow-sm shadow-violet-900/30"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish listing'}
          </Button>
        </form>
      </div>
    </div>
  )
}
