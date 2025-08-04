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
    
    // Create proper seeded bracket positions
    const seededPositions = this.generateProperSeededPositions(totalSlots)
    
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
          match_number: matchNumber,
          player1_id: player1 === 'BYE' ? undefined : player1,
          player2_id: player2 === 'BYE' ? undefined : player2,
          status: 'pending',
        }
        
        matches.push(match)
        matchNumber++ // Only increment for actual matches
      }
    }
    
    return matches
  }
  
  /**
   * Generate proper seeded positions for a bracket
   * Uses standard tournament seeding (1 vs 16, 8 vs 9, 4 vs 13, etc.)
   */
  private static generateProperSeededPositions(totalSlots: number): number[] {
    const positions: number[] = []
    
    // For each seed, calculate its position using proper tournament seeding
    for (let seed = 0; seed < totalSlots; seed++) {
      const position = this.calculateSeededPosition(seed, totalSlots)
      positions.push(position)
    }
    
    return positions
  }
  
  /**
   * Calculate the correct position for a given seed using proper tournament seeding
   */
  private static calculateSeededPosition(seed: number, totalSlots: number): number {
    if (seed === 0) return 0
    if (seed === 1) return totalSlots - 1
    
    // For seeds 2 and above, use the standard tournament seeding pattern
    let position = seed
    let currentSlot = totalSlots
    
    while (currentSlot > 2) {
      currentSlot = currentSlot / 2
      if (position > currentSlot) {
        position = currentSlot * 2 - position + 1
      }
    }
    
    return position - 1
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
        positions[position] = participant.id
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
   * Advance a player to the next round after winning a match
   */
  static async advancePlayerToNextRound(
    tournamentId: string,
    winnerId: string,
    currentRound: number,
    currentMatchNumber: number,
    supabase: any
  ): Promise<void> {
    const nextMatch = this.getNextMatch(currentRound, currentMatchNumber, 10) // Assume max 10 rounds
    
    if (!nextMatch) {
      // This is the final match, tournament is complete
      return
    }

    // Find the next match
    const { data: nextMatchData, error: nextMatchError } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round', nextMatch.nextRound)
      .eq('match_number', nextMatch.nextMatchNumber)
      .single()

    if (nextMatchError || !nextMatchData) {
      console.error('Could not find next match:', nextMatchError)
      return
    }

    // Determine which player slot to fill (player1 or player2)
    const isFirstPlayer = (currentMatchNumber - 1) % 2 === 0
    
    const updateData: any = {}
    if (isFirstPlayer) {
      updateData.player1_id = winnerId
    } else {
      updateData.player2_id = winnerId
    }

    // Update the next match with the winner
    const { error: updateError } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', nextMatchData.id)

    if (updateError) {
      console.error('Error advancing player to next round:', updateError)
    }
  }
  
  /**
   * Check if a tournament is complete
   */
  static isTournamentComplete(matches: BracketMatch[]): boolean {
    if (matches.length === 0) return false
    const finalMatches = matches.filter(m => m.round === Math.max(...matches.map(m => m.round)))
    return finalMatches.every(m => m.status === 'completed')
  }
  
  /**
   * Get the winner of a tournament
   */
  static getTournamentWinner(matches: BracketMatch[]): string | null {
    if (matches.length === 0) return null
    const finalMatches = matches.filter(m => m.round === Math.max(...matches.map(m => m.round)))
    const finalMatch = finalMatches[0]
    
    return finalMatch?.winner_id || null
  }
} 