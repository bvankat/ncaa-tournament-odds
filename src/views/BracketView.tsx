import React, { useMemo } from 'react';
import type { Team } from '@/types/team';
import { calculateBracket, getSeedDisplay, shouldAddSeparator, calculateCompositeRanking, calculateSelectionRanking, calculateSeedingRanking, getIntangibleBreakdown } from '@/lib/bracketProjection';
import { BubbleSidebar } from '@/components/BubbleSidebar';

type BracketViewProps = {
  teams: Team[];
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime?: (t: number | string) => string;
};

export function BracketView({ teams, onTeamSelect, lastUpdated, formatRelativeTime }: BracketViewProps) {
  // Calculate bracket projection
  const {
    bracketTeams,
    autoBidTeams,
    playInTeams,
    lastFourIn,
    lastFourByes,
    lastFourInList,
    lastFourByesList,
    bubbleTeams
  } = useMemo(() => calculateBracket(teams), [teams]);

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

  // Get bid type and special indicators
  const getBidTypeInfo = (team: Team): { bidType: string; indicator: string | null; isPlayIn: boolean; isLastFourByes: boolean } => {
    const teamId = team.espnId || team.slug;
    const isAutoBid = autoBidTeams.has(teamId);
    const isPlayIn = playInTeams.has(teamId);
    const isLastFourByes = lastFourByes.has(teamId);
    
    let bidType = isAutoBid ? 'Auto bid' : 'At-Large';
    
    let indicator = null;
    if (isPlayIn) {
      indicator = 'Play-In Game';
    } else if (lastFourIn.has(teamId)) {
      indicator = 'Last Four In';
    } else if (isLastFourByes) {
      indicator = 'Last 4 Byes';
    }
    
    return { bidType, indicator, isPlayIn, isLastFourByes };
  };

  return (
    <div className="min-h-screen">
      <div className="pt-12 lg:pt-16 pb-8" style={{
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
              Projected Bracket
            </h1>
            <p className="text-gray-600 text-lg">
              Tournament seed projections based on current team-sheet metrics
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Main bracket table */}
          <div>
            <p className="lg:hidden text-[10px] text-gray-400 text-right mb-2 flex items-center justify-end gap-1">
              Scroll for more
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </p>
            <div className="rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="text-left text-xs py-3 pl-3 md:py-3 md:pl-3 font-medium geist-mono text-gray-400 uppercase">
                  Seed
                  </th>
                  <th className="text-left text-xs py-2 px-2 md:py-3 md:px-4 font-medium geist-mono text-gray-400 uppercase min-w-[120px]">
                    Team
                  </th>
                  <th className="text-right text-xs py-2 px-2 md:py-3 md:px-4 font-medium geist-mono text-gray-400 uppercase bg-amber-50/50"
                    title="Weighted average of predictive, resume, and NET metrics">
                    Composite
                  </th>
                  <th className="text-right text-xs py-2 px-2 md:py-3 md:px-4 font-medium geist-mono text-gray-400 uppercase bg-gray-50"
                    title="Average of KenPom, Torvik, and BPI metrics">
                    Predictive
                  </th>
                  <th className="text-right text-xs py-2 px-2 md:py-3 md:px-4 font-medium geist-mono text-gray-400 uppercase bg-gray-50"
                    title="Average of WAB, KPI, and SOR metrics">
                    Resume
                  </th>
                  <th className="text-right text-xs py-2 px-2 md:py-3 md:px-4 font-medium geist-mono text-gray-400 uppercase bg-gray-50"
                    title="NCAA sorting tool for quadrants">
                    NET
                  </th>
                  <th className="text-left text-xs py-2 px-2 md:py-3 md:px-4 font-medium geist-mono text-gray-400 uppercase min-w-[80px]">
                    Bid
                  </th>
                </tr>
              </thead>
              <tbody>
                {bracketTeams.map((team, index) => {
                  const seedDisplay = getSeedDisplay(index);
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
                  const { bidType, indicator, isPlayIn, isLastFourByes } = getBidTypeInfo(team);
                  const addSeparator = shouldAddSeparator(index);
                  
                  // Determine row background color
                  let rowBgClass = 'bg-white';
                  if (isPlayIn) {
                    rowBgClass = 'bg-purple-50';
                  } else if (isLastFourByes) {
                    rowBgClass = 'bg-orange-50';
                  }
                  
                  return (
                    <React.Fragment key={team.espnId || team.slug}>
                      <tr
                        className={`${rowBgClass} hover:opacity-80 cursor-pointer transition-all ${
                          addSeparator ? 'border-b-2 border-gray-900' : 'border-b border-gray-200'
                        }`}
                        onClick={() => onTeamSelect(team.slug)}
                      >
                        <td className="py-2 pl-4 md:py-3 md:pl-3 text-gray-500 font-medium geist-mono text-xs">
                          {seedDisplay}
                        </td>
                        <td className="py-2 px-2 md:py-3 md:px-4">
                          <div className="flex items-center gap-3">
                            {team.logo && (
                              <img
                                src={team.logo}
                                alt={team.displayName}
                                className="w-6 h-6 object-contain"
                              />
                            )}
                            <span className="text-gray-900 font-medium text-sm md:text-md">
                              {team.shortName}
                            </span>
                          </div>
                        </td>
                        <td
                          className="py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs bg-amber-50/50 font-semibold"
                          title={(() => {
                            const bidBase = calculateSelectionRanking(team);
                            const seedScore = calculateSeedingRanking(team);
                            const breakdown = getIntangibleBreakdown(team).filter(i => i.pctDelta !== 0);
                            const multiplier = breakdown.reduce((m, i) => m * (1 + i.pctDelta), 1.0);
                            const bidAdj = bidBase; // already includes multiplier
                            const bidPreAdj = breakdown.length > 0 ? bidBase / multiplier : bidBase;
                            const lines = [
                              `Bid score:   ${bidBase.toFixed(2)}${breakdown.length > 0 ? ` (base: ${bidPreAdj.toFixed(2)}, adj: ${((multiplier - 1) * 100).toFixed(1)}%)` : ''}`,
                              `Seed score:  ${seedScore.toFixed(2)}`,
                              ...(breakdown.length > 0 ? [
                                '',
                                ...breakdown.map(i =>
                                  `- ${i.name}: ${i.pctDelta >= 0 ? '+' : ''}${(i.pctDelta * 100).toFixed(1)}%`
                                )
                              ] : [])
                            ];
                            return lines.join('\n');
                          })()}
                        >
                          {calculateCompositeRanking(team).toFixed(1)}
                        </td>
                        <td 
                          className="py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs bg-gray-50/25"
                          title={predictiveTooltip}
                        >
                          {predictiveAvg !== null ? predictiveAvg.toFixed(1) : '—'}
                        </td>
                        <td 
                          className="py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs bg-gray-50/25"
                          title={resumeTooltip}
                        >
                          {resumeAvg !== null ? resumeAvg.toFixed(1) : '—'}
                        </td>
                        <td className="py-2 px-2 md:py-3 md:px-4 text-right text-gray-700 geist-mono text-xs bg-gray-50/25">
                          {team.net || '—'}
                        </td>
                        <td className="py-2 px-2 md:py-3 md:px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-regular text-gray-400">
                              {bidType}
                            </span>
                            {indicator && (
                              <span className={`text-[10px] font-medium ${
                                isPlayIn ? 'text-purple-800' :
                                isLastFourByes ? 'text-orange-800' : 'text-orange-600'
                              }`}>
                                {indicator}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>

          {/* Sidebar with bubble teams */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 ibm-plex-sans">Bubble Teams</h2>
            <BubbleSidebar
              lastFourByesList={lastFourByesList}
              lastFourInList={lastFourInList}
              firstFourOut={bubbleTeams.slice(0, 4)}
              nextFourOut={bubbleTeams.slice(4, 8)}
              onTeamSelect={onTeamSelect}
            />
            <p className="mt-8 text-xs text-gray-600"><a href="/bubble-watch">View full Bubble Watch »</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
