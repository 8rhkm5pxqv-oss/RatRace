'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/types'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', bio: '', location: '', username: '' })
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', bio: data.bio || '', location: data.location || '', username: data.username || '' })
        setSkills(data.skills || [])
      }
    }
    loadProfile()
  }, [router])

  function set(key: string, value: string) { setForm(prev => ({ ...prev, [key]: value })) }

  function addSkill(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const skill = skillInput.trim()
      if (skill && !skills.includes(skill)) setSkills(prev => [...prev, skill])
      setSkillInput('')
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let avatar_url = profile?.avatar_url || null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name, bio: form.bio, location: form.location, username: form.username, skills, avatar_url,
    }).eq('id', user.id)

    if (error) {
      toast.error('Error saving: ' + error.message)
      setLoading(false)
      return
    }

    toast.success('Profile saved!')
    router.push(`/profile/${user.id}`)
  }

  const initials = form.full_name?.split(' ').map(n => n[0]).join('') || profile?.username?.[0]?.toUpperCase() || '?'
  const inputCls = "h-9 bg-white/[0.03] border-white/[0.07] text-zinc-100 placeholder:text-zinc-700 focus:border-violet-500/40 text-sm"
  const labelCls = "text-zinc-500 text-xs font-medium"

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Edit profile</h1>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-[#141414] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarPreview ?? profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-violet-600/70 text-white text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer text-violet-400 hover:text-violet-300 transition-colors text-sm">
                Upload photo
              </Label>
              <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <p className="text-xs text-zinc-600 mt-1">JPG, PNG or WebP</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className={labelCls}>Name</Label>
              <Input id="fullName" value={form.full_name} onChange={e => set('full_name', e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username" className={labelCls}>Username *</Label>
              <Input id="username" value={form.username} onChange={e => set('username', e.target.value)} className={inputCls} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className={labelCls}>Location</Label>
            <Input id="location" placeholder="e.g. Berlin, Germany" value={form.location} onChange={e => set('location', e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className={labelCls}>Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us something about yourself..."
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              rows={4}
              className="bg-white/[0.03] border-white/[0.07] text-zinc-100 placeholder:text-zinc-700 focus:border-violet-500/40 resize-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skills" className={labelCls}>Skills <span className="text-zinc-700">(press Enter or comma to add)</span></Label>
            <div className="flex flex-wrap gap-1.5 p-2.5 border border-white/[0.07] rounded-lg bg-white/[0.03] min-h-[44px]">
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                  {skill}
                  <button type="button" onClick={() => setSkills(p => p.filter(s => s !== skill))} className="text-zinc-600 hover:text-zinc-300">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                id="skills"
                className="flex-1 min-w-[120px] outline-none text-sm bg-transparent text-zinc-100 placeholder:text-zinc-700"
                placeholder="e.g. React, Python..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-9 bg-violet-600 hover:bg-violet-500 border-0 text-white text-sm font-medium shadow-sm shadow-violet-900/30"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save profile'}
          </Button>
        </form>
      </div>
    </div>
  )
}
