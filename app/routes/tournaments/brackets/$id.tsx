import { useEffect, useState, useRef } from 'react';
import TournamentBracket from '../../../components/TourBracket';
import { supabase } from '../../../lib/supabase';
import { Link, useParams } from 'react-router';

export default function BracketsPage() {
  const { id: tournamentId } = useParams();
  const [matches, setMatches] = useState<any[]>([]);
  const [participantsById, setParticipantsById] = useState<Record<string, { display_name: string }>>({});
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pulseTimeout = useRef<any>(null);
  const [pulseMatchIds, setPulseMatchIds] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState<number | null>(null);

  async function fetchBracketData(updatedMatchId?: string) {
    setLoading(true);
    setError('');
    try {
      // Fetch tournament info
      const { data: tournaments, error: tErr } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .limit(1);
      if (tErr) throw tErr;
      if (!tournaments || tournaments.length === 0) {
        setMatches([]);
        setParticipantsById({});
        setTournament(null);
        setLoading(false);
        return;
      }
      setTournament(tournaments[0]);

      // Fetch matches
      const { data: matches, error: mErr } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('match_number', { ascending: true });
      if (mErr) throw mErr;

      // Fetch participants
      const { data: participants, error: pErr } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', tournamentId);
      if (pErr) throw pErr;

      // Build participantsById for easy lookup
      const participantsMap: Record<string, { display_name: string }> = {};
      (participants || []).forEach((p: any) => {
        participantsMap[p.id] = { display_name: p.display_name || p.team_name || 'TBD' };
      });

      setMatches(matches || []);
      setParticipantsById(participantsMap);

      // Set current round to the first incomplete round
      if (matches && matches.length > 0) {
        const incomplete = matches.find((m: any) => !m.winner_id);
        setCurrentRound(incomplete ? incomplete.round : matches[matches.length - 1].round);
      } else {
        setCurrentRound(null);
      }

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
    // eslint-disable-next-line
  }, [tournamentId]);

  // Handler for when a match winner is selected
  const handleMatchWinner = async (match: any, winnerId: string) => {
    await supabase
      .from('matches')
      .update({ winner_id: winnerId, status: 'completed' })
      .eq('id', match.id);
    // Real-time subscription will update the UI
  };

  // UI: Tournament Info Card
  function TournamentInfo() {
    if (!tournament) return null;
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{tournament.name}</h2>
          <div className="text-gray-500 text-sm mt-1">{tournament.description}</div>
        </div>
        <div className="flex flex-col md:items-end gap-1">
          <span className="text-sm text-gray-600">
            <strong>Status:</strong> {tournament.status || 'Ongoing'}
          </span>
          <span className="text-sm text-gray-600">
            <strong>Participants:</strong> {Object.keys(participantsById).length}
          </span>
          <span className="text-sm text-gray-600">
            <strong>Created:</strong> {new Date(tournament.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  // UI: Round Navigation
  function RoundNavigation() {
    if (!matches || matches.length === 0) return null;
    const maxRound = Math.max(...matches.map(m => m.round));
    return (
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {[...Array(maxRound)].map((_, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded border text-sm font-semibold transition
              ${currentRound === idx + 1
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
              }`}
            onClick={() => setCurrentRound(idx + 1)}
          >
            Round {idx + 1}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded border text-sm font-semibold transition
            ${currentRound === null
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
            }`}
          onClick={() => setCurrentRound(null)}
        >
          All Rounds
        </button>
      </div>
    );
  }

  // UI: Loading Spinner
  function LoadingSpinner() {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-gray-500">Loading brackets...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">Tournament Brackets</h1>
          <Link to="/home" className="text-blue-600 hover:underline font-semibold">← Back to Home</Link>
        </div>
        <TournamentInfo />
        <RoundNavigation />
        <div className="overflow-x-auto rounded-lg shadow bg-white p-4">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : matches.length === 0 ? (
            <div className="text-center text-gray-500">No brackets found.</div>
          ) : (
            <TournamentBracket
              matches={currentRound ? matches.filter(m => m.round === currentRound) : matches}
              participantsById={participantsById}
              onMatchWinner={handleMatchWinner}
              currentRound={currentRound || undefined}
              // Optionally pass pulseMatchIds if you want to highlight updated matches
            />
          )}
        </div>
      </div>
    </div>
  );
}