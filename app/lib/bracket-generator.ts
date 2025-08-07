import type { Database } from './supabase'

type Participant = Database['public']['Tables']['participants']['Row']

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
  source_match1_number?: number // previous match feeding player1
  source_match2_number?: number // previous match feeding player2
}

export interface BracketRound {
  round: number
  matches: BracketMatch[]
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

export class BracketGenerator {
  /**
   * Generate a single elimination bracket for a tournament.
   * Only supports power-of-two participant counts (no BYEs).
   * All first round matches have two real players.
   * Future rounds are placeholders with source match references.
   */
  static generateSingleElimination(
    tournamentId: string,
    participants: Participant[]
  ): BracketMatch[] {
    // Filter only accepted participants
    const acceptedParticipants = participants.filter(p => p.status === 'accepted')
    const numParticipants = acceptedParticipants.length

    if (numParticipants < 2) {
      throw new Error('Need at least 2 accepted participants for a tournament')
    }
    if (!isPowerOfTwo(numParticipants)) {
      throw new Error('Number of accepted participants must be a power of two (2, 4, 8, 16, ...)')
    }

    // Calculate number of rounds needed
    const numRounds = Math.log2(numParticipants)

    // Standard seeding: 1 vs N, 2 vs N-1, etc.
    const seededIndices = BracketGenerator.standardBracketSeeding(numParticipants)
    const bracketPositions = BracketGenerator.assignParticipantsToPositions(
      acceptedParticipants,
      seededIndices,
      numParticipants
    )

    // Generate matches
    let matchNumber = 1
    const matches: BracketMatch[] = []
    const matchRefsByRound: number[][] = []

    // --- First round: assign players ---
    const firstRoundMatches: BracketMatch[] = []
    const firstRoundMatchRefs: number[] = []
    for (let i = 0; i < numParticipants; i += 2) {
      const player1 = bracketPositions[i]
      const player2 = bracketPositions[i + 1]

      const match: BracketMatch = {
        tournament_id: tournamentId,
        round: 1,
        match_number: matchNumber,
        player1_id: player1,
        player2_id: player2,
        status: 'pending',
      }
      firstRoundMatches.push(match)
      firstRoundMatchRefs.push(matchNumber)
      matchNumber++
    }
    matches.push(...firstRoundMatches)
    matchRefsByRound.push(firstRoundMatchRefs)

    // --- Future rounds: create placeholders with source match references ---
    let prevRoundMatchRefs = firstRoundMatchRefs
    for (let round = 2; round <= numRounds; round++) {
      const numMatches = prevRoundMatchRefs.length / 2
      const roundMatches: BracketMatch[] = []
      const roundMatchRefs: number[] = []
      for (let i = 0; i < numMatches; i++) {
        const source1 = prevRoundMatchRefs[i * 2]
        const source2 = prevRoundMatchRefs[i * 2 + 1]
        const match: BracketMatch = {
          tournament_id: tournamentId,
          round,
          match_number: matchNumber,
          status: 'pending',
          source_match1_number: source1,
          source_match2_number: source2,
        }
        roundMatches.push(match)
        roundMatchRefs.push(matchNumber)
        matchNumber++
      }
      matches.push(...roundMatches)
      matchRefsByRound.push(roundMatchRefs)
      prevRoundMatchRefs = roundMatchRefs
    }

    return matches
  }

  /**
   * Standard bracket seeding: returns an array of indices for bracket slots.
   * E.g. for 8 slots: [0,7,3,4,2,5,1,6] (1 vs 8, 4 vs 5, 3 vs 6, 2 vs 7)
   */
  private static standardBracketSeeding(totalSlots: number): number[] {
    function seed(n: number): number[] {
      if (n === 1) return [0]
      const prev = seed(n / 2)
      const result: number[] = []
      for (let i = 0; i < prev.length; i++) {
        result.push(prev[i])
        result.push(n - 1 - prev[i])
      }
      return result
    }
    return seed(totalSlots)
  }

  /**
   * Assign participants to bracket positions based on seeding
   */
  private static assignParticipantsToPositions(
    participants: Participant[],
    seededIndices: number[],
    totalSlots: number
  ): string[] {
    const positions = new Array(totalSlots)
    // Sort participants by creation date (first to join = higher seed)
    const sortedParticipants = [...participants].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    // Assign participants to their seeded positions
    sortedParticipants.forEach((participant, index) => {
      if (index < seededIndices.length) {
        const position = seededIndices[index]
        positions[position] = participant.id
      }
    })
    return positions
  }

  /**
   * Advance a player to the next round after winning a match (DB version)
   * This should be called after a match is completed.
   */
  static async advancePlayerToNextRound(
    tournamentId: string,
    winnerId: string,
    currentMatchNumber: number,
    currentRound: number,
    supabase: any
  ): Promise<void> {
    // Find the next match that references this match as a source
    const { data: nextMatchData, error: nextMatchError } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round', currentRound + 1)
      .or(
        `source_match1_number.eq.${currentMatchNumber},source_match2_number.eq.${currentMatchNumber}`
      )
      .maybeSingle()

    if (nextMatchError || !nextMatchData) {
      // This was the final match, or next match not found
      return
    }

    // Determine which slot to fill
    const updateData: any = {}
    if (nextMatchData.source_match1_number === currentMatchNumber && !nextMatchData.player1_id) {
      updateData.player1_id = winnerId
    } else if (nextMatchData.source_match2_number === currentMatchNumber && !nextMatchData.player2_id) {
      updateData.player2_id = winnerId
    }

    // Update the next match with the winner
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', nextMatchData.id)
      if (updateError) {
        console.error('Error advancing player to next round:', updateError)
      }
    }
  }

  /**
   * Check if a tournament is complete
   */
  static isTournamentComplete(matches: BracketMatch[]): boolean {
    if (matches.length === 0) return false
    const finalRound = Math.max(...matches.map(m => m.round))
    const finalMatches = matches.filter(m => m.round === finalRound)
    return finalMatches.every(m => m.status === 'completed')
  }

  /**
   * Get the winner of a tournament
   */
  static getTournamentWinner(matches: BracketMatch[]): string | null {
    if (matches.length === 0) return null
    const finalRound = Math.max(...matches.map(m => m.round))
    const finalMatches = matches.filter(m => m.round === finalRound)
    const finalMatch = finalMatches[0]
    return finalMatch?.winner_id || null
  }
}