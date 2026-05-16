export type RoleCategory = 'cofounder' | 'developer' | 'designer' | 'marketing' | 'sales' | 'other'
export type CompensationType = 'equity' | 'salary' | 'both'
export type StartupStage = 'idea' | 'mvp' | 'revenue' | 'funded'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  skills: string[]
  location: string | null
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  role_category: RoleCategory
  compensation_type: CompensationType
  equity_percent: number | null
  stage: StartupStage
  is_active: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Conversation {
  id: string
  listing_id: string | null
  participant_1: string
  participant_2: string
  created_at: string
  listings?: Pick<Listing, 'id' | 'title'>
  profile_1?: Profile
  profile_2?: Profile
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
  profiles?: Profile
}
