import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { BracketView } from '../../components/BracketView'
import { useAuthStore, useTournamentStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import { formatDate, getStatusColor, getParticipantStatusColor } from '../../lib/utils'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Card, CardContent } from '../../components/Card'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { Trophy, Users, Calendar, Award } from 'lucide-react'
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
        <LoadingSpinner size="lg" text="Loading tournament..." />
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="max-w-7xl mx-auto">
        <EmptyState
          icon={Trophy}
          title="Tournament not found"
          description={error || 'The tournament you are looking for does not exist.'}
          action={{
            label: "Back to Tournaments",
            href: "/tournaments"
          }}
        />
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
              <p className="mt-2 text-gray-600 max-w-2xl">{tournament.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                variant={tournament.status === 'completed' ? 'success' : 
                        tournament.status === 'in_progress' ? 'info' : 
                        tournament.status === 'open' ? 'warning' : 'default'}
                size="lg"
              >
                {tournament.status.replace('_', ' ')}
              </Badge>
              {isAdmin && (
                <Link to={`/tournaments/manage/${id}`}>
                  <Button variant="primary" size="md">
                    Manage
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tournament Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Game Type</p>
                      <p className="text-sm font-semibold text-gray-900">{tournament.game_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bracket Type</p>
                      <p className="text-sm font-semibold text-gray-900">{tournament.bracket_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Participants</p>
                      <p className="text-sm font-semibold text-gray-900">{participants.length}/{tournament.max_participants}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(tournament.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Join/Leave Section */}
            {user && (
              <Card>
                <CardContent>
                  {isAdmin ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Admin</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">You're automatically registered as a participant</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">You can manage participants and tournament settings</span>
                        </div>
                        <Link to={`/tournaments/manage/${id}`} className="w-full">
                          <Button variant="primary" size="md" className="w-full">
                            Manage Tournament
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : canJoin ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Join Tournament</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                            Team Name (optional)
                          </label>
                          <input
                            type="text"
                            id="teamName"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter team name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="primary" 
                          size="md" 
                          loading={joining}
                          disabled={joining}
                          className="w-full"
                          onClick={handleJoinTournament}
                        >
                          {joining ? 'Joining...' : 'Join Tournament'}
                        </Button>
                      </div>
                    </div>
                  ) : isParticipant ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">You're in!</h3>
                      <Button 
                        variant="outline" 
                        size="md" 
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        onClick={handleLeaveTournament}
                      >
                        Leave Tournament
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Full</h3>
                      <p className="text-sm text-gray-600">This tournament has reached its maximum capacity.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
                <div className="space-y-3">
                  {participants.map((participant) => {
                    const isParticipantAdmin = participant.user_id === tournament.admin_id
                    return (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {(participant.team_name || participant.display_name || participant.user_id || '?')[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                                                          <p className="text-sm font-semibold text-gray-900">
                              {participant.display_name || participant.team_name || 'Individual Player'}
                            </p>
                              {isParticipantAdmin && (
                                <Badge variant="info" size="sm">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{participant.user_id}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={participant.status === 'accepted' ? 'success' : 
                                  participant.status === 'pending' ? 'warning' : 
                                  participant.status === 'rejected' ? 'danger' : 'default'}
                          size="sm"
                        >
                          {participant.status}
                        </Badge>
                      </div>
                    )
                  })}
                  {participants.length === 0 && (
                    <div className="text-center py-6">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No participants yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bracket View */}
        {matches.length > 0 && (
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tournament Bracket</h2>
              <BracketView
                matches={matches}
                participants={participants}
                onMatchClick={(match) => {
                  // Handle match click - could open a modal to update results
                  console.log('Match clicked:', match)
                }}
              />
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <div className="text-sm font-medium text-red-700">{error}</div>
            </div>
          </div>
        )}
      </div>
  )
} 