import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Debug logging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

// Only throw error if we're not in a build context
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables - using placeholder values for build')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test the connection only if we have real credentials
if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error)
    } else {
      console.log('Supabase connected successfully')
      if (data.session) {
        console.log('Existing session found:', data.session.user.id)
      } else {
        console.log('No existing session')
      }
    }
  })
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string
          game_type: string
          max_participants: number
          current_participants: number
          status: 'draft' | 'open' | 'full' | 'in_progress' | 'completed'
          bracket_type: 'single_elimination' | 'double_elimination' | 'round_robin'
          admin_id: string
          created_at: string
          updated_at: string
          start_date?: string
          end_date?: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          game_type: string
          max_participants: number
          current_participants?: number
          status?: 'draft' | 'open' | 'full' | 'in_progress' | 'completed'
          bracket_type: 'single_elimination' | 'double_elimination' | 'round_robin'
          admin_id: string
          created_at?: string
          updated_at?: string
          start_date?: string
          end_date?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          game_type?: string
          max_participants?: number
          current_participants?: number
          status?: 'draft' | 'open' | 'full' | 'in_progress' | 'completed'
          bracket_type?: 'single_elimination' | 'double_elimination' | 'round_robin'
          admin_id?: string
          created_at?: string
          updated_at?: string
          start_date?: string
          end_date?: string
        }
      }
      participants: {
        Row: {
          id: string
          tournament_id: string
          user_id?: string
          display_name: string
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          team_name?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          user_id?: string
          display_name: string
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          team_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          user_id?: string
          display_name?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          team_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          round: number
          match_number: number
          player1_id?: string
          player2_id?: string
          winner_id?: string
          status: 'pending' | 'in_progress' | 'completed'
          score1?: number
          score2?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round: number
          match_number: number
          player1_id?: string
          player2_id?: string
          winner_id?: string
          status?: 'pending' | 'in_progress' | 'completed'
          score1?: number
          score2?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round?: number
          match_number?: number
          player1_id?: string
          player2_id?: string
          winner_id?: string
          status?: 'pending' | 'in_progress' | 'completed'
          score1?: number
          score2?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 