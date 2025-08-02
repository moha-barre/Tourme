import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { BracketView } from '../../components/BracketView'
import { useAuthStore, useTournamentStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import { formatDate, getStatusColor, getParticipantStatusColor } from '../../lib/utils'
import type { Database } from '../../lib/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Participant = Database['public']['Tables']['participants']['Row']
type Match = Database['public']['Tables']['matches']['Row']

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)
  const [teamName, setTeamName] = useState('')

  useEffect(() => {
    if (id) {
      fetchTournamentData()
    }
  }, [id])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)
      
      // Fetch tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (tournamentError) throw tournamentError
      setTournament(tournamentData)

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', id)
      
      if (participantsError) throw participantsError
      setParticipants(participantsData || [])

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', id)
        .order('round', { ascending: true })
        .order('match_number', { ascending: true })
      
      if (matchesError) throw matchesError
      setMatches(matchesData || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournament')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTournament = async () => {
    if (!user || !tournament) return

    try {
      setJoining(true)
      
      const { error } = await supabase
        .from('participants')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          status: 'pending',
          team_name: teamName || undefined,
        })
      
      if (error) throw error
      
      // Refresh data
      await fetchTournamentData()
      setTeamName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join tournament')
    } finally {
      setJoining(false)
    }
  }

  const handleLeaveTournament = async () => {
    if (!user || !tournament) return

    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('tournament_id', tournament.id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      // Refresh data
      await fetchTournamentData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave tournament')
    }
  }

  const isParticipant = participants.some(p => p.user_id === user?.id)
  const isAdmin = tournament?.admin_id === user?.id
  const canJoin = tournament && 
                 tournament.status === 'open' && 
                 !isParticipant && 
                 !isAdmin && // Admin shouldn't see join form since they're automatically added
                 participants.length < tournament.max_participants

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tournament not found</h1>
        <p className="text-gray-600 mb-6">{error || 'The tournament you are looking for does not exist.'}</p>
        <Link
          to="/tournaments"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Tournaments
        </Link>
      </div>
    )
  }

  return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
              <p className="mt-2 text-gray-600">{tournament.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(tournament.status)}`}>
                {tournament.status.replace('_', ' ')}
              </span>
              {isAdmin && (
                <button
                  onClick={() => {
                    // TODO: Implement tournament management
                    alert('Tournament management coming soon!')
                  }}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Manage
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tournament Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Game Type</span>
                  <p className="text-sm text-gray-900">{tournament.game_type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Bracket Type</span>
                  <p className="text-sm text-gray-900">{tournament.bracket_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Participants</span>
                  <p className="text-sm text-gray-900">{participants.length}/{tournament.max_participants}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <p className="text-sm text-gray-900">{formatDate(tournament.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Join/Leave Section */}
            {user && (
              <div className="bg-white rounded-lg shadow p-6">
                {isAdmin ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Admin</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">You're automatically registered as a participant</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">You can manage participants and tournament settings</span>
                      </div>
                      <button
                        onClick={() => {
                          // TODO: Implement tournament management
                          alert('Tournament management coming soon!')
                        }}
                        className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Manage Tournament
                      </button>
                    </div>
                  </div>
                ) : canJoin ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Join Tournament</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                          Team Name (optional)
                        </label>
                        <input
                          type="text"
                          id="teamName"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter team name"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={handleJoinTournament}
                        disabled={joining}
                        className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {joining ? 'Joining...' : 'Join Tournament'}
                      </button>
                    </div>
                  </div>
                ) : isParticipant ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">You're in!</h3>
                    <button
                      onClick={handleLeaveTournament}
                      className="w-full px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Leave Tournament
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Full</h3>
                    <p className="text-sm text-gray-600">This tournament has reached its maximum capacity.</p>
                  </div>
                )}
              </div>
            )}

            {/* Participants */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Participants</h3>
              <div className="space-y-2">
                {participants.map((participant) => {
                  const isParticipantAdmin = participant.user_id === tournament.admin_id
                  return (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {participant.team_name || 'Individual Player'}
                          </p>
                          {isParticipantAdmin && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{participant.user_id}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getParticipantStatusColor(participant.status)}`}>
                        {participant.status}
                      </span>
                    </div>
                  )
                })}
                {participants.length === 0 && (
                  <p className="text-sm text-gray-500">No participants yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bracket View */}
        {matches.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tournament Bracket</h2>
            <BracketView
              matches={matches}
              participants={participants}
              onMatchClick={(match) => {
                // Handle match click - could open a modal to update results
                console.log('Match clicked:', match)
              }}
            />
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
      </div>
  )
} 