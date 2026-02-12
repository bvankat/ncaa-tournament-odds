import React, { useState, useMemo } from 'react';
import type { Team } from '@/types/team';
import { formatPercent } from '@/lib/utils';
import { calculateBracket, calculateCompositeRanking } from '@/lib/bracketProjection';

type AllTeamsViewProps = {
  teams: Team[];
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime?: (t: number | string) => string;
};

export function AllTeamsView({ teams, onTeamSelect, lastUpdated, formatRelativeTime }: AllTeamsViewProps) {
  const [sortField, setSortField] = useState<'odds' | 'name' | 'composite' | 'predictive' | 'resume' | 'net' | 'seed'>('odds');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calculate bracket projection to get seeds
  const { teamSeedMap } = useMemo(() => calculateBracket(teams), [teams]);

  // Helper to calculate average of numeric rankings
  const calculateAverage = (values: (number | string | null | undefined)[]): number | null => {
    const validValues = values
      .map(v => {
        if (v === null || v === undefined) return null;
        const num = typeof v === 'string' ? parseFloat(v) : v;
        return isNaN(num) ? null : num;
      })
      .filter(v => v !== null) as number[];
    
    if (validValues.length === 0) return null;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  };

  // Sort teams
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortField) {
        case 'odds':
          const oddsA = a.tournamentOdds ?? -1;
          const oddsB = b.tournamentOdds ?? -1;
          compareValue = oddsB - oddsA;
          break;
        case 'composite':
          const compA = calculateCompositeRanking(a);
          const compB = calculateCompositeRanking(b);
          compareValue = compA - compB; // Lower is better
          break;
        case 'predictive':
          const predA = calculateAverage([a.kenpom, a.torvik, a.bpi]) ?? 999;
          const predB = calculateAverage([b.kenpom, b.torvik, b.bpi]) ?? 999;
          compareValue = predA - predB; // Lower is better
          break;
        case 'resume':
          const resA = calculateAverage([a.wab, a.kpi, a.sor]) ?? 999;
          const resB = calculateAverage([b.wab, b.kpi, b.sor]) ?? 999;
          compareValue = resA - resB; // Lower is better
          break;
        case 'net':
          const netA = typeof a.net === 'string' ? parseFloat(a.net) : (a.net ?? 999);
          const netB = typeof b.net === 'string' ? parseFloat(b.net) : (b.net ?? 999);
          compareValue = netA - netB; // Lower is better
          break;
        case 'seed':
          const seedA = teamSeedMap.get(a.espnId || a.slug) ?? 999;
          const seedB = teamSeedMap.get(b.espnId || b.slug) ?? 999;
          compareValue = seedA - seedB; // Lower is better
          break;
        case 'name':
          compareValue = a.displayName.localeCompare(b.displayName);
          break;
      }
      
      return sortDirection === 'desc' ? -compareValue : compareValue;
    });
  }, [teams, sortField, sortDirection, teamSeedMap]);

  // Calculate ranks for sorted teams based on current sort field
  const teamRanks = useMemo(() => {
    const ranks: Record<string, number> = {};
    
    // For name sorting, don't show ranks
    if (sortField === 'name') {
      return {};
    }
    
    // Simple sequential ranking for current sort
    sortedTeams.forEach((team, index) => {
      ranks[team.espnId || team.slug] = index + 1;
    });
    
    return ranks;
  }, [sortedTeams, sortField]);

  const handleSort = (field: 'odds' | 'name' | 'composite' | 'predictive' | 'resume' | 'net' | 'seed') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default sort direction based on field type
      if (field === 'name') {
        setSortDirection('asc');
      } else if (field === 'odds') {
        setSortDirection('desc'); // Higher odds first
      } else {
        setSortDirection('asc'); // Lower rankings/seeds first
      }
    }
  };

  const teamsAbove40 = useMemo(() => {
    return teams.filter(team => (team.tournamentOdds ?? 0) >= 40).length;
  }, [teams]);

  return (
    <div className="min-h-screen">
      <div className="pt-12 lg:pt-16 pb-12" style={{
        backgroundImage: `linear-gradient(to bottom, hsla(212, 72%, 59%, 0.12), transparent), url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='28' height='28' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='rgba(0,0,0,0)'/><path d='M3.25 10h13.5M10 3.25v13.5' transform='translate(4,0)' stroke-linecap='square' stroke-width='1' stroke='rgba(0,0,0,0.03)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`
      }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="mb-8">
            {lastUpdated && formatRelativeTime && (
              <div id="updates-pill" className="inline-flex items-center w-fit px-4 py-2 shadow-sm bg-white/40 rounded-full border border-white/15 mb-4">
                <span className="relative size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-200 opacity-80"></span>
                  <span className="absolute inline-flex size-2 rounded-full bg-green-500"></span>
                </span>
                <p className="opacity-60 text-xs font-light tracking-wider pl-4 lg:inline-block geist-mono uppercase">
                  <span>UPDATED </span>
                  <span id="update-relative-time">{formatRelativeTime(lastUpdated)}</span>
                </p>
              </div>
            )}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4 mb-2 ibm-plex-sans">
              All Teams
            </h1>
            <p className="text-gray-600 text-lg">
              Current NCAA Tournament at-large bid odds for all {teams.length} Division I teams.</p>
              <p className="mt-12 text-gray-500 text-sm geist-mono">Right now: {teamsAbove40} teams with at-large odds above 40%</p>
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pb-12">
        <p className="lg:hidden text-[10px] text-gray-400 text-right mb-2 flex items-center justify-end gap-1">
          Scroll for more
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </p>
        <div className="rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="text-left text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                  Rank
                </th>
                <th 
                  className={`text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'name' ? 'bg-amber-50' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  Team {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'odds' ? 'bg-amber-50' : ''}`}
                  onClick={() => handleSort('odds')}
                >
                  Odds {sortField === 'odds' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'composite' ? 'bg-amber-50' : ''}`}
                  onClick={() => handleSort('composite')}
                >
                  Composite {sortField === 'composite' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'predictive' ? 'bg-amber-50' : ''}`}
                  onClick={() => handleSort('predictive')}
                >
                  Predictive {sortField === 'predictive' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'resume' ? 'bg-amber-50' : ''}`}
                  onClick={() => handleSort('resume')}
                >
                  Resume {sortField === 'resume' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'net' ? 'bg-amber-50' : ''}`}
                  onClick={() => handleSort('net')}
                >
                  NET {sortField === 'net' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'seed' ? 'bg-amber-50' : ''}`}
                  onClick={() => handleSort('seed')}
                >
                  Seed {sortField === 'seed' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team) => {
                const currentOdds = team.tournamentOdds ?? 0;
                const formattedOdds = formatPercent(currentOdds, { decimals: 0 });
                const predictiveAvg = calculateAverage([team.kenpom, team.torvik, team.bpi]);
                const resumeAvg = calculateAverage([team.wab, team.kpi, team.sor]);
                const composite = calculateCompositeRanking(team);
                const seed = teamSeedMap.get(team.espnId || team.slug);
                const rank = teamRanks[team.espnId || team.slug];
                
                return (
                  <tr
                    key={team.espnId || team.slug}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onTeamSelect(team.slug)}
                  >
                    <td className="py-3 px-3 text-gray-500 geist-mono text-xs">
                      {rank || '—'}
                    </td>
                    <td className={`py-3 px-4 ${sortField === 'name' ? 'bg-amber-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        {team.logo && (
                          <img
                            src={team.logo}
                            alt={team.shortName}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span className="text-gray-900 font-medium text-sm md:text-md">
                          {team.shortName}
                        </span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'odds' ? 'bg-amber-50' : ''}`}>
                      {formattedOdds}
                    </td>
                    <td className={`py-3 px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'composite' ? 'bg-amber-50' : ''}`}>
                      {composite !== Infinity ? composite.toFixed(1) : '—'}
                    </td>
                    <td className={`py-3 px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'predictive' ? 'bg-amber-50' : ''}`}>
                      {predictiveAvg !== null ? predictiveAvg.toFixed(1) : '—'}
                    </td>
                    <td className={`py-3 px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'resume' ? 'bg-amber-50' : ''}`}>
                      {resumeAvg !== null ? resumeAvg.toFixed(1) : '—'}
                    </td>
                    <td className={`py-3 px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'net' ? 'bg-amber-50' : ''}`}>
                      {team.net || '—'}
                    </td>
                    <td className={`py-3 px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'seed' ? 'bg-amber-50' : ''}`}>
                      {seed || '—'}
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
