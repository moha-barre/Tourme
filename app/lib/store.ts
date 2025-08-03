import { create } from 'zustand'
import { supabase } from './supabase'
import type { Database } from './supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Tournament = Database['public']['Tables']['tournaments']['Row']
type Participant = Database['public']['Tables']['participants']['Row']
type Match = Database['public']['Tables']['matches']['Row']

interface AuthState {
  user: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: Profile | null) => void
}

interface TournamentState {
  tournaments: Tournament[]
  currentTournament: Tournament | null
  participants: Participant[]
  matches: Match[]
  loading: boolean
  fetchTournaments: () => Promise<void>
  createTournament: (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'current_participants'>) => Promise<Tournament>
  joinTournament: (tournamentId: string, userId: string, teamName?: string) => Promise<void>
  leaveTournament: (tournamentId: string, userId: string) => Promise<void>
  updateMatchResult: (matchId: string, winnerId: string, score1: number, score2: number) => Promise<void>
  generateBracket: (tournamentId: string) => Promise<void>
}

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  
  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError)
          // If profile doesn't exist, create a basic user object
          set({ 
            user: {
              id: data.user.id,
              email: data.user.email || '',
              username: data.user.email?.split('@')[0] || 'User',
              created_at: data.user.created_at,
              updated_at: data.user.updated_at || new Date().toISOString(),
            }, 
            loading: false 
          })
        } else {
          set({ user: profile, loading: false })
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      set({ loading: false })
      throw error
    }
  },
  
  signUp: async (email: string, password: string, username: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            username,
          })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
          // If profile creation fails, we should still set the user
          set({ 
            user: {
              id: data.user.id,
              email: data.user.email || '',
              username: username,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at || new Date().toISOString(),
            }, 
            loading: false 
          })
        } else {
          // Fetch the created profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          set({ user: profile, loading: false })
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      set({ loading: false })
      throw error
    }
  },
  
  signOut: async () => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, loading: false })
    } catch (error) {
      console.error('Sign out error:', error)
      set({ loading: false })
      throw error
    }
  },
  
  setUser: (user: Profile | null) => set({ user, loading: false }),
}))

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: [],
  currentTournament: null,
  participants: [],
  matches: [],
  loading: false,
  
  fetchTournaments: async () => {
    set({ loading: true })
    try {
      console.log('Fetching tournaments...')
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Tournaments fetched:', data?.length || 0)
      set({ tournaments: data || [], loading: false })
    } catch (error) {
      console.error('Fetch tournaments error:', error)
      set({ loading: false })
    }
  },
  
  createTournament: async (tournament) => {
    set({ loading: true })
    try {
      // Create the tournament
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          ...tournament,
          current_participants: 1, // Start with 1 (the admin)
          status: 'open',
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Automatically add the admin as an accepted participant
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          tournament_id: data.id,
          user_id: tournament.admin_id,
          status: 'accepted', // Admin is automatically accepted
          team_name: 'Admin', // Default team name for admin
        })
      
      if (participantError) {
        console.error('Failed to add admin as participant:', participantError)
        // Don't throw error here as tournament was created successfully
      }
      
      set(state => ({
        tournaments: [data, ...state.tournaments],
        loading: false,
      }))
      
      return data // Return the created tournament data
    } catch (error) {
      console.error('Create tournament error:', error)
      set({ loading: false })
      throw error
    }
  },
  
  joinTournament: async (tournamentId: string, userId: string, teamName?: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          tournament_id: tournamentId,
          user_id: userId,
          status: 'pending',
          team_name: teamName,
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Join tournament error:', error)
      throw error
    }
  },
  
  leaveTournament: async (tournamentId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
      
      if (error) throw error
    } catch (error) {
      console.error('Leave tournament error:', error)
      throw error
    }
  },
  
  updateMatchResult: async (matchId: string, winnerId: string, score1: number, score2: number) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          winner_id: winnerId,
          score1,
          score2,
          status: 'completed',
        })
        .eq('id', matchId)
      
      if (error) throw error
    } catch (error) {
      console.error('Update match result error:', error)
      throw error
    }
  },
  
  generateBracket: async (tournamentId: string) => {
    try {
      // Fetch participants for this tournament
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'accepted')
      
      if (participantsError) throw participantsError
      
      if (!participants || participants.length < 2) {
        throw new Error('Need at least 2 accepted participants to generate bracket')
      }
      
      // Import and use the bracket generator
      const { BracketGenerator } = await import('./bracket-generator')
      const matches = BracketGenerator.generateSingleElimination(tournamentId, participants)
      
      // Insert matches into database
      const { error: matchesError } = await supabase
        .from('matches')
        .insert(matches)
      
      if (matchesError) throw matchesError
      
      // Update tournament status to in_progress
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({ status: 'in_progress' })
        .eq('id', tournamentId)
      
      if (tournamentError) throw tournamentError
      
      console.log('Bracket generated successfully for tournament:', tournamentId)
    } catch (error) {
      console.error('Generate bracket error:', error)
      throw error
    }
  },
}))

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
})) 