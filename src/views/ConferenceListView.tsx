import React, { useMemo } from 'react';
import type { Team } from '@/types/team';
import { formatPercent } from '@/lib/utils';
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

  return (
    <div className="bg-white py-12 lg:py-16 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <div className="mb-8">
          {lastUpdated && formatRelativeTime && (
            <div id="updates-pill" className="inline-flex items-center w-fit px-4 py-2 shadow-sm bg-white/40 rounded-full border border-gray-200 mb-4">
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
            Conference Standings
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Current conference standings with tournament odds for all Division I conferences.
          </p>
        </div>

        <TournamentDashboard teams={teams} onTeamSelect={onTeamSelect} />

        <div className="space-y-12">
          {sortedConferences.map(conference => {
            const teams = conferenceGroups[conference];
            const leader = teams[0];
            const locks = teams.filter(t => (t.tournamentOdds ?? 0) > 90 && t.slug !== leader?.slug);
            const likelyIn = teams.filter(t => (t.tournamentOdds ?? 0) > 70 && (t.tournamentOdds ?? 0) <= 90);
            const bubble = teams.filter(t => (t.tournamentOdds ?? 0) > 25 && (t.tournamentOdds ?? 0) <= 70);

            return (
              <div key={conference} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 ibm-plex-sans">
                  {conference}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
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

                    <p className="text-xs text-gray-500 geist-mono pt-2">
                      {teams.length} teams
                    </p>
                  </div>

                  {/* Main Content - Standings Table */}
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300 bg-gray-50">
                          <th className="text-left text-xs py-2 px-2 font-medium geist-mono text-gray-400 uppercase">
                            Pos
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
                              <td className="py-2 px-2 text-gray-500 geist-mono text-xs font-medium">
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
