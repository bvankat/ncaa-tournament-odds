import React from 'react';
import type { Team } from '@/types/team';
import { calculateCompositeRanking } from '@/lib/bracketProjection';

type BubbleSidebarProps = {
  lastFourByesList: Team[];
  lastFourInList: Team[];
  firstFourOut: Team[];
  nextFourOut: Team[];
  onTeamSelect: (slug: string) => void;
  variant?: 'pills' | 'list';
  teamSeedMap?: Map<string, number>;
};

export function BubbleSidebar({
  lastFourByesList,
  lastFourInList,
  firstFourOut,
  nextFourOut,
  onTeamSelect,
  variant = 'pills',
  teamSeedMap
}: BubbleSidebarProps) {
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

  // Helper to format a list of rankings
  const formatRankings = (labels: string[], values: (number | string | null | undefined)[]): string => {
    const formatted = labels.map((label, i) => {
      const val = values[i];
      if (val === null || val === undefined) return null;
      return `${label}: ${val}`;
    }).filter(Boolean);
    
    return formatted.join(', ') || 'N/A';
  };

  const renderTeamsPills = (teams: Team[], borderColor: string, bgColor: string) => (
    <div className="flex flex-wrap gap-2">
      {teams.map((team) => (
        <button
          key={team.espnId || team.slug}
          onClick={() => onTeamSelect(team.slug)}
          className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border ${borderColor} ${bgColor} hover:bg-opacity-100 transition-colors cursor-pointer`}
        >
          {team.logo && (
            <img
              src={team.logo}
              alt={team.displayName}
              className="w-4 h-4 object-contain"
            />
          )}
          <span className="text-xs font-medium text-gray-900">
            {team.shortName}
          </span>
        </button>
      ))}
    </div>
  );

  if (variant === 'list') {
    // Combine all teams with their status
    type TeamWithStatus = Team & { status: string; bgClass: string };
    const allTeams: TeamWithStatus[] = [
      ...lastFourByesList.map(team => ({ ...team, status: 'Last Four Byes', bgClass: 'bg-orange-50' })),
      ...lastFourInList.map(team => ({ ...team, status: 'Play-In Game', bgClass: 'bg-purple-50' })),
      ...firstFourOut.map(team => ({ ...team, status: 'First Four Out', bgClass: 'bg-white' })),
      ...nextFourOut.map(team => ({ ...team, status: 'Next Four Out', bgClass: 'bg-white' }))
    ];

    if (allTeams.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic py-3">No teams on the bubble</p>
      );
    }

    return (
      <div className="rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th className="text-left text-xs py-2 px-3 font-medium geist-mono text-gray-400 uppercase min-w-[120px]">
                Team
              </th>
              <th className="text-center text-xs py-2 px-3 font-medium geist-mono text-gray-400 uppercase"                   
                title="Expected seed based on current rankings">
                Seed
              </th>
              <th className="text-left text-xs py-2 px-3 font-medium geist-mono text-gray-400 uppercase min-w-[100px]">
                Status
              </th>
            
              <th className="text-right text-xs py-2 px-3 font-medium geist-mono text-gray-400 uppercase bg-gray-50"
            title="Average of KenPom, Torvik, and BPI metrics">
                Predictive
              </th>
              <th className="text-right text-xs py-2 px-3 font-medium geist-mono text-gray-400 uppercase bg-gray-50"
                title="Average of WAB, KPI, and SOR metrics">
                Resume
              </th>
              <th className="text-right text-xs py-2 px-3 font-medium geist-mono text-gray-400 uppercase bg-gray-50"
              title="NCAA sorting tool for quadrants">
                NET
              </th>
            </tr>
          </thead>
          <tbody>
            {allTeams.map((team) => {
              const predictiveAvg = calculateAverage([team.kenpom, team.torvik, team.bpi]);
              const resumeAvg = calculateAverage([team.wab, team.kpi, team.sor]);
              const predictiveTooltip = formatRankings(
                ['KenPom', 'Torvik', 'BPI'],
                [team.kenpom, team.torvik, team.bpi]
              );
              const resumeTooltip = formatRankings(
                ['WAB', 'KPI', 'SOR'],
                [team.wab, team.kpi, team.sor]
              );

              const teamId = team.espnId || team.slug;
              const seed = teamSeedMap?.get(teamId);
              
              const getStatusColor = (status: string) => {
                if (status === 'Last Four Byes') return 'text-orange-800';
                if (status === 'Play-In Game') return 'text-purple-800';
                return 'text-gray-600';
              };

              return (
                <tr
                  key={team.espnId || team.slug}
                  className={`${team.bgClass} hover:opacity-80 cursor-pointer transition-all border-b border-gray-200 last:border-b-0`}
                  onClick={() => onTeamSelect(team.slug)}
                >
                  
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      {team.logo && (
                        <img
                          src={team.logo}
                          alt={team.displayName}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <span className="text-gray-900 font-medium text-sm">
                        {team.shortName}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center text-gray-700 geist-mono text-xs font-semibold">
                    {seed || '—'}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-medium ${getStatusColor(team.status)}`}>
                      {team.status}
                    </span>
                  </td>
                  <td 
                    className="py-2 px-3 text-right text-gray-700 geist-mono text-xs bg-gray-50/25"
                    title={predictiveTooltip}
                  >
                    {predictiveAvg !== null ? predictiveAvg.toFixed(1) : '—'}
                  </td>
                  <td 
                    className="py-2 px-3 text-right text-gray-700 geist-mono text-xs bg-gray-50/25"
                    title={resumeTooltip}
                  >
                    {resumeAvg !== null ? resumeAvg.toFixed(1) : '—'}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700 geist-mono text-xs bg-gray-50/25">
                    {team.net || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Pills variant
  const spacing = 'space-y-12';

  return (
    <div className={spacing}>
      {/* Last Four Byes */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 geist-mono uppercase">
          Last Four Byes
        </h3>
        {renderTeamsPills(lastFourByesList, 'border-orange-200', 'bg-orange-50/25 hover:bg-orange-50')}
      </div>

      {/* Last Four In */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 geist-mono uppercase">
          Last Four In
        </h3>
        {renderTeamsPills(lastFourInList, 'border-purple-200', 'bg-purple-50/25 hover:bg-purple-50')}
      </div>

      {/* First Four Out */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 geist-mono uppercase">
          First Four Out
        </h3>
        {renderTeamsPills(firstFourOut, 'border-gray-200', 'hover:bg-gray-100')}
      </div>

      {/* Next Four Out */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 geist-mono uppercase">
          Next Four Out
        </h3>
        {renderTeamsPills(nextFourOut, 'border-gray-200', 'hover:bg-gray-100')}
      </div>
    </div>
  );
}
