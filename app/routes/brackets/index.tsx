import React, { useEffect, useState, useRef } from 'react';
import { BracketView, type BracketRound } from '../../components/BracketView';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router';

export default function BracketsPage() {
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pulseMatchIds, setPulseMatchIds] = useState<string[]>([]);
  const pulseTimeout = useRef<any>(null);
  // TODO: Get current user id from store if available
  const currentUserId = undefined;

  async function fetchBracketData(updatedMatchId?: string) {
    setLoading(true);
    setError('');
    try {
      const { data: tournaments, error: tErr } = await supabase
        .from('tournaments')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);
      if (tErr) throw tErr;
      if (!tournaments || tournaments.length === 0) {
        setRounds([]);
        setLoading(false);
        return;
      }
      const tournamentId = tournaments[0].id;
      const { data: matches, error: mErr } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('match_number', { ascending: true });
      if (mErr) throw mErr;
      const roundsMap = new Map<number, any[]>();
      matches.forEach((match: any) => {
        if (!roundsMap.has(match.round)) roundsMap.set(match.round, []);
        const arr = roundsMap.get(match.round);
        if (arr) arr.push(match);
      });
      // Fetch participants for the tournament
      const { data: participants, error: pErr } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', tournamentId);
      if (pErr) throw pErr;
      const bracketRounds: BracketRound[] = Array.from(roundsMap.entries()).map(([round, matches]) => ({
        title: `Round ${round}`,
        seeds: matches.map((match: any) => {
          const team1 = participants?.find((p: any) => p.id === match.player1_id);
          const team2 = participants?.find((p: any) => p.id === match.player2_id);
          return {
            id: match.id,
            teams: [
              { id: team1?.id, name: team1?.display_name || team1?.team_name || 'TBD' },
              { id: team2?.id, name: team2?.display_name || team2?.team_name || 'TBD' },
            ],
            winner: match.status === 'completed'
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
      setRounds(bracketRounds);
      if (updatedMatchId) {
        setPulseMatchIds([updatedMatchId]);
        if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
        pulseTimeout.current = setTimeout(() => setPulseMatchIds([]), 1200);
      }
    } catch (err) {
      setError('Failed to load brackets.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBracketData();
    // Subscribe to real-time updates
    const channel = supabase
      .channel('public:matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, payload => {
        const updatedMatchId =
          (payload.new && 'id' in payload.new ? payload.new.id : undefined) ||
          (payload.old && 'id' in payload.old ? payload.old.id : undefined);
        fetchBracketData(updatedMatchId);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Tournament Brackets</h1>
        <div className="flex justify-center mb-6">
          <Link to="/home" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
        <div className="overflow-x-auto rounded-lg shadow bg-white p-4">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : rounds.length === 0 ? (
            <div className="text-center text-gray-500">No brackets found.</div>
          ) : (
            <BracketView rounds={rounds} currentUserId={currentUserId} pulseMatchIds={pulseMatchIds} />
          )}
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          Powered by <a href="https://github.com/mohux/react-brackets" className="underline" target="_blank" rel="noopener noreferrer">react-brackets</a>
        </div>
      </div>
    </div>
  );
} 