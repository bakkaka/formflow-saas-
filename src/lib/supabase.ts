import { createClient } from '@supabase/supabase-js'

// Ces variables viennent de .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types TypeScript pour notre base de données
export type Form = {
  id: string
  title: string
  description?: string
  fields: FormField[]
  user_id: string
  created_at: string
}

export type FormField = {
  id: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox'
  question: string
  required: boolean
  options?: string[]
}

export type FormResponse = {
  id: string
  form_id: string
  data: Record<string, any>
  created_at: string
}