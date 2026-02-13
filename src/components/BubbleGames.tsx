import React, { useMemo } from 'react';
import type { Team, TeamSchedule, ScheduleGame } from '@/types/team';

type BubbleGamesProps = {
  teams: Team[];
  allSchedules: Record<string, TeamSchedule>;
  onTeamSelect?: (slug: string) => void;
};

type GameDisplay = {
  game: ScheduleGame;
  homeTeam: Team | null;
  awayTeam: Team | null;
  bubbleTeamSlug: string;
  gameTime: Date;
};

export function BubbleGames({ teams, allSchedules, onTeamSelect }: BubbleGamesProps) {
  // Get Safe for Now teams (70-90% odds) and Bubble teams (25-70% odds)
  const bubbleAndSafeTeams = useMemo(() => {
    const conferenceLeaders = new Set<string>();
    const conferenceGroups: Record<string, Team[]> = {};
    
    teams.forEach(team => {
      const conf = team.conference || 'Unknown';
      if (!conferenceGroups[conf]) {
        conferenceGroups[conf] = [];
      }
      conferenceGroups[conf].push(team);
    });

    // Find conference leaders
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

    // Return teams with 25-90% odds that aren't conference leaders
    return teams.filter(t => 
      (t.tournamentOdds ?? 0) > 25 && 
      (t.tournamentOdds ?? 0) <= 90 && 
      !conferenceLeaders.has(t.slug)
    );
  }, [teams]);

  // Get today's and tomorrow's games for these teams
  const upcomingGames = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const games: GameDisplay[] = [];
    const processedGameIds = new Set<string>();

    bubbleAndSafeTeams.forEach(team => {
      const schedule = allSchedules[team.slug];
      if (!schedule?.schedule) return;

      schedule.schedule.forEach(game => {
        const gameDate = new Date(game.date);
        
        // Include today's and tomorrow's games
        if (gameDate >= today && gameDate < dayAfterTomorrow) {
          // Create a unique game ID to avoid duplicates
          const gameId = `${game.date}-${game.competitors.map(c => c.team_id).sort().join('-')}`;
          
          if (!processedGameIds.has(gameId)) {
            processedGameIds.add(gameId);

            // Find home and away teams
            const homeComp = game.competitors[0];
            const awayComp = game.competitors[1];
            
            const homeTeam = teams.find(t => t.espnId === homeComp.team_id || t.slug === homeComp.slug) || null;
            const awayTeam = teams.find(t => t.espnId === awayComp.team_id || t.slug === awayComp.slug) || null;

            games.push({
              game,
              homeTeam,
              awayTeam,
              bubbleTeamSlug: team.slug,
              gameTime: gameDate
            });
          }
        }
      });
    });

    // Sort by game time
    return games.sort((a, b) => a.gameTime.getTime() - b.gameTime.getTime());
  }, [bubbleAndSafeTeams, allSchedules, teams]);

  if (upcomingGames.length === 0) {
    return (
      <div className="bg-white">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 ibm-plex-sans">
            Upcoming Bubble Games
          </h2>
          <p className="text-gray-600 mb-6">
            No games scheduled in the next two days for teams on the bubble or safe for now.
          </p>
        </div>
      </div>
    );
  }

  const formatGameTime = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const gameDay = new Date(date);
    gameDay.setHours(0, 0, 0, 0);
    
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const formattedTime = timeString.replace(/:00\s/, ' ');
    
    // Add day indicator if it's tomorrow
    if (gameDay.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${formattedTime}`;
    }
    return formattedTime;
  };

  return (
    <div className="bg-white">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 ibm-plex-sans">
          Bubble Games
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Upcoming matchups featuring teams in the mix for an at-large bid.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            
            <tbody>
              {upcomingGames.map((gameDisplay, idx) => {
                const { game, homeTeam, awayTeam, gameTime } = gameDisplay;
                const homeComp = game.competitors[0];
                const awayComp = game.competitors[1];
                const isCompleted = homeComp.score !== null && awayComp.score !== null;

                return (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 transition-colors last:border-b-0"
                  >
    
                    <td className="py-3 pr-4">
                      <div className="space-y-2 flex flex-row items-start gap-2">
                        {/* Away Team */}
                        <div className="flex items-center gap-1">
                          {awayComp.logo && (
                            <img
                              src={awayComp.logo}
                              alt={awayComp.team_nickname}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          {awayTeam ? (
                            <button
                              onClick={() => onTeamSelect?.(awayTeam.slug)}
                              className="text-gray-900 font-medium text-sm hover:underline cursor-pointer"
                            >
                              {awayComp.team_nickname}
                            </button>
                          ) : (
                            <span className="text-gray-900 font-medium text-sm">
                              {awayComp.team_nickname}
                            </span>
                          )}
                          
                        </div>
                        
                        {/* @ symbol */}
                        <div className="text-xs text-gray-400">@</div>
                        
                        {/* Home Team */}
                        <div className="flex items-center gap-2">
                          {homeComp.logo && (
                            <img
                              src={homeComp.logo}
                              alt={homeComp.team_nickname}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          {homeTeam ? (
                            <button
                              onClick={() => onTeamSelect?.(homeTeam.slug)}
                              className="text-gray-900 font-medium text-sm hover:underline cursor-pointer"
                            >
                              {homeComp.team_nickname}
                            </button>
                          ) : (
                            <span className="text-gray-900 font-medium text-sm">
                              {homeComp.team_nickname}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 pl-4 text-gray-700 geist-mono text-xs whitespace-nowrap text-right">
                      {isCompleted ? 'Final' : formatGameTime(gameTime)}
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
