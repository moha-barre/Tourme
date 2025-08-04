import React from 'react';
import { Bracket } from 'react-brackets';

// Define local type for bracket rounds
export type BracketRound = {
  title: string;
  seeds: Array<{
    id: string;
    teams: Array<{ id?: string; name: string }>;
    winner: number | null;
    score: [number | null, number | null];
  }>;
};

interface BracketViewProps {
  rounds: BracketRound[];
  currentUserId?: string;
  pulseMatchIds?: string[];
}

export function BracketView({ rounds, currentUserId, pulseMatchIds = [] }: BracketViewProps) {
  return (
    <div className="overflow-x-auto">
      <Bracket
        rounds={rounds}
        renderSeedComponent={({ seed, breakpoint, roundIndex, seedIndex }) => {
          const isUserMatch = seed.teams.some(
            (team) => team && team.id && team.id === currentUserId
          );
          const isPulsing = pulseMatchIds.includes(String(seed.id));
          return (
            <div
              className={`p-2 rounded border-2 min-w-[180px] mb-2 ${
                seed.winner === 0
                  ? 'border-green-500 bg-green-50'
                  : seed.winner === 1
                  ? 'border-green-500 bg-green-50'
                  : seed.score[0] === null && seed.score[1] === null
                  ? 'border-gray-300 bg-white'
                  : 'border-yellow-400 bg-yellow-50'
              } ${isUserMatch ? 'ring-2 ring-blue-400' : ''} ${isPulsing ? 'animate-pulse' : ''}`}
            >
              <div className="flex justify-between">
                <span className="font-semibold">
                  {seed.teams[0]?.name || 'TBD'}
                </span>
                <span className="font-mono">{seed.score[0] ?? ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">
                  {seed.teams[1]?.name || 'TBD'}
                </span>
                <span className="font-mono">{seed.score[1] ?? ''}</span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
} 