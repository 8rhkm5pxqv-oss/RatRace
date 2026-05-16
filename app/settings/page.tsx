import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Settings, User, Bell, Shield, CreditCard, ExternalLink, ChevronRight } from 'lucide-react'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  href,
  external,
  badge,
}: {
  icon: any
  label: string
  description: string
  href?: string
  external?: boolean
  badge?: string
}) {
  const inner = (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#111118] hover:bg-[#131320] hover:border-white/10 transition-all group cursor-pointer">
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[#6B7280]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#F0F0F5]">{label}</p>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>
      </div>
      {external ? (
        <ExternalLink className="h-4 w-4 text-[#4B4B5A] group-hover:text-[#A0A0B0] transition-colors shrink-0" />
      ) : (
        <ChevronRight className="h-4 w-4 text-[#4B4B5A] group-hover:text-[#A0A0B0] transition-colors shrink-0" />
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} target={external ? '_blank' : undefined}>
        {inner}
      </Link>
    )
  }
  return inner
}

export default async function SettingsPage() {
  let userEmail = ''
  let userId = ''

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email ?? ''
    userId = user?.id ?? ''
  }

  return (
    <div className="px-6 py-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-[#6B7280]" />
        <h1 className="text-xl font-bold text-[#F0F0F5]">Settings</h1>
      </div>

      {/* Account */}
      <section className="mb-6">
        <p className="text-xs font-semibold text-[#3A3A4A] uppercase tracking-widest mb-3 px-1">Account</p>
        <div className="space-y-2">
          <SettingsRow
            icon={User}
            label="Profil bearbeiten"
            description="Name, Bio, Skills, Avatar und Location"
            href="/profile/edit"
          />
          {userEmail && (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#111118]">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-[#6B7280]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#F0F0F5]">E-Mail</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{userEmail}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-6">
        <p className="text-xs font-semibold text-[#3A3A4A] uppercase tracking-widest mb-3 px-1">Benachrichtigungen</p>
        <div className="space-y-2">
          <SettingsRow
            icon={Bell}
            label="Nachrichten"
            description="Benachrichtigung bei neuen Nachrichten"
            badge="Coming soon"
          />
        </div>
      </section>

      {/* Listings */}
      <section className="mb-6">
        <p className="text-xs font-semibold text-[#3A3A4A] uppercase tracking-widest mb-3 px-1">Inserate</p>
        <div className="space-y-2">
          <SettingsRow
            icon={CreditCard}
            label="Meine Inserate"
            description="Alle deine aktiven und inaktiven Inserate"
            href="/requests"
          />
        </div>
      </section>

      {/* About */}
      <section>
        <p className="text-xs font-semibold text-[#3A3A4A] uppercase tracking-widest mb-3 px-1">About</p>
        <div className="space-y-2">
          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#111118]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">R</span>
              </div>
              <p className="text-sm font-bold text-[#F0F0F5]">RatRace</p>
              <span className="text-xs text-[#4B4B5A]">v0.2.0</span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Die Plattform für Startup-Gründer und Investoren im DACH-Raum.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
