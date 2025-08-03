import { useMemo } from 'react'
import { cn } from '../lib/utils'
import type { Database } from '../lib/supabase'

type Match = Database['public']['Tables']['matches']['Row']
type Participant = Database['public']['Tables']['participants']['Row']

interface BracketViewProps {
  matches: Match[]
  participants: Participant[]
  onMatchClick?: (match: Match) => void
}

export function BracketView({ matches, participants, onMatchClick }: BracketViewProps) {
  const rounds = useMemo(() => {
    const roundsMap = new Map<number, Match[]>()
    
    matches.forEach(match => {
      if (!roundsMap.has(match.round)) {
        roundsMap.set(match.round, [])
      }
      roundsMap.get(match.round)!.push(match)
    })
    
    return Array.from(roundsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([round, matches]) => ({
        round,
        matches: matches.sort((a, b) => a.match_number - b.match_number)
      }))
  }, [matches])

  const getParticipantName = (participantId: string | null | undefined) => {
    if (!participantId) return 'TBD'
    const participant = participants.find(p => p.id === participantId)
    return participant?.display_name || participant?.team_name || participant?.user_id || 'Unknown'
  }

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50'
      case 'in_progress':
        return 'border-blue-500 bg-blue-50'
      case 'pending':
      default:
        return 'border-gray-300 bg-white'
    }
  }

  if (rounds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No matches generated yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-8 min-w-max p-4">
        {rounds.map(({ round, matches }) => (
          <div key={round} className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              Round {round}
            </h3>
            <div className="flex flex-col space-y-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className={cn(
                    "border-2 rounded-lg p-3 min-w-[200px] cursor-pointer hover:shadow-md transition-shadow",
                    getMatchStatusColor(match.status)
                  )}
                  onClick={() => onMatchClick?.(match)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Match {match.match_number}</span>
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        match.status === 'completed' ? 'bg-green-100 text-green-800' :
                        match.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {match.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className={cn(
                        "p-2 rounded text-sm",
                        match.winner_id === match.player1_id ? 'bg-green-100 font-medium' : 'bg-gray-50'
                      )}>
                        {getParticipantName(match.player1_id)}
                        {match.score1 !== null && match.score1 !== undefined && (
                          <span className="float-right font-mono">{match.score1}</span>
                        )}
                      </div>
                      
                      <div className={cn(
                        "p-2 rounded text-sm",
                        match.winner_id === match.player2_id ? 'bg-green-100 font-medium' : 'bg-gray-50'
                      )}>
                        {getParticipantName(match.player2_id)}
                        {match.score2 !== null && match.score2 !== undefined && (
                          <span className="float-right font-mono">{match.score2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 