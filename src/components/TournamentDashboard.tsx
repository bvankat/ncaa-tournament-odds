import React from 'react';
import type { Team } from '@/types/team';

type TournamentDashboardProps = {
  teams: Team[];
  onTeamSelect?: (slug: string) => void;
};

export function TournamentDashboard({ teams, onTeamSelect }: TournamentDashboardProps) {
  // Get all conference leaders (one per conference)
  const conferenceLeaders = new Set<string>();
  const conferenceGroups: Record<string, Team[]> = {};
  
  teams.forEach(team => {
    const conf = team.conference || 'Unknown';
    if (!conferenceGroups[conf]) {
      conferenceGroups[conf] = [];
    }
    conferenceGroups[conf].push(team);
  });

  // Sort teams within each conference by confStandingsPosition to find leaders
  Object.keys(conferenceGroups).forEach(conf => {
    conferenceGroups[conf].sort((a, b) => {
      const aPos = parseInt(a.confStandingsPosition?.match(/^\d+/)?.[0] || '999');
      const bPos = parseInt(b.confStandingsPosition?.match(/^\d+/)?.[0] || '999');
      return aPos - bPos;
    });
    const leader = conferenceGroups[conf][0];
    if (leader) {
      conferenceLeaders.add(leader.slug);
    }
  });

  const autobids = Object.keys(conferenceGroups).length;
  
  // Get conference leaders sorted alphabetically
  const autobidTeams = teams
    .filter(t => conferenceLeaders.has(t.slug))
    .sort((a, b) => a.shortName.localeCompare(b.shortName));
  
  const locksTeams = teams
    .filter(t => (t.tournamentOdds ?? 0) > 90 && !conferenceLeaders.has(t.slug))
    .sort((a, b) => a.shortName.localeCompare(b.shortName));
  
  const likelyInTeams = teams
    .filter(t => (t.tournamentOdds ?? 0) > 65 && (t.tournamentOdds ?? 0) <= 90 && !conferenceLeaders.has(t.slug))
    .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0));
  
  const bubbleTeams = teams
    .filter(t => (t.tournamentOdds ?? 0) > 15 && (t.tournamentOdds ?? 0) <= 65 && !conferenceLeaders.has(t.slug))
    .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0));
  
  const locks = locksTeams.length;
  const likelyIn = likelyInTeams.length;
  const bubble = bubbleTeams.length;
  const spotsAvailable = 68 - autobids - locks - likelyIn;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Column 1 - Autobids and Locks */}
        <div className="md:border-r border-gray-200">
          {/* Autobids */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="text-xs font-medium geist-mono text-gray-500 uppercase mb-1">
              Autobids
            </div>
            <div className="text-4xl font-bold text-gray-900 ibm-plex-sans mb-3">
              {autobids}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {autobidTeams.map((team) => (
                <button
                  key={team.espnId || team.slug}
                  onClick={() => onTeamSelect?.(team.slug)}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  title={`${team.shortName}: Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                >
                  {team.logo && (
                    <img 
                      src={team.logo} 
                      alt={`${team.shortName}: Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                      className="w-5 h-5 object-contain" 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Locks */}
          <div className="bg-white p-6">
            <div className="text-xs font-medium geist-mono text-gray-500 uppercase mb-1">
              Locks
            </div>
            <div className="text-4xl font-bold text-green-700 ibm-plex-sans mb-3">
              {locks}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {locksTeams.map((team) => (
                <button
                  key={team.espnId || team.slug}
                  onClick={() => onTeamSelect?.(team.slug)}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  title={`${team.shortName}: Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                >
                  {team.logo && (
                    <img 
                      src={team.logo} 
                      alt={`${team.shortName}: Tournament odds: ${(team.tournamentOdds ?? 0).toFixed(0)}%`}
                      className="w-5 h-5 object-contain" 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 - Safe for now */}
        <div className="bg-white border-t md:border-t-0 md:border-r border-gray-200 p-6">
          <div className="text-xs font-medium geist-mono text-gray-500 uppercase mb-1">
            Safe for now
          </div>
          <div className="text-4xl font-bold text-green-400 ibm-plex-sans mb-4">
            {likelyIn}
          </div>
          <div className="flex flex-wrap gap-2">
            {likelyInTeams.map(team => (
              <button
                key={team.espnId || team.slug}
                onClick={() => onTeamSelect?.(team.slug)}
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

        {/* Column 3 - Bubble */}
        <div className="bg-white border-t md:border-t-0 border-gray-200 p-6">
          <div className="text-xs font-medium geist-mono text-gray-500 uppercase mb-1">
            Bubble
          </div>
          <div className="text-4xl font-bold text-yellow-600 ibm-plex-sans">
            {bubble}
          </div>
          <div className="text-xs text-gray-500 geist-mono mb-4">
            {bubble} teams for {spotsAvailable} spots
          </div>
          <div className="flex flex-wrap gap-2">
            {bubbleTeams.map(team => (
              <button
                key={team.espnId || team.slug}
                onClick={() => onTeamSelect?.(team.slug)}
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
      </div>
    </div>
  );
}

