import type { Database } from './supabase'

type Participant = Database['public']['Tables']['participants']['Row']
type Match = Database['public']['Tables']['matches']['Insert']

export interface BracketMatch {
  id?: string
  tournament_id: string
  round: number
  match_number: number
  player1_id?: string
  player2_id?: string
  winner_id?: string
  status: 'pending' | 'in_progress' | 'completed'
  score1?: number
  score2?: number
}

export interface BracketRound {
  round: number
  matches: BracketMatch[]
}

export class BracketGenerator {
  /**
   * Generate a single elimination bracket for a tournament
   * Uses proper seeding to ensure top players don't meet early
   */
  static generateSingleElimination(
    tournamentId: string,
    participants: Participant[]
  ): BracketMatch[] {
    if (participants.length < 2) {
      throw new Error('Need at least 2 participants for a tournament')
    }

    // Filter only accepted participants
    const acceptedParticipants = participants.filter(p => p.status === 'accepted')
    
    if (acceptedParticipants.length < 2) {
      throw new Error('Need at least 2 accepted participants for a tournament')
    }

    // Calculate number of rounds needed
    const numParticipants = acceptedParticipants.length
    const numRounds = Math.ceil(Math.log2(numParticipants))
    const totalSlots = Math.pow(2, numRounds)
    
    // Create seeded bracket positions
    const seededPositions = this.generateSeededPositions(totalSlots)
    
    // Assign participants to positions (fill with byes if needed)
    const bracketPositions = this.assignParticipantsToPositions(
      acceptedParticipants,
      seededPositions,
      totalSlots
    )
    
    // Generate matches for each round
    const matches: BracketMatch[] = []
    let matchNumber = 1
    
    for (let round = 1; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round)
      
      for (let i = 0; i < matchesInRound; i++) {
        const position1 = i * 2
        const position2 = i * 2 + 1
        
        const player1 = bracketPositions[position1]
        const player2 = bracketPositions[position2]
        
        // Skip matches where both players are byes
        if (player1 === 'BYE' && player2 === 'BYE') {
          continue
        }
        
        const match: BracketMatch = {
          tournament_id: tournamentId,
          round,
          match_number: matchNumber++,
          player1_id: player1 === 'BYE' ? undefined : player1,
          player2_id: player2 === 'BYE' ? undefined : player2,
          status: 'pending',
        }
        
        matches.push(match)
      }
    }
    
    return matches
  }
  
  /**
   * Generate seeded positions for a bracket
   * Uses standard tournament seeding (1 vs 16, 8 vs 9, etc.)
   */
  private static generateSeededPositions(totalSlots: number): number[] {
    const positions: number[] = []
    
    // First seed always goes to position 0
    positions.push(0)
    
    // For each subsequent seed, place it in the opposite half
    for (let seed = 1; seed < totalSlots; seed++) {
      const position = this.findSeededPosition(seed, totalSlots)
      positions.push(position)
    }
    
    return positions
  }
  
  /**
   * Find the correct position for a given seed in a bracket
   */
  private static findSeededPosition(seed: number, totalSlots: number): number {
    if (seed === 0) return 0
    
    // Calculate which half of the bracket this seed should be in
    const halfSize = totalSlots / 2
    const half = Math.floor((seed - 1) / halfSize)
    const positionInHalf = (seed - 1) % halfSize
    
    // Map to actual position
    if (half === 0) {
      // Top half
      return positionInHalf * 2
    } else {
      // Bottom half
      return positionInHalf * 2 + 1
    }
  }
  
  /**
   * Assign participants to bracket positions based on seeding
   */
  private static assignParticipantsToPositions(
    participants: Participant[],
    seededPositions: number[],
    totalSlots: number
  ): (string | 'BYE')[] {
    const positions = new Array(totalSlots).fill('BYE')
    
    // Sort participants by creation date (first to join = higher seed)
    const sortedParticipants = [...participants].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    // Assign participants to their seeded positions
    sortedParticipants.forEach((participant, index) => {
      if (index < seededPositions.length) {
        const position = seededPositions[index]
        positions[position] = participant.user_id
      }
    })
    
    return positions
  }
  
  /**
   * Get the next match for a winner
   */
  static getNextMatch(round: number, matchNumber: number, totalRounds: number): {
    nextRound: number
    nextMatchNumber: number
  } | null {
    if (round >= totalRounds) return null
    
    const nextRound = round + 1
    const nextMatchNumber = Math.floor((matchNumber - 1) / 2) + 1
    
    return { nextRound, nextMatchNumber }
  }
  
  /**
   * Check if a tournament is complete
   */
  static isTournamentComplete(matches: BracketMatch[]): boolean {
    const finalMatches = matches.filter(m => m.round === Math.max(...matches.map(m => m.round)))
    return finalMatches.every(m => m.status === 'completed')
  }
  
  /**
   * Get the winner of a tournament
   */
  static getTournamentWinner(matches: BracketMatch[]): string | null {
    const finalMatches = matches.filter(m => m.round === Math.max(...matches.map(m => m.round)))
    const finalMatch = finalMatches[0]
    
    return finalMatch?.winner_id || null
  }
} 