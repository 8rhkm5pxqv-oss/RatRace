import { createClient } from '@/lib/supabase/server'
import { Users, FileText, TrendingUp, Zap } from 'lucide-react'

export default async function StatsBar() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl === 'your-project-url') {
    return <StatsDisplay total={0} today={0} profiles={0} investment={0} />
  }

  const supabase = await createClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const [
    { count: total },
    { count: today },
    { count: profiles },
    { count: investment },
  ] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('created_at', todayStart),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seeks_investment', true).eq('is_active', true),
  ])

  return <StatsDisplay total={total ?? 0} today={today ?? 0} profiles={profiles ?? 0} investment={investment ?? 0} />
}

function StatsDisplay({ total, today, profiles, investment }: {
  total: number; today: number; profiles: number; investment: number
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { icon: FileText, label: 'Aktive Inserate', value: total, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { icon: Zap, label: 'Neu heute', value: today, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { icon: Users, label: 'Gründer', value: profiles, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { icon: TrendingUp, label: 'Investment-Deals', value: investment, color: 'text-amber-400', bg: 'bg-amber-500/10' },
      ].map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="rounded-xl border border-white/[0.06] bg-[#111118] p-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4.5 w-4.5 ${color}`} />
          </div>
          <div>
            <p className="text-xl font-bold text-[#F0F0F5]">{value.toLocaleString('de-DE')}</p>
            <p className="text-xs text-[#6B7280]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
