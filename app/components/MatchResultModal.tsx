import { useState, useEffect } from 'react'
import type { Database } from '../lib/supabase'

type Match = Database['public']['Tables']['matches']['Row']
type Participant = Database['public']['Tables']['participants']['Row']

interface MatchResultModalProps {
  match: Match | null
  participants: Participant[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (matchId: string, winnerId: string, score1: number, score2: number) => Promise<void>
}

export function MatchResultModal({ match, participants, isOpen, onClose, onSubmit }: MatchResultModalProps) {
  const [winnerId, setWinnerId] = useState<string>('')
  const [score1, setScore1] = useState<number>(0)
  const [score2, setScore2] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (match) {
      setWinnerId(match.winner_id || '')
      setScore1(match.score1 || 0)
      setScore2(match.score2 || 0)
      setError('')
    }
  }, [match])

  const getParticipantName = (participantId: string | null | undefined) => {
    if (!participantId) return 'TBD'
    const participant = participants.find(p => p.id === participantId)
    return participant?.display_name || participant?.team_name || participant?.user_id || 'Unknown'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!match) return

    if (!winnerId) {
      setError('Please select a winner')
      return
    }

    if (score1 < 0 || score2 < 0) {
      setError('Scores cannot be negative')
      return
    }

    try {
      setLoading(true)
      setError('')
      await onSubmit(match.id, winnerId, score1, score2)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update match result')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !match) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Update Match Result
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Match {match.match_number} - Round {match.round}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Match Participants */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Player 1</span>
                <span className="text-sm text-gray-500">{getParticipantName(match.player1_id)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Player 2</span>
                <span className="text-sm text-gray-500">{getParticipantName(match.player2_id)}</span>
              </div>
            </div>

            {/* Winner Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Winner *
              </label>
              <select
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select winner</option>
                {match.player1_id && (
                  <option value={match.player1_id}>
                    {getParticipantName(match.player1_id)}
                  </option>
                )}
                {match.player2_id && (
                  <option value={match.player2_id}>
                    {getParticipantName(match.player2_id)}
                  </option>
                )}
              </select>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getParticipantName(match.player1_id)} Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={score1}
                  onChange={(e) => setScore1(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getParticipantName(match.player2_id)} Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={score2}
                  onChange={(e) => setScore2(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 