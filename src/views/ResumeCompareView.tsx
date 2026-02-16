import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { calculateBracket } from '@/lib/bracketProjection';
import type { Team } from '@/types/team';

type ResumeCompareViewProps = {
  teams: Team[];
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime: (t: number | string) => string;
};

export function ResumeCompareView({ teams, onTeamSelect, lastUpdated, formatRelativeTime }: ResumeCompareViewProps) {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [comboboxValue, setComboboxValue] = useState('');

  // Calculate bracket projection
  const bracketProjection = useMemo(() => calculateBracket(teams), [teams]);

  const handleTeamSelect = (slug: string) => {
    if (!slug) return;
    
    const team = teams.find(t => t.slug === slug);
    if (!team) return;
    
    // Check if team already selected
    if (selectedTeams.find(t => t.slug === slug)) return;
    
    // Limit to 8 teams
    if (selectedTeams.length >= 8) return;
    
    setSelectedTeams([...selectedTeams, team]);
    setComboboxValue(''); // Reset combobox
  };

  const handleRemoveTeam = (slug: string) => {
    setSelectedTeams(selectedTeams.filter(t => t.slug !== slug));
  };

  // Add preset group of teams
  const addPresetGroup = (presetTeams: Team[]) => {
    // Take up to 8 teams total
    const availableSlots = 8 - selectedTeams.length;
    const teamsToAdd = presetTeams.slice(0, availableSlots);
    
    // Filter out already selected teams
    const newTeams = teamsToAdd.filter(t => !selectedTeams.find(st => st.slug === t.slug));
    
    setSelectedTeams([...selectedTeams, ...newTeams]);
  };

  // Get teams by seed
  const getTeamsBySeed = (seed: number): Team[] => {
    return bracketProjection.bracketTeams.filter((team, index) => {
      const teamId = team.espnId || team.slug;
      const teamSeed = bracketProjection.teamSeedMap.get(teamId);
      return teamSeed === seed;
    });
  };

  // Helper to convert values to numbers for comparison
  const toNumber = (val: number | string | null | undefined): number | null => {
    if (val == null) return null;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  };

  // Helper to parse quad records (e.g., "5-2" -> { wins: 5, total: 7 })
  const parseQuadRecord = (record: string | null | undefined): { wins: number; total: number } | null => {
    if (!record) return null;
    const parts = record.split('-');
    if (parts.length !== 2) return null;
    const wins = parseInt(parts[0], 10);
    const losses = parseInt(parts[1], 10);
    if (isNaN(wins) || isNaN(losses)) return null;
    return { wins, total: wins + losses };
  };

  // Helper to find best (lowest) ranking in a column
  const findBestRanking = (metric: keyof Team): Set<string> => {
    const values = selectedTeams
      .map(t => {
        const value = t[metric];
        // Only process if it's a number or string (not NextGame or complex object)
        if (typeof value === 'number' || typeof value === 'string') {
          return { slug: t.slug, value: toNumber(value) };
        }
        return null;
      })
      .filter(v => v !== null && v.value !== null) as { slug: string; value: number }[];
    
    if (values.length === 0) return new Set();
    
    const minValue = Math.min(...values.map(v => v.value));
    return new Set(values.filter(v => v.value === minValue).map(v => v.slug));
  };

  // Helper to find best quad record (highest win percentage, then most wins)
  const findBestQuadRecord = (metric: keyof Team): Set<string> => {
    const records = selectedTeams
      .map(t => {
        const record = parseQuadRecord(t[metric] as string);
        if (!record || record.total === 0) return null;
        return { slug: t.slug, winPct: record.wins / record.total, wins: record.wins };
      })
      .filter(r => r !== null) as { slug: string; winPct: number; wins: number }[];
    
    if (records.length === 0) return new Set();
    
    // Find the maximum win percentage
    const maxWinPct = Math.max(...records.map(r => r.winPct));
    
    // Among teams with max win percentage, find the most wins
    const teamsWithMaxPct = records.filter(r => r.winPct === maxWinPct);
    const maxWins = Math.max(...teamsWithMaxPct.map(r => r.wins));
    
    // Return only teams with both max win percentage AND max wins
    return new Set(teamsWithMaxPct.filter(r => r.wins === maxWins).map(r => r.slug));
  };

  // Find best values for each column
  const bestNet = findBestRanking('net');
  const bestBpi = findBestRanking('bpi');
  const bestSor = findBestRanking('sor');
  const bestKpi = findBestRanking('kpi');
  const bestKenpom = findBestRanking('kenpom');
  const bestTorvik = findBestRanking('torvik');
  const bestWab = findBestRanking('wab');
  const bestQuad1 = findBestQuadRecord('quad1');
  const bestQuad2 = findBestQuadRecord('quad2');
  const bestQuad3 = findBestQuadRecord('quad3');
  const bestQuad4 = findBestQuadRecord('quad4');

  return (
    <div className="min-h-screen">
      <div className="pt-12 lg:pt-16 pb-8" style={{
        backgroundImage: `linear-gradient(to bottom, hsla(212, 72%, 59%, 0.12), transparent), url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='28' height='28' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='rgba(0,0,0,0)'/><path d='M3.25 10h13.5M10 3.25v13.5' transform='translate(4,0)' stroke-linecap='square' stroke-width='1' stroke='rgba(0,0,0,0.03)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`
      }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="mb-8">
            {lastUpdated && (
              <div id="updates-pill" className="inline-flex items-center w-fit px-4 py-2 shadow-sm bg-white/40 rounded-full border border-white/15 mb-4">
                <span className="relative size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-200 opacity-80"></span>
                  <span className="absolute inline-flex size-2 rounded-full bg-green-500"></span>
                </span>
                <p className="opacity-60 text-xs font-light tracking-wider pl-4 geist-mono uppercase">
                  <span>UPDATED </span>
                  <span>{formatRelativeTime(lastUpdated)}</span>
                </p>
              </div>
            )}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4 mb-2 ibm-plex-sans">
              Compare Tournament Resumes
            </h1>
            <p className="text-gray-600 text-lg">
              Side-by-side metrics and quadrant records for up to 8 teams
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6 pb-12 lg:px-12 lg:pb-16">
        <div className="mb-8">{/* Team Selection and Preset Groups - 2 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Team Selection */}
            <div>
              <Combobox
                teams={teams}
                value={comboboxValue}
                onValueChange={handleTeamSelect}
                placeholder={selectedTeams.length >= 8 ? "Maximum 8 teams selected" : "Select a team to compare"}
                onHome={() => {}}
                onAllTeams={() => {}}
                onConferences={() => {}}
                onBracket={() => {}}
                onBubbleWatch={() => {}}
                onCompareResumes={() => {}}
              />
            </div>

            {/* Preset Groups */}
            <div>
              <label className="block text-[11px] font-regular text-gray-700 mb-2 geist-mono uppercase">
                Quick Add
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addPresetGroup(getTeamsBySeed(1))}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedTeams.length >= 8}
                >
                  1 Seeds
                </button>
                <button
                  onClick={() => addPresetGroup(getTeamsBySeed(2))}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedTeams.length >= 8}
                >
                  2 Seeds
                </button>
                <button
                  onClick={() => addPresetGroup(bracketProjection.lastFourInList)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedTeams.length >= 8}
                >
                  Last Four In
                </button>
                <button
                  onClick={() => addPresetGroup(bracketProjection.bubbleTeams.slice(0, 4))}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedTeams.length >= 8}
                >
                  First Four Out
                </button>
              </div>
            </div>
          </div>

          {/* Selected Teams Pills */}
          {selectedTeams.length > 0 && (
            <div className="mb-8 mt-12">
              <label className="block text-sm font-medium text-gray-700 mb-3 geist-mono uppercase">
                Select up to eight teams ({selectedTeams.length}/8)
              </label>
              <div className="flex flex-wrap gap-2 items-center">
              {selectedTeams.map((team) => (
                <div
                  key={team.slug}
                  className="inline-flex items-center gap-2 px-2 py-1.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {team.logo && (
                    <img
                      src={team.logo}
                      alt={team.shortName}
                      className="w-4 h-4 object-contain"
                    />
                  )}
                  <span className="text-xs font-medium text-gray-900">
                    {team.shortName}
                  </span>
                  <button
                    onClick={() => handleRemoveTeam(team.slug)}
                    className="ml-1 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label={`Remove ${team.shortName}`}
                  >
                    <X className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSelectedTeams([])}
                className="text-xs text-gray-400 hover:text-gray-800 font-regular cursor-pointer transition-colors"
              >
                Clear All
              </button>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedTeams.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-sm">Select teams above to begin comparing their resumes</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase sticky left-0 bg-gray-50 z-10 min-w-[130px]">
                    Team
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                    NET
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                    BPI
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                    SOR
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                    KPI
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                    KenPom
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                    Torvik
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                    WAB
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase border-l-2 border-gray-300 min-w-[80px]">
                    Q1
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase min-w-[80px]">
                    Q2
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase min-w-[80px]">
                    Q3
                  </th>
                  <th className="text-center text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase min-w-[80px]">
                    Q4
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedTeams.map((team, idx) => (
                  <tr
                    key={team.slug}
                    className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors`}
                    onClick={() => onTeamSelect(team.slug)}
                  >
                    <td className="py-3 px-4 sticky left-0 bg-white z-10 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {team.logo && (
                          <img
                            src={team.logo}
                            alt={team.shortName}
                            className="w-4 h-4 object-contain"
                          />
                        )}
                        <span className="text-xs font-medium text-gray-900">
                          {team.shortName}
                        </span>
                      </div>
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestNet.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.net || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestBpi.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.bpi || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestSor.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.sor || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestKpi.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.kpi || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestKenpom.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.kenpom || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestTorvik.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.torvik || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestWab.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.wab || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs border-l-2 border-gray-300 ${bestQuad1.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.quad1 || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestQuad2.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.quad2 || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestQuad3.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.quad3 || '—'}
                    </td>
                    <td className={`py-3 px-3 text-center geist-mono text-xs ${bestQuad4.has(team.slug) ? 'bg-green-50 font-semibold text-green-900' : 'text-gray-700'}`}>
                      {team.quad4 || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTeams.length > 0 && (
          <div className="mt-4 text-[11px] text-gray-500 geist-mono">
            <p>Green highlight indicates the best value in each column</p>
            </div>
        )}
      </div>
    </div>
  );
}
