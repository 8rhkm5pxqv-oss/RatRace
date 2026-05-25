import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Settings, User, Bell, Shield, CreditCard, ExternalLink, ChevronRight } from 'lucide-react'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

function SettingsRow({ icon: Icon, label, description, href, external, badge }: {
  icon: any; label: string; description: string; href?: string; external?: boolean; badge?: string
}) {
  const inner = (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#141414] hover:bg-[#181818] hover:border-white/[0.12] transition-all group cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-200">{label}</p>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-600 mt-0.5">{description}</p>
      </div>
      {external
        ? <ExternalLink className="h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
        : <ChevronRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
      }
    </div>
  )
  if (href) return <Link href={href} target={external ? '_blank' : undefined}>{inner}</Link>
  return inner
}

export default async function SettingsPage() {
  let userEmail = ''
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email ?? ''
  }

  return (
    <div className="px-5 py-6 max-w-xl">
      <div className="mb-6 border-b border-white/[0.06] pb-5">
        <h1 className="text-lg font-semibold text-white tracking-tight">Settings</h1>
      </div>

      <section className="mb-5">
        <p className="text-[9px] font-medium text-zinc-700 uppercase tracking-[0.12em] mb-3 px-1">Account</p>
        <div className="space-y-2">
          <SettingsRow icon={User} label="Edit profile" description="Name, bio, skills, avatar and location" href="/profile/edit" />
          {userEmail && (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] bg-[#141414]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                <Shield className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200">Email</p>
                <p className="text-xs text-zinc-600 mt-0.5">{userEmail}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-5">
        <p className="text-[9px] font-medium text-zinc-700 uppercase tracking-[0.12em] mb-3 px-1">Notifications</p>
        <div className="space-y-2">
          <SettingsRow icon={Bell} label="Messages" description="Notifications for new messages" badge="Coming soon" />
        </div>
      </section>

      <section className="mb-5">
        <p className="text-[9px] font-medium text-zinc-700 uppercase tracking-[0.12em] mb-3 px-1">Listings</p>
        <div className="space-y-2">
          <SettingsRow icon={CreditCard} label="My listings" description="All your active and inactive listings" href="/requests" />
        </div>
      </section>

      <section>
        <p className="text-[9px] font-medium text-zinc-700 uppercase tracking-[0.12em] mb-3 px-1">About</p>
        <div className="p-4 rounded-xl border border-white/[0.07] bg-[#141414]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">R</span>
            </div>
            <p className="text-sm font-semibold text-zinc-200">RatRace</p>
            <span className="text-xs text-zinc-600">v0.2.0</span>
          </div>
          <p className="text-xs text-zinc-600">
            The platform for startup founders and investors in the DACH region.
          </p>
        </div>
      </section>
    </div>
  )
}
