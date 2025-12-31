import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Team } from '@/types/team';

type AllTeamsViewProps = {
  teams: Team[];
  onTeamSelect: (slug: string) => void;
};

export function AllTeamsView({ teams, onTeamSelect }: AllTeamsViewProps) {
  const [sortField, setSortField] = useState<'odds' | 'name'>('odds');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort teams by tournament odds (highest to lowest by default)
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      if (sortField === 'odds') {
        const oddsA = a.tournamentOdds ?? -1;
        const oddsB = b.tournamentOdds ?? -1;
        return sortDirection === 'desc' ? oddsB - oddsA : oddsA - oddsB;
      } else {
        // Sort by name
        const compare = a.displayName.localeCompare(b.displayName);
        return sortDirection === 'desc' ? -compare : compare;
      }
    });
  }, [teams, sortField, sortDirection]);

  const handleSort = (field: 'odds' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'odds' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="bg-white py-12 lg:py-16 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 ibm-plex-sans">
            All Teams
          </h1>
          <p className="text-gray-600 text-lg">
            NCAA Tournament at-large bid odds for all {teams.length} Division I teams
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                  Rank
                </th>
                <th 
                  className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600"
                  onClick={() => handleSort('name')}
                >
                  Team {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                  Conference
                </th>
                <th className="text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                  Change
                </th>
                <th 
                  className="text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600"
                  onClick={() => handleSort('odds')}
                >
                  Odds {sortField === 'odds' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => {
                const oddsChange = team.oddsChange ?? 0;
                const currentOdds = team.tournamentOdds ?? 0;
                
                return (
                  <tr
                    key={team.espnId || team.slug}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onTeamSelect(team.slug)}
                  >
                    <td className="py-3 px-4 text-gray-500 geist-mono text-sm">
                      {sortField === 'odds' ? index + 1 : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {team.logo && (
                          <img
                            src={team.logo}
                            alt={team.displayName}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="text-gray-900 font-medium text-md">
                          {team.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {team.conference || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {oddsChange !== 0 ? (
                        <div className={`flex items-center justify-end gap-1 ${
                          oddsChange > 0 ? 'text-green-800/50' : 'text-red-800/50'
                        }`}>
                          {oddsChange > 0 ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          <span className="font-medium geist-mono text-xs">
                            {oddsChange > 0 ? '+' : ''}{oddsChange}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 geist-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-md">
                      <span className="font-medium geist-mono">
                        {currentOdds > 0 ? `${currentOdds}%` : '<1%'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
