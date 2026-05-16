'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function addSkill(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const skill = skillInput.trim()
      if (skill && !skills.includes(skill)) {
        setSkills(prev => [...prev, skill])
      }
      setSkillInput('')
    }
  }

  function removeSkill(skill: string) {
    setSkills(prev => prev.filter(s => s !== skill))
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
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      bio: form.bio,
      location: form.location,
      username: form.username,
      skills,
      avatar_url,
    }).eq('id', user.id)

    if (error) {
      toast.error('Fehler beim Speichern: ' + error.message)
      setLoading(false)
      return
    }

    toast.success('Profil gespeichert!')
    router.push(`/profile/${user.id}`)
  }

  const initials = form.full_name?.split(' ').map(n => n[0]).join('') || profile?.username?.[0]?.toUpperCase() || '?'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profil bearbeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview ?? profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-[#0A66C2] text-white text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer text-[#0A66C2] hover:underline text-sm">
                  Profilbild hochladen
                </Label>
                <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-xs text-gray-400 mt-1">JPG, PNG oder WebP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Name</Label>
                <Input id="fullName" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername *</Label>
                <Input id="username" value={form.username} onChange={e => set('username', e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Standort</Label>
              <Input id="location" placeholder="z.B. Berlin, Deutschland" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Erzähl etwas über dich..." value={form.bio} onChange={e => set('bio', e.target.value)} rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (Enter oder Komma zum Hinzufügen)</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white min-h-[44px]">
                {skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  id="skills"
                  className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                  placeholder="z.B. React, Python..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#0A66C2] hover:bg-[#004182]" disabled={loading}>
              {loading ? 'Speichern...' : 'Speichern'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
