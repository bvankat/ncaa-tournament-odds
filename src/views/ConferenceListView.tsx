import React, { useMemo } from 'react';
import type { Team } from '@/types/team';
import { formatPercent } from '@/lib/utils';
import { calculateBracket } from '@/lib/bracketProjection';
import { TournamentDashboard } from '@/components/TournamentDashboard';

type ConferenceListViewProps = {
  teams: Team[];
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime?: (t: number | string) => string;
};

type ConferenceTeams = {
  [conference: string]: Team[];
};

export function ConferenceListView({ teams, onTeamSelect, lastUpdated, formatRelativeTime }: ConferenceListViewProps) {
  // Group teams by conference and sort by conference standings
  const conferenceGroups = useMemo(() => {
    const groups: ConferenceTeams = {};
    
    teams.forEach(team => {
      const conf = team.conference || 'Unknown';
      if (!groups[conf]) {
        groups[conf] = [];
      }
      groups[conf].push(team);
    });

    // Sort teams within each conference by confStandingsPosition
    Object.keys(groups).forEach(conf => {
      groups[conf].sort((a, b) => {
        // Extract position number from "1st in ACC" format
        const aPos = parseInt(a.confStandingsPosition?.match(/^\d+/)?.[0] || '999');
        const bPos = parseInt(b.confStandingsPosition?.match(/^\d+/)?.[0] || '999');
        return aPos - bPos;
      });
    });

    return groups;
  }, [teams]);

  // Get sorted conference names alphabetically
  const sortedConferences = useMemo(() => {
    return Object.keys(conferenceGroups).sort((a, b) => a.localeCompare(b));
  }, [conferenceGroups]);

  // Calculate bracket projection for seed assignments and bubble teams
  const bracketData = useMemo(() => calculateBracket(teams), [teams]);
  const { teamSeedMap, bracketTeams, bubbleTeams } = bracketData;

  // Multi-bid conferences grid data
  const multiBidGrid = useMemo(() => {
    const bracketTeamIds = new Set(bracketTeams.map(t => t.espnId || t.slug));
    const firstFourOut = bubbleTeams.slice(0, 4);
    const nextFourOut = bubbleTeams.slice(4, 8);
    const bubbleTeamIds = new Set([...firstFourOut, ...nextFourOut].map(t => t.espnId || t.slug));
    
    type ConferenceData = {
      conference: string;
      tournamentTeams: Team[];
      bubbleTeams: Team[];
      tournamentCount: number;
    };
    
    const conferencesByBids: ConferenceData[] = [];
    
    Object.keys(conferenceGroups).forEach(conf => {
      const confTeams = conferenceGroups[conf];
      
      // Separate tournament teams from bubble teams
      const tournamentTeams = confTeams
        .filter(t => bracketTeamIds.has(t.espnId || t.slug))
        .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0));
      
      const bubble = confTeams
        .filter(t => bubbleTeamIds.has(t.espnId || t.slug))
        .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0));
      
      // Only include conferences with at least 2 teams total (tournament + bubble)
      const totalTeams = tournamentTeams.length + bubble.length;
      if (totalTeams >= 2) {
        conferencesByBids.push({
          conference: conf,
          tournamentTeams,
          bubbleTeams: bubble,
          tournamentCount: tournamentTeams.length
        });
      }
    });
    
    // Sort conferences by number of tournament teams (descending)
    conferencesByBids.sort((a, b) => b.tournamentCount - a.tournamentCount);
    
    // Find max depth for each section
    const maxTournamentDepth = Math.max(...conferencesByBids.map(c => c.tournamentTeams.length), 0);
    const maxBubbleDepth = Math.max(...conferencesByBids.map(c => c.bubbleTeams.length), 0);
    
    return { conferences: conferencesByBids, maxTournamentDepth, maxBubbleDepth };
  }, [conferenceGroups, bracketTeams, bubbleTeams]);

  return (
    <div className="min-h-screen">
      <div className="pt-12 lg:pt-16 pb-0" style={{
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
              Conference Breakdown
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Updated tournament projections and current standings for all 31 Division I conferences.
            </p>
          </div>
        </div>
      </div>
      <div className="sticky top-0 z-10 bg-white/30 backdrop-blur-lg no-scrollbar py-3 mb-12">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <select
            className="border border-blue-200 rounded-md px-4 py-3 text-sm font-medium text-gray-900 bg-white cursor-pointer hover:border-blue-400 transition-colors"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                window.location.hash = e.target.value;
                e.target.value = '';
              }
            }}
          >
            <option value="" disabled>Jump to a conference</option>
            {sortedConferences.map(conf => (
              <option key={conf} value={`${conf.toLowerCase().replace(/\s+/g, '-')}`}>
                {conf}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Multi-bid Conferences Grid */}
      {multiBidGrid.conferences.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 ibm-plex-sans">Multi-Bid Conferences</h2>
            <p className="text-sm text-gray-600 mt-1">
              Conferences with multiple tournament-caliber teams, including bubble teams just outside the field
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  {multiBidGrid.conferences.map(({ conference, tournamentCount }) => (
                    <th key={conference} className="text-center text-xs py-2 px-2 font-semibold text-gray-900 border-r border-gray-200 last:border-r-0 min-w-[80px]">
                      <a 
                        href={`#${conference.toLowerCase().replace(/\s+/g, '-')}`}
                        className="hover:text-blue-600 transition-colors block"
                      >
                        <div>{conference}</div>
                        <div className="text-[10px] font-normal text-gray-500 mt-1 geist-mono">
                          {tournamentCount} {tournamentCount === 1 ? 'team' : 'teams'}
                        </div>
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Tournament Teams */}
                {Array.from({ length: multiBidGrid.maxTournamentDepth }).map((_, rowIndex) => (
                  <tr key={`tournament-${rowIndex}`} className="border-b border-gray-200">
                    {multiBidGrid.conferences.map(({ conference, tournamentTeams }) => {
                      const team = tournamentTeams[rowIndex];
                      const teamId = team ? (team.espnId || team.slug) : null;
                      const seed = teamId ? teamSeedMap.get(teamId) : null;
                      return (
                        <td 
                          key={conference} 
                          className="py-1.5 px-2 border-r border-gray-200 last:border-r-0 align-top"
                        >
                          {team ? (
                            <button
                              onClick={() => onTeamSelect(team.slug)}
                              className="w-full flex items-center justify-center gap-1.5 py-1 px-1 rounded hover:bg-gray-50 transition-colors"
                              title={`${team.shortName}: ${seed} seed`}
                            >
                              {seed && (
                                <span className="text-[10px] font-bold text-gray-500 geist-mono w-4 text-left">
                                  {seed}
                                </span>
                              )}
                              {team.logo && (
                                <img
                                  src={team.logo}
                                  alt={`${team.shortName}: ${seed} seed`}
                                  className="w-6 h-6 object-contain"
                                />
                              )}
                            </button>
                          ) : (
                            <div className="h-8"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Separator row */}
                {multiBidGrid.maxBubbleDepth > 0 && (
                  <tr>
                    {multiBidGrid.conferences.map(({ conference }) => (
                      <td key={conference} className="border-r border-gray-200 last:border-r-0">
                        <div className="border-t-2 border-gray-900"></div>
                      </td>
                    ))}
                  </tr>
                )}
                {/* Bubble Teams (First Four Out + Next Four Out) */}
                {Array.from({ length: multiBidGrid.maxBubbleDepth }).map((_, rowIndex) => (
                  <tr key={`bubble-${rowIndex}`} className="border-b border-gray-200 last:border-b-0">
                    {multiBidGrid.conferences.map(({ conference, bubbleTeams }) => {
                      const team = bubbleTeams[rowIndex];
                      const bubbleCategory = rowIndex < 4 ? 'First Four Out' : 'Next Four Out';
                      return (
                        <td 
                          key={conference} 
                          className="py-1.5 px-2 border-r border-gray-200 last:border-r-0 align-top"
                        >
                          {team ? (
                            <button
                              onClick={() => onTeamSelect(team.slug)}
                              className="w-full flex items-center justify-center gap-1.5 py-1 px-1 rounded hover:bg-gray-50 transition-colors opacity-60"
                              title={`${team.shortName} - ${bubbleCategory}`}
                            >
                              {team.logo && (
                                <img
                                  src={team.logo}
                                  alt={`${team.shortName} - ${bubbleCategory}`}
                                  className="w-6 h-6 object-contain"
                                />
                              )}
                            </button>
                          ) : (
                            <div className="h-8"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">

        <div className="space-y-12">
          {sortedConferences.map(conference => {
            const teams = conferenceGroups[conference];
            const leader = teams[0];
            const locks = teams.filter(t => (t.tournamentOdds ?? 0) > 90 && t.slug !== leader?.slug)
              .sort((a, b) => a.shortName.localeCompare(b.shortName));
            const likelyIn = teams.filter(t => (t.tournamentOdds ?? 0) > 70 && (t.tournamentOdds ?? 0) <= 90 && t.slug !== leader?.slug)
              .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0));
            const bubble = teams.filter(t => (t.tournamentOdds ?? 0) > 25 && (t.tournamentOdds ?? 0) <= 70 && t.slug !== leader?.slug)
              .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0));

            return (
              <div key={conference} id={`${conference.toLowerCase().replace(/\s+/g, '-')}`} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 ibm-plex-sans">
                  <a href={`/conferences#${conference.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gray-700 transition-colors">
                    {conference}
                  </a>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12">
                  {/* Sidebar - Tournament Context */}
                  <div className="space-y-4">
                    {/* Conference Leader */}
                    {leader && (
                      <div>
                        <h3 className="text-xs font-medium geist-mono text-gray-500 uppercase mb-2">
                          Conf. leader (Auto-bid)
                        </h3>
                        <button
                          onClick={() => onTeamSelect(leader.slug)}
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-green-800 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                          title={`Tournament odds: ${(leader.tournamentOdds ?? 0).toFixed(0)}%`}
                        >
                          {leader.logo && (
                            <img 
                              src={leader.logo} 
                              alt={`Tournament odds: ${(leader.tournamentOdds ?? 0).toFixed(0)}%`}
                              className="w-4 h-4 object-contain" 
                            />
                          )}
                          <span className="text-xs font-medium text-gray-900">{leader.shortName}</span>
                        </button>
                      </div>
                    )}

                    {/* Tournament Locks */}
                    {locks.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium geist-mono text-gray-500 uppercase mb-2">
                          Tournament Locks
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {locks.map(team => (
                            <button
                              key={team.espnId || team.slug}
                              onClick={() => onTeamSelect(team.slug)}
                              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-green-600 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                              title={`Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                            >
                              {team.logo && (
                                <img 
                                  src={team.logo} 
                                  alt={`Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                                  className="w-4 h-4 object-contain" 
                                />
                              )}
                              <span className="text-xs font-medium text-gray-900">{team.shortName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safe for now */}
                    {likelyIn.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium geist-mono text-gray-500 uppercase mb-2">
                          Safe for now
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {likelyIn.map(team => (
                            <button
                              key={team.espnId || team.slug}
                              onClick={() => onTeamSelect(team.slug)}
                              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-green-400 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                              title={`Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                            >
                              {team.logo && (
                                <img 
                                  src={team.logo} 
                                  alt={`Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                                  className="w-4 h-4 object-contain" 
                                />
                              )}
                              <span className="text-xs font-medium text-gray-900">{team.shortName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bubble */}
                    {bubble.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium geist-mono text-gray-500 uppercase mb-2">
                          Bubble
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {bubble.map(team => (
                            <button
                              key={team.espnId || team.slug}
                              onClick={() => onTeamSelect(team.slug)}
                              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-yellow-500 bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer"
                              title={`Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                            >
                              {team.logo && (
                                <img 
                                  src={team.logo} 
                                  alt={`Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                                  className="w-4 h-4 object-contain" 
                                />
                              )}
                              <span className="text-xs font-medium text-gray-900">{team.shortName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Main Content - Standings Table */}
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300 bg-gray-50">
                          <th className="text-left text-xs py-2 px-2 font-medium geist-mono text-gray-400 uppercase">
                            
                          </th>
                          <th className="text-left text-xs py-2 px-3 font-medium geist-mono text-gray-400 uppercase">
                            Team
                          </th>
                          <th className="text-center text-xs py-2 px-2 font-medium geist-mono text-gray-400 uppercase">
                            Overall
                          </th>
                          <th className="text-center text-xs py-2 px-2 font-medium geist-mono text-gray-400 uppercase">
                            Conf
                          </th>
                          <th className="text-right text-xs py-2 px-3 font-medium geist-mono text-gray-400 uppercase">
                            At-large bid
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((team, index) => {
                          const position = team.confStandingsPosition?.match(/^\d+/)?.[0] || (index + 1).toString();
                          const formattedOdds = formatPercent(team.tournamentOdds ?? 0, { decimals: 0 });
                          
                          return (
                            <tr
                              key={team.espnId || team.slug}
                              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => onTeamSelect(team.slug)}
                            >
                              <td className="py-2 pl-2 text-gray-400 geist-mono text-xs font-normal">
                                {position}
                              </td>
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
                                    {team.displayName}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center text-gray-600 geist-mono text-xs">
                                {team.record || '—'}
                              </td>
                              <td className="py-2 px-2 text-center text-gray-900 geist-mono text-xs font-medium">
                                {team.confRecord || '—'}
                              </td>
                              <td className="py-2 px-3 text-right text-xs">
                                <span className="font-medium geist-mono">
                                  {formattedOdds}
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
          })}
        </div>
      </div>
    </div>
  );
}
