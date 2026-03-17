import React, { useState, useMemo } from 'react';
import type { Team } from '@/types/team';
import { formatPercent } from '@/lib/utils';
import { calculateBracket } from '@/lib/bracketProjection';
import { UpdatesPill } from '@/components/UpdatesPill';

type AllTeamsViewProps = {
  teams: Team[];
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime?: (t: number | string) => string;
};

export function AllTeamsView({ teams, onTeamSelect, lastUpdated, formatRelativeTime }: AllTeamsViewProps) {
  const [sortField, setSortField] = useState<'odds' | 'name' | 'net' | 'seed' | 'kenpom' | 'torvik' | 'bpi' | 'wab' | 'kpi' | 'sor' | 'resumeAvg' | 'predictiveAvg'>('odds');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const calculateAverage = (values: (number | string | null | undefined)[]): number | null => {
    const validValues = values
      .map(v => {
        if (v === null || v === undefined) return null;
        const num = typeof v === 'string' ? parseFloat(v) : v;
        return isNaN(num) ? null : num;
      })
      .filter(v => v !== null) as number[];
    return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : null;
  };

  // Calculate bracket projection to get seeds
  const { teamSeedMap } = useMemo(() => calculateBracket(teams), [teams]);

  // Sort teams
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortField) {
        case 'odds':
          const oddsA = a.tournamentOdds ?? -1;
          const oddsB = b.tournamentOdds ?? -1;
          compareValue = oddsA - oddsB;
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
        case 'kenpom':
          const kenpomA = typeof a.kenpom === 'string' ? parseFloat(a.kenpom) : (a.kenpom ?? 999);
          const kenpomB = typeof b.kenpom === 'string' ? parseFloat(b.kenpom) : (b.kenpom ?? 999);
          compareValue = kenpomA - kenpomB; // Lower is better
          break;
        case 'torvik':
          const torvikA = typeof a.torvik === 'string' ? parseFloat(a.torvik) : (a.torvik ?? 999);
          const torvikB = typeof b.torvik === 'string' ? parseFloat(b.torvik) : (b.torvik ?? 999);
          compareValue = torvikA - torvikB; // Lower is better
          break;
        case 'bpi':
          const bpiA = typeof a.bpi === 'string' ? parseFloat(a.bpi) : (a.bpi ?? 999);
          const bpiB = typeof b.bpi === 'string' ? parseFloat(b.bpi) : (b.bpi ?? 999);
          compareValue = bpiA - bpiB; // Lower is better
          break;
        case 'wab':
          const wabA = typeof a.wab === 'string' ? parseFloat(a.wab) : (a.wab ?? 999);
          const wabB = typeof b.wab === 'string' ? parseFloat(b.wab) : (b.wab ?? 999);
          compareValue = wabA - wabB; // Lower is better
          break;
        case 'kpi':
          const kpiA = typeof a.kpi === 'string' ? parseFloat(a.kpi) : (a.kpi ?? 999);
          const kpiB = typeof b.kpi === 'string' ? parseFloat(b.kpi) : (b.kpi ?? 999);
          compareValue = kpiA - kpiB; // Lower is better
          break;
        case 'sor':
          const sorA = typeof a.sor === 'string' ? parseFloat(a.sor) : (a.sor ?? 999);
          const sorB = typeof b.sor === 'string' ? parseFloat(b.sor) : (b.sor ?? 999);
          compareValue = sorA - sorB; // Lower is better
          break;
        case 'resumeAvg':
          const resumeAvgA = calculateAverage([a.wab, a.kpi, a.sor]) ?? 999;
          const resumeAvgB = calculateAverage([b.wab, b.kpi, b.sor]) ?? 999;
          compareValue = resumeAvgA - resumeAvgB; // Lower is better
          break;
        case 'predictiveAvg':
          const predictiveAvgA = calculateAverage([a.kenpom, a.torvik, a.bpi]) ?? 999;
          const predictiveAvgB = calculateAverage([b.kenpom, b.torvik, b.bpi]) ?? 999;
          compareValue = predictiveAvgA - predictiveAvgB; // Lower is better
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

  const handleSort = (field: 'odds' | 'name' | 'net' | 'seed' | 'kenpom' | 'torvik' | 'bpi' | 'wab' | 'kpi' | 'sor' | 'resumeAvg' | 'predictiveAvg') => {
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
      <div className="py-12" style={{
        backgroundImage: `linear-gradient(to bottom, hsla(212, 72%, 59%, 0.12), transparent), url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='28' height='28' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='rgba(0,0,0,0)'/><path d='M3.25 10h13.5M10 3.25v13.5' transform='translate(4,0)' stroke-linecap='square' stroke-width='1' stroke='rgba(0,0,0,0.03)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`
      }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="">
            <UpdatesPill lastUpdated={lastUpdated} />
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4 mb-2 ibm-plex-sans">
              Latest rankings
            </h1>
            <p className="text-gray-600 text-lg text-balance">
              Current NCAA Tournament at-large bid odds, projected seeds and updated metrics for every Division I team.</p>
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <p className="lg:hidden text-[10px] text-gray-400 text-right mb-2 flex items-center justify-end gap-1">
          Scroll for more
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </p>
        <div className="rounded-lg border border-gray-200 overflow-x-auto mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="sticky top-0 z-10 text-left text-xs px-4 py-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase bg-gray-50">
                
                </th>
                <th 
                  className={`sticky top-0 z-10 text-left text-xs py-2 px-2 md:py-3 md:px-4 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 min-w-[150px] ${sortField === 'name' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('name')}
                >
                  Team {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 min-w-[100px] ${sortField === 'odds' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('odds')}
                  title="Chance team gets bid without winning conference tournament"
                >
                  At-Large {sortField === 'odds' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'seed' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('seed')}
                  title="Expected seed based on current rankings"
                >
                  Proj. Seed {sortField === 'seed' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 border-l-2 border-gray-300 ${sortField === 'resumeAvg' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('resumeAvg')}
                  title="Average of resume metrics (WAB, KPI, SOR) — lower rank is better"
                >
                  Resume Avg {sortField === 'resumeAvg' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 border-r-2 border-gray-300 ${sortField === 'predictiveAvg' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('predictiveAvg')}
                  title="Average of predictive metrics (KenPom, Torvik, BPI) — lower rank is better"
                >
                  Pred. Avg {sortField === 'predictiveAvg' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'net' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('net')}
                  title="NCAA sorting tool for quadrants"
                >
                  NET {sortField === 'net' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'kenpom' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('kenpom')}
                  title="Ken Pomeroy - predictive metric"
                >
                  KenPom {sortField === 'kenpom' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'torvik' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('torvik')}
                  title="Bart Torvik - predictive metric"
                >
                  Torvik {sortField === 'torvik' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'bpi' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('bpi')}
                  title="ESPN Basketball Power Index - predictive metric"
                >
                  BPI {sortField === 'bpi' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'wab' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('wab')}
                  title="Wins Above Bubble - resume metric"
                >
                  WAB {sortField === 'wab' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'kpi' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('kpi')}
                  title="Kevin Pauga Index - resume metric"
                >
                  KPI {sortField === 'kpi' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={`sticky top-0 z-10 text-right text-xs py-2 px-2 md:py-3 md:px-3 font-medium geist-mono text-gray-400 uppercase cursor-pointer hover:text-gray-600 ${sortField === 'sor' ? 'bg-amber-50' : 'bg-gray-50'}`}
                  onClick={() => handleSort('sor')}
                  title="ESPN Strength of Record - resume metric"
                >
                  SOR {sortField === 'sor' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team) => {
                const currentOdds = team.tournamentOdds ?? 0;
                const formattedOdds = formatPercent(currentOdds, { decimals: 0 });
                const seed = teamSeedMap.get(team.espnId || team.slug);
                const rank = teamRanks[team.espnId || team.slug];
                
                return (
                  <tr
                    key={team.espnId || team.slug}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onTeamSelect(team.slug)}
                  >
                    <td className="py-2 pl-4 md:py-3 md:px-3 text-gray-500 geist-mono text-xs">
                      {rank || '—'}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 ${sortField === 'name' ? 'bg-amber-50' : ''}`}>
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
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'odds' ? 'bg-amber-50' : ''}`}>
                      {formattedOdds}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'seed' ? 'bg-amber-50' : ''}`}>
                      {seed || '—'}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs border-l-2 border-gray-200 ${sortField === 'resumeAvg' ? 'bg-amber-50' : ''}`}>
                      {(() => { const v = calculateAverage([team.wab, team.kpi, team.sor]); return v !== null ? v.toFixed(1) : '—'; })()}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs border-r-2 border-gray-200 ${sortField === 'predictiveAvg' ? 'bg-amber-50' : ''}`}>
                      {(() => { const v = calculateAverage([team.kenpom, team.torvik, team.bpi]); return v !== null ? v.toFixed(1) : '—'; })()}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'net' ? 'bg-amber-50' : ''}`}>
                      {team.net || '—'}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'kenpom' ? 'bg-amber-50' : ''}`}>
                      {team.kenpom || '—'}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'torvik' ? 'bg-amber-50' : ''}`}>
                      {team.torvik || '—'}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'bpi' ? 'bg-amber-50' : ''}`}>
                      {team.bpi || '—'}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'wab' ? 'bg-amber-50' : ''}`}>
                      {team.wab || '—'}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'kpi' ? 'bg-amber-50' : ''}`}>
                      {team.kpi || '—'}
                    </td>
                    <td className={`py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs ${sortField === 'sor' ? 'bg-amber-50' : ''}`}>
                      {team.sor || '—'}
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
