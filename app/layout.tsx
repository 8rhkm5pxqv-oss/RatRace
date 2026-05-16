import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RatRace — Finde deinen Mitgründer',
  description: 'Die Plattform für Startup-Gründer und Investoren im DACH-Raum.',
}

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'your-project-url' && url.startsWith('http'))
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let profile = null
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      profile = data
    }
  }

  return (
    <html lang="de" className={`${geist.variable} dark antialiased`}>
      <body className="flex h-screen overflow-hidden bg-[#0A0A0F] text-[#F0F0F5]">
        <Sidebar profile={profile} />
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>
        <MobileNav />
        <Toaster theme="dark" />
      </body>
    </html>
  )
}
