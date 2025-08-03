import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useAuthStore } from '../../../lib/store'
import { supabase } from '../../../lib/supabase'
import { formatDate, getStatusColor, getParticipantStatusColor } from '../../../lib/utils'
import { BracketView } from '../../../components/BracketView'
import { MatchResultModal } from '../../../components/MatchResultModal'
import { AddParticipantModal } from '../../../components/AddParticipantModal'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { Card, CardContent } from '../../../components/Card'
import { LoadingSpinner } from '../../../components/LoadingSpinner'
import { EmptyState } from '../../../components/EmptyState'
import { 
  Trophy, 
  Users, 
  CheckCircle, 
  XCircle, 
  Play, 
  Award,
  Settings,
  Eye,
  UserPlus,
  Trash2
} from 'lucide-react'
import type { Database } from '../../../lib/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Participant = Database['public']['Tables']['participants']['Row']
type Match = Database['public']['Tables']['matches']['Row']

export default function TournamentManagePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generatingBracket, setGeneratingBracket] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false)
  const [addingParticipants, setAddingParticipants] = useState(false)

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
        .order('created_at', { ascending: true })
      
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

  const handleParticipantAction = async (participantId: string, action: 'accept' | 'reject' | 'withdraw') => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ status: action === 'withdraw' ? 'withdrawn' : action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', participantId)
      
      if (error) throw error
      
      // Refresh data
      await fetchTournamentData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update participant status')
    }
  }

  const handleGenerateBracket = async () => {
    try {
      setGeneratingBracket(true)
      
      // Import and use the bracket generator
      const { BracketGenerator } = await import('../../../lib/bracket-generator')
      const acceptedParticipants = participants.filter(p => p.status === 'accepted')
      
      if (acceptedParticipants.length < 2) {
        throw new Error('Need at least 2 accepted participants to generate bracket')
      }
      
      const matches = BracketGenerator.generateSingleElimination(id!, acceptedParticipants)
      
      // Insert matches into database
      const { error: matchesError } = await supabase
        .from('matches')
        .insert(matches)
      
      if (matchesError) throw matchesError
      
      // Update tournament status to in_progress
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({ status: 'in_progress' })
        .eq('id', id)
      
      if (tournamentError) throw tournamentError
      
      // Refresh data
      await fetchTournamentData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate bracket')
    } finally {
      setGeneratingBracket(false)
    }
  }

  const handleUpdateTournamentStatus = async (newStatus: Tournament['status']) => {
    try {
      setUpdatingStatus(true)
      
      const { error } = await supabase
        .from('tournaments')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      
      // Refresh data
      await fetchTournamentData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tournament status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleMatchResult = async (matchId: string, winnerId: string, score1: number, score2: number) => {
    try {
      // Find the current match to get round and match number
      const currentMatch = matches.find(m => m.id === matchId)
      if (!currentMatch) throw new Error('Match not found')

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
      
      // Advance the winner to the next round
      const { BracketGenerator } = await import('../../../lib/bracket-generator')
      await BracketGenerator.advancePlayerToNextRound(
        id!,
        winnerId,
        currentMatch.round,
        currentMatch.match_number,
        supabase
      )
      
      // Refresh data
      await fetchTournamentData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update match result')
    }
  }

  const handleAddParticipants = async (newParticipants: { display_name: string; team_name?: string }[]) => {
    try {
      setAddingParticipants(true)
      setError('')
      
      console.log('Adding participants:', newParticipants)
      
      // Insert new participants
      const participantsToInsert = newParticipants.map(p => ({
        tournament_id: id!,
        display_name: p.display_name.trim(),
        team_name: p.team_name?.trim() || null,
        status: 'accepted' as const
      }))

      console.log('Participants to insert:', participantsToInsert)

      const { data, error } = await supabase
        .from('participants')
        .insert(participantsToInsert)
        .select()
      
      if (error) {
        console.error('Database error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      
      console.log('Inserted participants:', data)
      
      // Update tournament current_participants count
      const newTotal = participants.length + newParticipants.length
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ current_participants: newTotal })
        .eq('id', id)
      
      if (updateError) {
        console.error('Tournament update error:', updateError)
        throw new Error(`Failed to update tournament: ${updateError.message}`)
      }
      
      // Refresh data
      await fetchTournamentData()
    } catch (err) {
      console.error('Error in handleAddParticipants:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to add participants')
    } finally {
      setAddingParticipants(false)
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId)
      
      if (error) throw error
      
      // Update tournament current_participants count
      const newTotal = Math.max(0, participants.length - 1)
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ current_participants: newTotal })
        .eq('id', id)
      
      if (updateError) throw updateError
      
      // Refresh data
      await fetchTournamentData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <LoadingSpinner size="lg" text="Loading tournament management..." />
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

  // Check if user is admin
  if (tournament.admin_id !== user?.id) {
    return (
      <div className="max-w-7xl mx-auto">
        <EmptyState
          icon={Settings}
          title="Access Denied"
          description="You don't have permission to manage this tournament."
          action={{
            label: "View Tournament",
            href: `/tournaments/${id}`
          }}
        />
      </div>
    )
  }

  const pendingParticipants = participants.filter(p => p.status === 'pending')
  const acceptedParticipants = participants.filter(p => p.status === 'accepted')
  const canGenerateBracket = acceptedParticipants.length >= 2 && tournament.status === 'open'
  const canStartTournament = matches.length > 0 && tournament.status === 'open'

  return (
    <div className="max-w-7xl mx-auto">
              {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Tournament</h1>
              <p className="mt-2 text-gray-600 max-w-2xl">{tournament.name}</p>
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
              <Link to={`/tournaments/edit/${id}`}>
                <Button variant="outline" size="md" icon={Settings}>
                  Edit
                </Button>
              </Link>
              <Link to={`/tournaments/${id}`}>
                <Button variant="outline" size="md" icon={Eye}>
                  View Tournament
                </Button>
              </Link>
            </div>
          </div>
        </div>

      {/* Tournament Actions */}
      <Card className="mb-8">
        <CardContent>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tournament Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canGenerateBracket && (
              <Button
                variant="primary"
                icon={Award}
                loading={generatingBracket}
                disabled={generatingBracket}
                onClick={handleGenerateBracket}
                className="w-full"
              >
                {generatingBracket ? 'Generating...' : 'Generate Bracket'}
              </Button>
            )}
            
            {canStartTournament && (
              <Button
                variant="primary"
                icon={Play}
                loading={updatingStatus}
                disabled={updatingStatus}
                onClick={() => handleUpdateTournamentStatus('in_progress')}
                className="w-full"
              >
                {updatingStatus ? 'Starting...' : 'Start Tournament'}
              </Button>
            )}
            
            {tournament.status === 'in_progress' && (
              <Button
                variant="primary"
                icon={Award}
                loading={updatingStatus}
                disabled={updatingStatus}
                onClick={() => handleUpdateTournamentStatus('completed')}
                className="w-full"
              >
                {updatingStatus ? 'Completing...' : 'Complete Tournament'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants Management */}
      <Card className="mb-8">
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Participants</h2>
              <p className="text-sm text-gray-600">
                {participants.length} of {tournament.max_participants} participants
              </p>
            </div>
            {tournament.status === 'open' && participants.length < tournament.max_participants && (
              <Button
                variant="primary"
                icon={UserPlus}
                onClick={() => setShowAddParticipantModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Add Participants
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{participants.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-900">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingParticipants.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{acceptedParticipants.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Participants */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pending Participants ({pendingParticipants.length})
              </h3>
              <div className="space-y-3">
                {pendingParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {(participant.team_name || participant.display_name || participant.user_id || '?')[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {participant.display_name || participant.team_name || 'Individual Player'}
                        </p>
                        {participant.team_name && participant.display_name && (
                          <p className="text-xs text-gray-500">{participant.team_name}</p>
                        )}
                        {participant.user_id && (
                          <p className="text-xs text-gray-500">User ID: {participant.user_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleParticipantAction(participant.id, 'accept')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleParticipantAction(participant.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingParticipants.length === 0 && (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No pending participants</p>
                  </div>
                )}
              </div>
            </div>

            {/* Accepted Participants */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Accepted Participants ({acceptedParticipants.length})
              </h3>
              <div className="space-y-3">
                {acceptedParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {(participant.team_name || participant.display_name || participant.user_id || '?')[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {participant.display_name || participant.team_name || 'Individual Player'}
                        </p>
                        {participant.team_name && participant.display_name && (
                          <p className="text-xs text-gray-500">{participant.team_name}</p>
                        )}
                        {participant.user_id && (
                          <p className="text-xs text-gray-500">User ID: {participant.user_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="success" size="sm">
                        {participant.status}
                      </Badge>
                      {tournament.status === 'open' && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Remove participant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {acceptedParticipants.length === 0 && (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No accepted participants</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bracket Management */}
      {matches.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tournament Bracket</h2>
            <BracketView
              matches={matches}
              participants={participants}
              onMatchClick={(match) => {
                setSelectedMatch(match)
                setShowMatchModal(true)
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

      {/* Match Result Modal */}
      <MatchResultModal
        match={selectedMatch}
        participants={participants}
        isOpen={showMatchModal}
        onClose={() => {
          setShowMatchModal(false)
          setSelectedMatch(null)
        }}
        onSubmit={handleMatchResult}
      />

      {/* Add Participant Modal */}
      <AddParticipantModal
        isOpen={showAddParticipantModal}
        onClose={() => setShowAddParticipantModal(false)}
        onSubmit={handleAddParticipants}
        loading={addingParticipants}
        maxParticipants={tournament.max_participants}
        currentParticipants={participants.length}
      />
    </div>
  )
} 