import React, { useMemo } from 'react';
import type { Team } from '@/types/team';

type BracketViewProps = {
  teams: Team[];
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime?: (t: number | string) => string;
};

export function BracketView({ teams, onTeamSelect, lastUpdated, formatRelativeTime }: BracketViewProps) {
  // Determine auto-bids: one per conference, first place team with highest seedOdds
  const { autoBidTeams, autoBidList } = useMemo(() => {
    const conferenceLeaders = new Map<string, Team>();
    
    teams.forEach(team => {
      if (!team.conference || !team.confStandingsPosition) return;
      
      // Check if team is in first place
      const isFirstPlace = team.confStandingsPosition.toLowerCase().includes('1st');
      if (!isFirstPlace) return;
      
      const existing = conferenceLeaders.get(team.conference);
      if (!existing || (team.seedOdds ?? 0) > (existing.seedOdds ?? 0)) {
        conferenceLeaders.set(team.conference, team);
      }
    });
    
    const autoBids = Array.from(conferenceLeaders.values());
    return {
      autoBidTeams: new Set(autoBids.map(t => t.espnId || t.slug)),
      autoBidList: autoBids
    };
  }, [teams]);

  // Build the 68-team bracket: 31 auto-bids + 37 best at-large teams
  const { bracketTeams, bubbleTeams } = useMemo(() => {
    // Get all non-auto-bid teams sorted by tournamentOdds
    const atLargePool = teams
      .filter(team => !autoBidTeams.has(team.espnId || team.slug))
      .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0));
    
    // Take top 37 at-large teams
    const atLargeTeams = atLargePool.slice(0, 37);
    
    // Combine auto-bids and at-large teams
    const bracket = [...autoBidList, ...atLargeTeams];
    
    // Sort bracket by seedOdds for seeding purposes
    bracket.sort((a, b) => (b.seedOdds ?? 0) - (a.seedOdds ?? 0));
    
    // Get bubble teams (next 8 teams after the bracket)
    const bubble = atLargePool.slice(37, 45);
    
    return { bracketTeams: bracket, bubbleTeams: bubble };
  }, [teams, autoBidTeams, autoBidList]);

  // Identify play-in teams, Last Four In, and Last Four Byes
  const { playInTeams, lastFourIn, lastFourByes, lastFourInList, lastFourByesList } = useMemo(() => {
    const atLargeInBracket = bracketTeams.filter(team => 
      !autoBidTeams.has(team.espnId || team.slug)
    );
    const autoBidsInBracket = bracketTeams.filter(team =>
      autoBidTeams.has(team.espnId || team.slug)
    );
    
    // Last 4 at-large teams are "Last Four In" (11-seed play-ins)
    const lastFourInTeams = atLargeInBracket.slice(-4);
    const lastFourInIds = new Set(lastFourInTeams.map(t => t.espnId || t.slug));
    
    // 4 teams before Last Four In are "Last Four Byes"
    const lastFourByesTeams = atLargeInBracket.slice(-8, -4);
    const lastFourByesIds = new Set(lastFourByesTeams.map(t => t.espnId || t.slug));
    
    // Last 4 auto-bids are 16-seed play-ins
    const autoBidPlayIns = autoBidsInBracket.slice(-4);
    const autoBidPlayInIds = new Set(autoBidPlayIns.map(t => t.espnId || t.slug));
    
    // All 8 play-in teams
    const allPlayIns = new Set([...lastFourInIds, ...autoBidPlayInIds]);
    
    return {
      playInTeams: allPlayIns,
      lastFourIn: lastFourInIds,
      lastFourByes: lastFourByesIds,
      lastFourInList: lastFourInTeams,
      lastFourByesList: lastFourByesTeams
    };
  }, [bracketTeams, autoBidTeams]);

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

  // Determine seed display - adjusted for 11-seed and 16-seed play-ins
  const getSeedDisplay = (index: number): string => {
    if (index < 40) {
      // Seeds 1-10, four teams each
      return `${Math.floor(index / 4) + 1}`;
    } else if (index < 46) {
      // Seed 11: 6 teams (indices 40-45)
      return '11';
    } else if (index < 62) {
      // Seeds 12-15: 4 teams each (indices 46-61)
      return `${Math.floor((index - 46) / 4) + 12}`;
    } else {
      // Seed 16: 6 teams (indices 62-67)
      return '16';
    }
  };

  // Check if we should add a separator after this row
  const shouldAddSeparator = (index: number): boolean => {
    // Add separator after every seed group
    if (index === 39) return true; // After seed 10
    if (index === 45) return true; // After seed 11
    if (index < 40 && (index + 1) % 4 === 0) return true; // After seeds 1-10
    if (index >= 46 && index < 62 && (index - 46 + 1) % 4 === 0) return true; // After seeds 12-15
    return false;
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
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="text-left text-xs py-3 px-3 font-medium geist-mono text-gray-400 uppercase">
                    Seed
                  </th>
                  <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                    Team
                  </th>
                  <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                    Bid Type
                  </th>
                  <th className="hidden lg:table-cell text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                    Predictive Avg
                  </th>
                  <th className="hidden lg:table-cell text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                    Resume Avg
                  </th>
                  <th className="hidden md:table-cell text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">
                    NET
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
                        <td className="py-3 px-3 text-gray-700 font-semibold geist-mono text-xs">
                          {seedDisplay}
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
                            <span className="text-gray-900 font-medium text-sm md:text-md">
                              {team.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-gray-500 geist-mono">
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
                        <td 
                          className="hidden lg:table-cell py-3 px-4 text-right text-gray-700 geist-mono text-xs"
                          title={predictiveTooltip}
                        >
                          {predictiveAvg !== null ? predictiveAvg.toFixed(1) : '—'}
                        </td>
                        <td 
                          className="hidden lg:table-cell py-3 px-4 text-right text-gray-700 geist-mono text-xs"
                          title={resumeTooltip}
                        >
                          {resumeAvg !== null ? resumeAvg.toFixed(1) : '—'}
                        </td>
                        <td className="hidden md:table-cell py-3 px-4 text-right text-gray-700 geist-mono text-xs">
                          {team.net || '—'}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sidebar with bubble teams */}
          <div className="space-y-12">
            {/* Last Four Byes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 geist-mono uppercase">
                Last Four Byes
              </h3>
              <div className="flex flex-wrap gap-2">
                {lastFourByesList.map((team) => (
                  <button
                    key={team.espnId || team.slug}
                    onClick={() => onTeamSelect(team.slug)}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-orange-200 bg-orange-50/25 hover:bg-orange-50 transition-colors cursor-pointer"
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
            </div>

            {/* Last Four In */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 geist-mono uppercase">
                Last Four In
              </h3>
              <div className="flex flex-wrap gap-2">
                {lastFourInList.map((team) => (
                  <button
                    key={team.espnId || team.slug}
                    onClick={() => onTeamSelect(team.slug)}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-purple-200 bg-purple-50/25 hover:bg-purple-50 transition-colors cursor-pointer"
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
            </div>

            {/* First Four Out */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 geist-mono uppercase">
                First Four Out
              </h3>
              <div className="flex flex-wrap gap-2">
                {bubbleTeams.slice(0, 4).map((team) => (
                  <button
                    key={team.espnId || team.slug}
                    onClick={() => onTeamSelect(team.slug)}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
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
            </div>

            {/* Next Four Out */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 geist-mono uppercase">
                Next Four Out
              </h3>
              <div className="flex flex-wrap gap-2">
                {bubbleTeams.slice(4, 8).map((team) => (
                  <button
                    key={team.espnId || team.slug}
                    onClick={() => onTeamSelect(team.slug)}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
