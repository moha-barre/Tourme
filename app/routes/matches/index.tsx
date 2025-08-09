import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuthStore, useTournamentStore } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../lib/supabase";

type Profile = Database['public']['Tables']['profiles']['Row']
type Tournament = Database['public']['Tables']['tournaments']['Row']
type Participant = Database['public']['Tables']['participants']['Row']
type Match = Database['public']['Tables']['matches']['Row']

interface EnhancedMatch extends Match {
  tournament?: Tournament;
  player1?: Participant;
  player2?: Participant;
  winner?: Participant;
}

const StatusBadge: React.FC<{ status: Match['status'] }> = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-gray-100 text-gray-700', text: 'Pending', icon: '⏳' },
    in_progress: { color: 'bg-red-100 text-red-700', text: 'LIVE', icon: '🔥' },
    completed: { color: 'bg-green-100 text-green-700', text: 'Completed', icon: '✅' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {status === 'in_progress' && (
        <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
      )}
      {config.text}
    </span>
  );
};

const MatchCard: React.FC<{ 
  match: EnhancedMatch; 
  isAdmin: boolean;
  onUpdateResult?: (matchId: string, winnerId: string, score1: number, score2: number) => void;
}> = ({ match, isAdmin, onUpdateResult }) => {
  const { tournament, player1, player2, winner, round, match_number, status, score1, score2 } = match;

  const [isEditing, setIsEditing] = useState(false);
  const [editScore1, setEditScore1] = useState(score1 || 0);
  const [editScore2, setEditScore2] = useState(score2 || 0);
  const [editWinner, setEditWinner] = useState(winner?.id || '');
  const [isLoading, setIsLoading] = useState(false);

  const getRoundName = useCallback((round: number) => {
    const roundNames: Record<number, string> = {
      1: 'First Round',
      2: 'Second Round', 
      3: 'Quarter Finals',
      4: 'Semi Finals',
      5: 'Finals',
      6: 'Grand Finals'
    };
    return roundNames[round] || `Round ${round}`;
  }, []);

  const handleSaveResult = () => {
    if (onUpdateResult && editWinner) {
      onUpdateResult(match.id, editWinner, editScore1, editScore2);
      setIsEditing(false);
    }
  };

  const startMatch = async () => {
    setIsLoading(true);
    try {
      await supabase
        .from('matches')
        .update({ status: 'in_progress' })
        .eq('id', match.id);
    } catch (error) {
      console.error('Error starting match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusBadge status={status} />
            <span className="text-sm text-gray-600 font-medium">
              {getRoundName(round)} - Match #{match_number}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {tournament?.name || 'Tournament'}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(match.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Player 1 */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${
                winner?.id === player1?.id 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' 
                  : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
              }`}>
                {player1?.display_name?.charAt(0) || player1?.team_name?.charAt(0) || 'TBD'}
              </div>
              {winner?.id === player1?.id && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  👑
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 truncate max-w-[150px]">
                {player1?.display_name || player1?.team_name || 'TBD'}
              </h4>
              {player1?.team_name && player1?.display_name && (
                <p className="text-sm text-gray-600 truncate max-w-[150px]">{player1.team_name}</p>
              )}
            </div>
          </div>

          {/* Score/VS */}
          <div className="flex flex-col items-center mx-6">
            {status === 'completed' || status === 'in_progress' ? (
              <div className="text-center">
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={editScore1}
                      onChange={(e) => setEditScore1(parseInt(e.target.value) || 0)}
                      className="w-12 text-center border rounded px-2 py-1"
                      min="0"
                    />
                    <span className="text-xl font-bold text-gray-400">-</span>
                    <input
                      type="number"
                      value={editScore2}
                      onChange={(e) => setEditScore2(parseInt(e.target.value) || 0)}
                      className="w-12 text-center border rounded px-2 py-1"
                      min="0"
                    />
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {score1 || 0} - {score2 || 0}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">Score</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">VS</div>
                <div className="text-xs text-gray-500 mt-1">vs</div>
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <div className="flex-1 text-right">
              <h4 className="font-semibold text-gray-900 truncate max-w-[150px]">
                {player2?.display_name || player2?.team_name || 'TBD'}
              </h4>
              {player2?.team_name && player2?.display_name && (
                <p className="text-sm text-gray-600 truncate max-w-[150px]">{player2.team_name}</p>
              )}
            </div>
            <div className="relative">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${
                winner?.id === player2?.id 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' 
                  : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
              }`}>
                {player2?.display_name?.charAt(0) || player2?.team_name?.charAt(0) || 'TBD'}
              </div>
              {winner?.id === player2?.id && (
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  👑
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && status !== 'completed' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Admin Controls:</span>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <select
                      value={editWinner}
                      onChange={(e) => setEditWinner(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="">Select Winner</option>
                      {player1 && <option value={player1.id}>{player1.display_name || player1.team_name}</option>}
                      {player2 && <option value={player2.id}>{player2.display_name || player2.team_name}</option>}
                    </select>
                    <button
                      onClick={handleSaveResult}
                      disabled={!editWinner}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Update Result
                    </button>
                    <button
                      onClick={startMatch}
                      disabled={isLoading}
                      className={`px-3 py-1 text-white text-sm rounded ${
                        isLoading ? 'bg-gray-500' : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      {isLoading ? 'Starting...' : 'Start Match'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Match ID: {match.id.slice(0, 8)}...</span>
          <span>{getRoundName(round)}</span>
        </div>
      </div>
    </div>
  );
};

const Matches: React.FC = () => {
  const { user } = useAuthStore();
  const { tournaments } = useTournamentStore();
  const [matches, setMatches] = useState<EnhancedMatch[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch participants once on mount
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*');
          
        if (error) throw error;
        setParticipants(data || []);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError('Failed to load participants');
      }
    };
    
    fetchParticipants();
  }, []);

  // Fetch matches when tournament filter changes
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('matches')
          .select('*, tournament:tournaments(*)')
          .order('round', { ascending: true })
          .order('match_number', { ascending: true });

        if (selectedTournament !== 'all') {
          query = query.eq('tournament_id', selectedTournament);
        }

        const { data: matchesData, error: matchesError } = await query;
        if (matchesError) throw matchesError;

        // Create participant map for O(1) lookups
        const participantMap = new Map(participants.map(p => [p.id, p]));
        
        // Enhance matches with participant data
        const enhancedMatches = (matchesData || []).map(match => ({
          ...match,
          player1: match.player1_id ? participantMap.get(match.player1_id) : undefined,
          player2: match.player2_id ? participantMap.get(match.player2_id) : undefined,
          winner: match.winner_id ? participantMap.get(match.winner_id) : undefined,
        }));

        setMatches(enhancedMatches);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    if (participants.length > 0) fetchMatches();
  }, [selectedTournament, participants]);

  const handleUpdateResult = async (
  matchId: string, 
  winnerId: string, 
  score1: number, 
  score2: number
): Promise<void> => {
  setIsUpdating(true);
  setError(null);

  try {
    // 1. Get current match data with tournament relation
    const { data: currentMatch, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        tournament: tournaments (
          admin_id
        )
      `)
      .eq('id', matchId)
      .single();

    if (matchError) {
      throw new Error(`Failed to fetch match: ${matchError.message}`);
    }

    if (!currentMatch) {
      throw new Error('Match not found');
    }

    // 2. Verify admin status (client-side + server-side)
    if (currentMatch.tournament?.admin_id !== user?.id) {
      throw new Error('Only tournament admin can update results');
    }

    // 3. Prepare match update data
    const matchUpdate: Partial<Match> = {
      winner_id: winnerId,
      score1,
      score2,
      status: 'completed',
      updated_at: new Date().toISOString(),
    };

    // 4. Optimistic update for current match
    setMatches(prev => prev.map(m => 
      m.id === matchId ? { 
        ...m, 
        ...matchUpdate,
        winner: getParticipantById(winnerId),
      } : m
    ));

    // 5. Update current match in database
    const { error: updateError } = await supabase
      .from('matches')
      .update(matchUpdate)
      .eq('id', matchId);

    if (updateError) {
      throw new Error(`Match update failed: ${updateError.message}`);
    }

    // 6. Find next match in bracket
    const { data: nextMatches, error: nextMatchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', currentMatch.tournament_id)
      .eq('round', currentMatch.round + 1)
      .or(
        `source_match1_number.eq.${currentMatch.match_number},source_match2_number.eq.${currentMatch.match_number}`
      );

    if (nextMatchesError) {
      throw new Error(`Next match lookup failed: ${nextMatchesError.message}`);
    }

    // 7. Process next match if exists
    if (nextMatches && nextMatches.length > 0) {
      const nextMatch = nextMatches[0];
      const nextMatchUpdate: Partial<Match> = {
        updated_at: new Date().toISOString(),
      };

      // Determine which slot to update
      if (nextMatch.source_match1_number === currentMatch.match_number) {
        nextMatchUpdate.player1_id = winnerId;
      } else if (nextMatch.source_match2_number === currentMatch.match_number) {
        nextMatchUpdate.player2_id = winnerId;
      }

      // Only update if we found a valid slot
      if (nextMatchUpdate.player1_id || nextMatchUpdate.player2_id) {
        // 8. Optimistic update for next match
        setMatches(prev => prev.map(m => 
          m.id === nextMatch.id ? { 
            ...m, 
            ...nextMatchUpdate,
            player1: nextMatchUpdate.player1_id ? getParticipantById(nextMatchUpdate.player1_id) : m.player1,
            player2: nextMatchUpdate.player2_id ? getParticipantById(nextMatchUpdate.player2_id) : m.player2,
          } : m
        ));

        // 9. Update next match in database
        const { error: nextUpdateError } = await supabase
          .from('matches')
          .update(nextMatchUpdate)
          .eq('id', nextMatch.id);

        if (nextUpdateError) {
          throw new Error(`Next match update failed: ${nextUpdateError.message}`);
        }
      }
    }

    // 10. Success - optionally trigger any post-update actions
    if (onMatchCompleted) {
      onMatchCompleted(matchId);
    }

  } catch (err) {
    console.error('Match update error:', err);
    setError(err instanceof Error ? err.message : 'Failed to update match');
    
    // Revert optimistic updates
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return { 
          ...m, 
          winner_id: undefined,
          score1: undefined,
          score2: undefined,
          status: 'in_progress',
          winner: undefined,
        };
      }
      return m;
    }));

  } finally {
    setIsUpdating(false);
  }
};

  // Memoized filtered matches for performance
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (filterStatus !== 'all' && match.status !== filterStatus) return false;
      return true;
    });
  }, [matches, filterStatus]);

  // Memoized match categories
  const { completedMatches, liveMatches, pendingMatches } = useMemo(() => {
    return {
      completedMatches: filteredMatches.filter(m => m.status === 'completed'),
      liveMatches: filteredMatches.filter(m => m.status === 'in_progress'),
      pendingMatches: filteredMatches.filter(m => m.status === 'pending'),
    };
  }, [filteredMatches]);

  const isAdmin = useCallback((tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament?.admin_id === user?.id;
  }, [tournaments, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tournament Matches</h1>
                <p className="mt-2 text-gray-600">Track all matches, scores, and tournament progress</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{completedMatches.length} Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">{liveMatches.length} Live</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm tex