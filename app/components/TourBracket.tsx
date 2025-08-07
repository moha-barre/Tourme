import React from 'react'
import type { BracketMatch } from '../lib/bracket-generator'

interface TournamentBracketProps {
  matches: BracketMatch[]
  onMatchWinner?: (match: BracketMatch, winnerId: string) => void
  participantsById: Record<string, { display_name: string }>
  currentRound?: number // Optionally highlight the current round
}

function getRounds(matches: BracketMatch[]): BracketMatch[][] {
  const rounds: BracketMatch[][] = []
  const maxRound = Math.max(...matches.map(m => m.round))
  for (let r = 1; r <= maxRound; r++) {
    rounds.push(matches.filter(m => m.round === r))
  }
  return rounds
}

const roundLabels = [
  'Final',
  'Semifinals',
  'Quarterfinals',
  'Round of 16',
  'Round of 32',
  'Round of 64',
  'Round of 128',
  'Round of 256',
]

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  onMatchWinner,
  participantsById,
  currentRound,
}) => {
  const rounds = getRounds(matches)
  const totalRounds = rounds.length

  // Helper to get round label
  const getRoundLabel = (idx: number) => {
    if (totalRounds - idx - 1 < roundLabels.length) {
      return roundLabels[totalRounds - idx - 1]
    }
    return `Round ${idx + 1}`
  }

  return (
    <div className="flex overflow-x-auto text-black py-4 px-2 bg-gray-50 rounded-lg shadow-inner">
      {rounds.map((roundMatches, roundIdx) => (
        <div
          key={roundIdx}
          className={`mx-4 flex flex-col items-center min-w-[220px] ${
            currentRound === roundIdx + 1
              ? 'bg-yellow-50 border-2 border-yellow-400 shadow-lg'
              : 'bg-white border border-gray-200'
          } rounded-lg p-3`}
        >
          <div className="font-bold mb-3 text-lg text-blue-700 tracking-wide">
            {getRoundLabel(roundIdx)}
          </div>
          {roundMatches.map(match => (
            <div
              key={match.match_number}
              className="bg-white border rounded-lg shadow p-3 mb-6 min-w-[200px] flex flex-col items-center relative"
            >
              <div className="absolute top-1 right-2 text-xs text-gray-400">#{match.match_number}</div>
              <div className="flex flex-col gap-2 w-full">
                <MatchPlayer
                  playerId={match.player1_id}
                  participantsById={participantsById}
                  isWinner={match.winner_id === match.player1_id}
                  isTBD={!match.player1_id}
                  score={match.score1}
                />
                <div className="text-center text-xs text-gray-400 font-semibold">vs</div>
                <MatchPlayer
                  playerId={match.player2_id}
                  participantsById={participantsById}
                  isWinner={match.winner_id === match.player2_id}
                  isTBD={!match.player2_id}
                  score={match.score2}
                />
              </div>
              {typeof match.score1 === 'number' && typeof match.score2 === 'number' && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-semibold">Score:</span> {match.score1} - {match.score2}
                </div>
              )}
              {onMatchWinner &&
                !match.winner_id &&
                match.player1_id &&
                match.player2_id && (
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-xs font-semibold border border-green-300 transition"
                      title={`Declare ${participantsById[match.player1_id]?.display_name || 'Player 1'} as winner`}
                      onClick={() => onMatchWinner(match, match.player1_id!)}
                    >
                      {participantsById[match.player1_id]?.display_name || 'Player 1'} Wins
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-semibold border border-blue-300 transition"
                      title={`Declare ${participantsById[match.player2_id]?.display_name || 'Player 2'} as winner`}
                      onClick={() => onMatchWinner(match, match.player2_id!)}
                    >
                      {participantsById[match.player2_id]?.display_name || 'Player 2'} Wins
                    </button>
                  </div>
                )}
              {match.winner_id && (
                <div className="mt-3 text-green-700 text-xs font-bold flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Winner: {participantsById[match.winner_id]?.display_name || 'TBD'}
                </div>
              )}
              {match.status === 'completed' && !match.winner_id && (
                <div className="mt-2 text-red-600 text-xs font-semibold">
                  No winner recorded
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

interface MatchPlayerProps {
  playerId?: string
  participantsById: Record<string, { display_name: string }>
  isWinner: boolean
  isTBD: boolean
  score?: number
}

const MatchPlayer: React.FC<MatchPlayerProps> = ({
  playerId,
  participantsById,
  isWinner,
  isTBD,
  score,
}) => {
  const displayName = isTBD
    ? 'TBD'
    : participantsById[playerId!]?.display_name || 'Unknown'
  return (
    <div
      className={`px-2 py-1 rounded w-full text-center flex items-center justify-center gap-2
        ${isWinner ? 'bg-green-200 font-bold border border-green-400' : ''}
        ${isTBD ? 'text-gray-400 italic' : ''}
      `}
      title={displayName}
    >
      <span>{displayName}</span>
      {typeof score === 'number' && (
        <span className="ml-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {score}
        </span>
      )}
      {isWinner && (
        <svg className="w-4 h-4 text-green-500 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  )
}

export default TournamentBracket