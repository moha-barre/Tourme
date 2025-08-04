import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuthStore, useTournamentStore } from "../../../lib/store";
import { supabase } from "../../../lib/supabase";
import type { Database } from "../../../lib/supabase";

type Profile = Database['public']['Tables']['profiles']['Row']
type Tournament = Database['public']['Tables']['tournaments']['Row']
type Participant = Database['public']['Tables']['participants']['Row']
type Match = Database['public']['Tables']['matches']['Row']

// Enhanced Match interface for display
interface EnhancedMatch extends Match {
  player1?: Participant;
  player2?: Participant;
  winner?: Participant;
}

// Status Badge Component
const StatusBadge: React.FC<{ status: Match['status'] }> = ({ status }) => {
  const statusConfig = {
    pending: { 
      color: 'bg-gray-100 text-gray-700 border-gray-200', 
      text: 'Pending', 
      icon: '⏳',
      pulse: false
    },
    in_progress: { 
      color: 'bg-red-100 text-red-700 border-red-200', 
      text: 'LIVE', 
      icon: '🔥',
      pulse: true
    },
    completed: { 
      color: 'bg-green-100 text-green-700 border-green-200', 
      text: 'Completed', 
      icon: '✅',
      pulse: false
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}>
      <span className="mr-1.5">{config.icon}</span>
      {config.pulse && (
        <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
      )}
      {config.text}
    </span>
  );
};

// Enhanced MatchCard component
const MatchCard: React.FC<{ 
  match: EnhancedMatch; 
  isAdmin: boolean;
  onUpdateResult?: (matchId: string, winnerId: string, score1: number, score2: number) => void;
  onStartMatch?: (matchId: string) => void;
}> = ({ match, isAdmin, onUpdateResult, onStartMatch }) => {
  const { player1, player2, winner, round, match_number, status, score1, score2 } = match;

  const [isEditing, setIsEditing] = useState(false);
  const [editScore1, setEditScore1] = useState(score1 || 0);
  const [editScore2, setEditScore2] = useState(score2 || 0);
  const [editWinner, setEditWinner] = useState(winner?.id || '');

  const handleSaveResult = () => {
    if (onUpdateResult && editWinner) {
      onUpdateResult(match.id, editWinner, editScore1, editScore2);
      setIsEditing(false);
    }
  };

  const getRoundName = (round: number) => {
    const roundNames: { [key: number]: string } = {
      1: 'First Round',
      2: 'Second Round', 
      3: 'Quarter Finals',
      4: 'Semi Finals',
      5: 'Finals',
      6: 'Grand Finals'
    };
    return roundNames[round] || `Round ${round}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02]">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <StatusBadge status={status} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="text-sm text-gray-700 font-semibold">
                {getRoundName(round)}
              </span>
              <span className="text-xs text-gray-500 sm:block hidden">•</span>
              <span className="text-xs text-gray-500">
                Match #{match_number}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {new Date(match.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Match Content */}
      <div className="px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Player 1 */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-base sm:text-lg font-bold shadow-lg transition-all duration-300 ${
                winner?.id === player1?.id 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-4 ring-yellow-200' 
                  : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:shadow-xl'
              }`}>
                {player1?.display_name?.charAt(0) || player1?.team_name?.charAt(0) || 'TBD'}
              </div>
              {winner?.id === player1?.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                  👑
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {player1?.display_name || player1?.team_name || 'TBD'}
              </h4>
              {player1?.team_name && player1?.display_name && (
                <p className="text-sm text-gray-600 truncate">{player1.team_name}</p>
              )}
            </div>
          </div>

          {/* Score/VS */}
          <div className="flex flex-col items-center mx-4 sm:mx-6">
            {status === 'completed' || status === 'in_progress' ? (
              <div className="text-center">
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={editScore1}
                      onChange={(e) => setEditScore1(parseInt(e.target.value) || 0)}
                      className="w-12 text-center border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <span className="text-xl font-bold text-gray-400">-</span>
                    <input
                      type="number"
                      value={editScore2}
                      onChange={(e) => setEditScore2(parseInt(e.target.value) || 0)}
                      className="w-12 text-center border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gray-50 rounded-lg px-4 py-2">
                    {score1 || 0} - {score2 || 0}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">Score</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-400 bg-gray-50 rounded-lg px-4 py-2">VS</div>
                <div className="text-xs text-gray-500 mt-1">vs</div>
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <div className="flex-1 text-right min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {player2?.display_name || player2?.team_name || 'TBD'}
              </h4>
              {player2?.team_name && player2?.display_name && (
                <p className="text-sm text-gray-600 truncate">{player2.team_name}</p>
              )}
            </div>
            <div className="relative">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-base sm:text-lg font-bold shadow-lg transition-all duration-300 ${
                winner?.id === player2?.id 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white ring-4 ring-yellow-200' 
                  : 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl'
              }`}>
                {player2?.display_name?.charAt(0) || player2?.team_name?.charAt(0) || 'TBD'}
              </div>
              {winner?.id === player2?.id && (
                <div className="absolute -top-1 -left-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                  👑
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <span className="text-sm font-medium text-gray-700">Admin Controls</span>
              <div className="flex flex-wrap gap-2">
                {status === 'pending' && onStartMatch && (
                  <button
                    onClick={() => onStartMatch(match.id)}
                    className="inline-flex items-center px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Match
                  </button>
                )}
                {status !== 'completed' && (
                  isEditing ? (
                    <>
                      <select
                        value={editWinner}
                        onChange={(e) => setEditWinner(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Winner</option>
                        {player1 && <option value={player1.id}>{player1.display_name || player1.team_name}</option>}
                        {player2 && <option value={player2.id}>{player2.display_name || player2.team_name}</option>}
                      </select>
                      <button
                        onClick={handleSaveResult}
                        disabled={!editWinner}
                        className="inline-flex items-center px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update Result
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
          <span className="text-xs text-gray-500">Match ID: {match.id.slice(0, 8)}...</span>
          <span className="text-xs text-gray-500">{getRoundName(round)}</span>
        </div>
      </div>
    </div>
  );
};

// Tournament Matches Page
const TournamentMatches: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<EnhancedMatch[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch tournament, matches and participants
  useEffect(() => {
    if (id) {
      fetchTournamentData();
    }
  }, [id]);

  const fetchTournamentData = async () => {
    setLoading(true);
    try {
      // Fetch tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Fetch matches for this tournament
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', id)
        .order('round', { ascending: true })
        .order('match_number', { ascending: true });

      if (matchesError) throw matchesError;

      // Fetch participants for this tournament
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', id);

      if (participantsError) throw participantsError;

      setParticipants(participantsData || []);

      // Enhance matches with participant data
      const enhancedMatches = (matchesData || []).map(match => ({
        ...match,
        player1: participantsData?.find(p => p.id === match.player1_id),
        player2: participantsData?.find(p => p.id === match.player2_id),
        winner: participantsData?.find(p => p.id === match.winner_id),
      }));

      setMatches(enhancedMatches);
    } catch (error) {
      console.error('Error fetching tournament data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async (matchId: string, winnerId: string, score1: number, score2: number) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          winner_id: winnerId,
          score1,
          score2,
          status: 'completed',
        })
        .eq('id', matchId);

      if (error) throw error;

      // Check if this was the last match and close tournament
      const updatedMatches = matches.map(m => 
        m.id === matchId 
          ? { ...m, status: 'completed', winner_id: winnerId, score1, score2 }
          : m
      );
      
      const allCompleted = updatedMatches.every(m => m.status === 'completed');
      if (allCompleted && tournament && tournament.status !== 'completed') {
        await handleCloseTournament();
      } else {
        // Refresh matches
        fetchTournamentData();
      }
    } catch (error) {
      console.error('Error updating match result:', error);
    }
  };

  const handleStartMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'in_progress',
        })
        .eq('id', matchId);

      if (error) throw error;

      // Refresh matches
      fetchTournamentData();
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const handleStartAllMatches = async () => {
    try {
      const pendingMatches = matches.filter(m => m.status === 'pending');
      if (pendingMatches.length === 0) return;

      const { error } = await supabase
        .from('matches')
        .update({ status: 'in_progress' })
        .in('id', pendingMatches.map(m => m.id));

      if (error) throw error;

      // Refresh matches
      fetchTournamentData();
    } catch (error) {
      console.error('Error starting all matches:', error);
    }
  };

  const handleCloseTournament = async () => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      // Refresh tournament data
      fetchTournamentData();
    } catch (error) {
      console.error('Error closing tournament:', error);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filterStatus !== 'all' && match.status !== filterStatus) return false;
    return true;
  });

  const completedMatches = filteredMatches.filter(m => m.status === 'completed');
  const liveMatches = filteredMatches.filter(m => m.status === 'in_progress');
  const pendingMatches = filteredMatches.filter(m => m.status === 'pending');

  const isAdmin = tournament?.admin_id === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tournament matches...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tournament not found</h3>
          <p className="text-gray-600">The tournament you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <Link 
                    to={`/tournaments/${id}`}
                    className="inline-flex items-center text-indigo-100 hover:text-white text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Tournament
                  </Link>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{tournament.name}</h1>
                <p className="mt-2 text-indigo-100">Tournament bracket matches and results</p>
              </div>
              
              {/* Stats Cards - Mobile Responsive */}
              <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-lg font-bold text-white">{completedMatches.length}</div>
                  <div className="text-xs text-indigo-100">Completed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-lg font-bold text-white">{liveMatches.length}</div>
                  <div className="text-xs text-indigo-100">Live</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="text-lg font-bold text-white">{pendingMatches.length}</div>
                  <div className="text-xs text-indigo-100">Pending</div>
                </div>
              </div>
            </div>

            {/* Tournament Info & Actions */}
            <div className="mt-6 space-y-4">
              {/* Tournament Info Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-sm text-indigo-200">Game Type</span>
                    <p className="font-semibold text-white">{tournament.game_type}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-sm text-indigo-200">Status</span>
                    <p className="font-semibold text-white capitalize">{tournament.status.replace('_', ' ')}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-sm text-indigo-200">Participants</span>
                    <p className="font-semibold text-white">{tournament.current_participants}/{tournament.max_participants}</p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Tournament Management</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {pendingMatches.length > 0 && (
                      <button
                        onClick={handleStartAllMatches}
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start All Matches ({pendingMatches.length})
                      </button>
                    )}
                    {completedMatches.length === matches.length && matches.length > 0 && tournament.status !== 'completed' && (
                      <button
                        onClick={handleCloseTournament}
                        className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Close Tournament
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all" className="bg-gray-800">All Matches</option>
                  <option value="pending" className="bg-gray-800">Pending</option>
                  <option value="in_progress" className="bg-gray-800">Live</option>
                  <option value="completed" className="bg-gray-800">Completed</option>
                </select>
                
                <div className="text-sm text-indigo-200">
                  Showing {filteredMatches.length} of {matches.length} matches
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4 animate-bounce">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {matches.length === 0 
                ? "No bracket has been generated for this tournament yet." 
                : "No matches match your current filters."
              }
            </p>
            {matches.length === 0 && isAdmin && (
              <div className="mt-6">
                <Link
                  to={`/tournaments/manage/${id}`}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate Bracket
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                  Live Matches ({liveMatches.length})
                </h2>
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1">
                  {liveMatches.map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      isAdmin={isAdmin}
                      onUpdateResult={handleUpdateResult}
                      onStartMatch={handleStartMatch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Matches */}
            {pendingMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-3 h-3 bg-gray-400 rounded-full mr-3"></span>
                  Pending Matches ({pendingMatches.length})
                </h2>
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1">
                  {pendingMatches.map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      isAdmin={isAdmin}
                      onUpdateResult={handleUpdateResult}
                      onStartMatch={handleStartMatch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Matches */}
            {completedMatches.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  Completed Matches ({completedMatches.length})
                </h2>
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1">
                  {completedMatches.map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      isAdmin={isAdmin}
                      onUpdateResult={handleUpdateResult}
                      onStartMatch={handleStartMatch}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentMatches; 