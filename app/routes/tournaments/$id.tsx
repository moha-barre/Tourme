import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { BracketView, type BracketRound } from '../../components/BracketView'
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

// Helper to convert matches and participants to BracketRound[]
function convertMatchesToRounds(matches: Match[], participants: Participant[]): BracketRound[] {
  if (!matches || matches.length === 0) return [];
  // Group matches by round
  const roundsMap = new Map<number, Match[]>();
  matches.forEach((match) => {
    if (!roundsMap.has(match.round)) roundsMap.set(match.round, []);
    roundsMap.get(match.round)!.push(match);
  });
  // Sort rounds numerically
  const sortedRounds = Array.from(roundsMap.entries()).sort((a, b) => a[0] - b[0]);
  // Build BracketRound[]
  return sortedRounds.map(([round, roundMatches], idx) => ({
    title: `Round ${round}`,
    seeds: roundMatches.map((match) => {
      // Find participant info for both teams
      const team1 = participants.find((p) => p.id === match.player1_id);
      const team2 = participants.find((p) => p.id === match.player2_id);
      return {
        id: match.id,
        teams: [
          { id: team1?.id, name: team1?.display_name || team1?.team_name || 'TBD' },
          { id: team2?.id, name: team2?.display_name || team2?.team_name || 'TBD' },
        ],
        winner:
          match.status === 'completed'
            ? match.winner_id === match.player1_id
              ? 0
              : match.winner_id === match.player2_id
              ? 1
              : null
            : null,
        score: [match.score1 ?? null, match.score2 ?? null],
      };
    }),
  }));
}

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Link 
                    to="/tournaments"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-sm text-gray-600">Tournaments</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{tournament.name}</h1>
                <p className="text-gray-600 text-lg max-w-3xl">{tournament.description}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={tournament.status === 'completed' ? 'success' : 
                            tournament.status === 'in_progress' ? 'info' : 
                            tournament.status === 'open' ? 'warning' : 'default'}
                    size="lg"
                  >
                    {tournament.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {matches.length > 0 && (
                    <Link to={`/tournaments/${id}/matches`}>
                      <Button variant="outline" size="md" className="w-full sm:w-auto">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Matches ({matches.length})
                      </Button>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to={`/tournaments/manage/${id}`}>
                      <Button variant="primary" size="md" className="w-full sm:w-auto">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Tournament Overview */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">Tournament Overview</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Game Type</p>
                        <p className="text-base font-semibold text-gray-900">{tournament.game_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Bracket Type</p>
                        <p className="text-base font-semibold text-gray-900">{tournament.bracket_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Participants</p>
                        <p className="text-base font-semibold text-gray-900">{participants.length}/{tournament.max_participants}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="text-base font-semibold text-gray-900">{formatDate(tournament.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="p-6">
                {user ? (
                  isAdmin ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700">You're the tournament admin</span>
                      </div>
                      <Link to={`/tournaments/manage/${id}`} className="w-full">
                        <Button variant="primary" size="md" className="w-full">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Manage Tournament
                        </Button>
                      </Link>
                    </div>
                  ) : canJoin ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                          Team Name (optional)
                        </label>
                        <input
                          type="text"
                          id="teamName"
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your team name"
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
                        {joining ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Joining...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Join Tournament
                          </>
                        )}
                      </Button>
                    </div>
                  ) : isParticipant ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-blue-700">You're registered for this tournament</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="md" 
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        onClick={handleLeaveTournament}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Leave Tournament
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Tournament is full</span>
                      </div>
                      <p className="text-sm text-gray-600">This tournament has reached its maximum capacity.</p>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-700">Sign in to join</span>
                    </div>
                    <Link to="/auth/signin" className="w-full">
                      <Button variant="primary" size="md" className="w-full">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Participants ({participants.length})</h3>
              </div>
              <div className="p-6">
                {participants.length > 0 ? (
                  <div className="space-y-3">
                    {participants.map((participant) => {
                      const isParticipantAdmin = participant.user_id === tournament.admin_id
                      return (
                        <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-sm font-semibold text-white">
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
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No participants yet</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to join!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Matches Overview Section */}
        {matches.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <h2 className="text-xl font-semibold text-gray-900">Tournament Bracket</h2>
                  <Link to={`/tournaments/${id}/matches`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View All Matches
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-green-800">Completed</span>
                      </div>
                      <span className="text-lg font-bold text-green-700">
                        {matches.filter(m => m.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-sm font-medium text-red-800">Live</span>
                      </div>
                      <span className="text-lg font-bold text-red-700">
                        {matches.filter(m => m.status === 'in_progress').length}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-800">Pending</span>
                      </div>
                      <span className="text-lg font-bold text-gray-700">
                        {matches.filter(m => m.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <BracketView
                    rounds={convertMatchesToRounds(matches, participants)}
                    currentUserId={user?.id}
                  />
                </div>
              </div>
            </div>
          </div>
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