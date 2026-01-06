import React from 'react';
import { Speedometer } from '@/components/Speedometer';
import { RankingSparkline } from '@/components/RankingSparkline';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { Team, TeamSchedule } from '@/types/team';

type TeamViewProps = {
  team: Team;
  schedule?: TeamSchedule;
  lastUpdated?: number | string | null;
  formatRelativeTime: (t: number | string) => string;
  calculateTournamentOdds: (rankings: Record<string, number | string | undefined>) => number;
  allTeams: Team[];
};

export function TeamView({ team, schedule, lastUpdated, formatRelativeTime, calculateTournamentOdds, allTeams }: TeamViewProps) {
  const primaryColor = team.primaryColor ? `#${team.primaryColor}` : '#000000';
  const secondaryColor = team.secondaryColor ? `#${team.secondaryColor}` : '#ffffff';
  const tournamentOdds = calculateTournamentOdds(team as unknown as Record<string, number | string>);

  // Get odds change directly from team data
  const oddsChange = team.oddsChange ?? null;

  // Helper function to determine ranking direction and delta (lower rank = better)
  const getRankingChange = (current: number | string | null | undefined, previous: number | string | null | undefined): { direction: 'up' | 'down', delta: number } | null => {
    if (!current || !previous) return null;
    const curr = typeof current === 'string' ? parseFloat(current) : current;
    const prev = typeof previous === 'string' ? parseFloat(previous) : previous;
    if (isNaN(curr) || isNaN(prev)) return null;
    const delta = Math.abs(prev - curr);
    if (curr < prev) return { direction: 'up', delta }; // Lower rank is better
    if (curr > prev) return { direction: 'down', delta };
    return null;
  };

  // Helper function to get team slug from ESPN ID
  const getTeamSlug = (espnId: string | null | undefined): string | null => {
    if (!espnId) return null;
    // Find the team in allTeams by ESPN ID
    const foundTeam = allTeams.find(t => t.espnId === espnId);
    return foundTeam?.slug || null;
  };

  // Helper function to format month names
  const formatMonth = (date: Date): string => {
    const monthNames = ['Jan.', 'Feb.', 'March', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
    return monthNames[date.getMonth()];
  };

  // Helper function to format time, removing :00 minutes for unplayed games
  const formatGameTime = (date: Date): string => {
    const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return timeString.replace(/:00\s/, ' ');
  };

  return (
    <div>
      <div
        className="w-full overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor} 50%, rgba(0,0,0,0.9) 120%)`,
          backgroundColor: primaryColor,
          color: secondaryColor,
        }}
      >
        <div className="max-w-screen-xl mx-auto px-2 py-12 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-3 md:px-12">
            <div className="flex flex-col justify-center gap-4 text-center md:text-left items-center md:items-start">
              {lastUpdated && (
                <div id="updates-pill" className="inline-flex items-center w-fit px-4 py-2 shadow-sm bg-black/10 rounded-full border border-white/15 mb-2 lg:mb-6">
                  <span className="relative size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-200 opacity-80"></span>
                    <span className="absolute inline-flex size-2 rounded-full bg-green-500"></span>
                  </span>
                  <p className="text-gray-200 text-xs font-light tracking-wider pl-4 lg:inline-block geist-mono uppercase">
                    <span className="">UPDATED </span>
                    <span id="update-relative-time">{formatRelativeTime(lastUpdated)}</span>
                  </p>
                </div>
              )}
              <div className="flex flex-col mb-0 lg:mb-6 items-center lg:items-start">
                <h1 className="text-3xl lg:text-5xl px-6 lg:px-0 font-extrabold mb-0 lg:mb-4 text-balance text-white ibm-plex-sans">
                  {team.displayName} <span className="font-normal">NCAA Tournament Odds</span>
                </h1>
                <p className="hidden lg:block text-md lg:text-md opacity-90 text-balance font-normal text-gray-200">
                  At-large bid chances for {team.shortName} based on its current team-sheet ranks
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
              <Speedometer value={tournamentOdds} />
              {oddsChange !== null && (
                <div className="flex items-center gap-2 text-sm font-semibold geist-mono">
                  {oddsChange > 0 ? (
                    <>
                      <span className="text-green-300">+{oddsChange}% TODAY</span>
                    </>
                  ) : oddsChange < 0 ? (
                    <>
                      <span className="text-red-300">{oddsChange}% TODAY</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400 font-normal">No change today</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div id="ratings" className="bg-white px-6 py-6 md:px-12 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-12">
          <div className="md:col-span-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 uppercase">
                  <th className="text-left text-xs py-3 pr-4 font-medium geist-mono text-gray-400">Metric</th>
                  <th className="text-center text-xs py-3 px-4 font-medium geist-mono text-gray-400"></th>
                  <th className="text-right text-xs py-3 pl-4 font-medium geist-mono text-gray-400">Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">NET</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.net} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {(() => {
                        const change = getRankingChange(team.net, team.previousNet);
                        if (change?.direction === 'up') return <span className="flex items-center text-green-800/40 text-xs font-medium"><ArrowUp className="w-3 h-3" />{change.delta}</span>;
                        if (change?.direction === 'down') return <span className="flex items-center text-red-800/40 text-xs font-medium"><ArrowDown className="w-3 h-3" />{change.delta}</span>;
                        return null;
                      })()}
                      <span className="text-gray-800 font-semibold geist-mono">{team.net || '—'}</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">BPI</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.bpi} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {(() => {
                        const change = getRankingChange(team.bpi, team.previousBpi);
                        if (change?.direction === 'up') return <span className="flex items-center text-green-800/40 text-xs font-medium"><ArrowUp className="w-3 h-3" />{change.delta}</span>;
                        if (change?.direction === 'down') return <span className="flex items-center text-red-800/40 text-xs font-medium"><ArrowDown className="w-3 h-3" />{change.delta}</span>;
                        return null;
                      })()}
                      <span className="text-gray-800 font-semibold geist-mono">{team.bpi || '—'}</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">SOR</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.sor} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {(() => {
                        const change = getRankingChange(team.sor, team.previousSor);
                        if (change?.direction === 'up') return <span className="flex items-center text-green-800/40 text-xs font-medium"><ArrowUp className="w-3 h-3" />{change.delta}</span>;
                        if (change?.direction === 'down') return <span className="flex items-center text-red-800/40 text-xs font-medium"><ArrowDown className="w-3 h-3" />{change.delta}</span>;
                        return null;
                      })()}
                      <span className="text-gray-800 font-semibold geist-mono">{team.sor || '—'}</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">KPI</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.kpi} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {(() => {
                        const change = getRankingChange(team.kpi, team.previousKpi);
                        if (change?.direction === 'up') return <span className="flex items-center text-green-800/40 text-xs font-medium"><ArrowUp className="w-3 h-3" />{change.delta}</span>;
                        if (change?.direction === 'down') return <span className="flex items-center text-red-800/40 text-xs font-medium"><ArrowDown className="w-3 h-3" />{change.delta}</span>;
                        return null;
                      })()}
                      <span className="text-gray-800 font-semibold geist-mono">{team.kpi || '—'}</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">KenPom</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.kenpom} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {(() => {
                        const change = getRankingChange(team.kenpom, team.previousKenpom);
                        if (change?.direction === 'up') return <span className="flex items-center text-green-800/40 text-xs font-medium"><ArrowUp className="w-3 h-3" />{change.delta}</span>;
                        if (change?.direction === 'down') return <span className="flex items-center text-red-800/40 text-xs font-medium"><ArrowDown className="w-3 h-3" />{change.delta}</span>;
                        return null;
                      })()}
                      <span className="text-gray-800 font-semibold geist-mono">{team.kenpom || '—'}</span>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">Torvik</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.torvik} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {(() => {
                        const change = getRankingChange(team.torvik, team.previousTorvik);
                        if (change?.direction === 'up') return <span className="flex items-center text-green-800/40 text-xs font-medium"><ArrowUp className="w-3 h-3" />{change.delta}</span>;
                        if (change?.direction === 'down') return <span className="flex items-center text-red-800/40 text-xs font-medium"><ArrowDown className="w-3 h-3" />{change.delta}</span>;
                        return null;
                      })()}
                      <span className="text-gray-800 font-semibold geist-mono">{team.torvik || '—'}</span>
                    </div>
                  </td>
                </tr>
                <tr className="">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">WAB</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.wab} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {(() => {
                        const change = getRankingChange(team.wab, team.previousWab);
                        if (change?.direction === 'up') return <span className="flex items-center text-green-800/40 text-xs font-medium"><ArrowUp className="w-3 h-3" />{change.delta}</span>;
                        if (change?.direction === 'down') return <span className="flex items-center text-red-800/40 text-xs font-medium"><ArrowDown className="w-3 h-3" />{change.delta}</span>;
                        return null;
                      })()}
                      <span className="text-gray-800 font-semibold geist-mono">{team.wab || '—'}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="md:col-span-3 md:col-start-6">

            <div className="bg-white flex flex-row rounded-lg shadow-xs border border-gray-200 mb-6">
              <div className="border-r border-gray-200 px-6 py-6 text-center flex-1">
                {team.record && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{team.record}</div>
                  </div>
                )}
                <h3 className="text-xs geist-mono text-gray-400 uppercase mt-1">OVERALL</h3>
              </div>
              <div className="py-6 px-6 text-center flex-1">
                {team.confRecord && (
                  <div > 
                    <div className="text-2xl font-bold text-gray-900">{team.confRecord}</div>
                  </div>
                )}
                <h3 className="text-xs geist-mono text-gray-400 uppercase mt-1">{team.confStandingsPosition}</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6 mb-6">
              <h3 className="text-xs geist-mono text-gray-400 uppercase mb-1">NEXT GAME</h3>
              {team.nextGame ? (
                <div className="grid grid-cols-1 gap-2 align-middle items-center justify-between mt-2">
                    <p className="text-md leading-4 items-center flex flex-row gap-2 font-medium text-gray-900 mt-1" id="nextGame-teams">
                        {(() => {
                          const awaySlug = getTeamSlug(team.nextGame.away_team_id);
                          const homeSlug = getTeamSlug(team.nextGame.home_team_id);
                          const awayTeam = awaySlug ? (
                            <a href={`/${awaySlug}`} className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity">
                              <img src={`${team.nextGame.away_team_logo}`} alt={`${team.nextGame.away_team} logo`} className="inline-block w-6 h-6" />
                              <strong>{team.nextGame.away_team}</strong>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <img src={`${team.nextGame.away_team_logo}`} alt={`${team.nextGame.away_team} logo`} className="inline-block w-6 h-6" />
                              <strong>{team.nextGame.away_team}</strong>
                            </span>
                          );
                          const homeTeam = homeSlug ? (
                            <a href={`/${homeSlug}`} className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity">
                              <img src={`${team.nextGame.home_team_logo}`} alt={`${team.nextGame.home_team} logo`} className="inline-block w-6 h-6" />
                              <strong>{team.nextGame.home_team}</strong>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <img src={`${team.nextGame.home_team_logo}`} alt={`${team.nextGame.home_team} logo`} className="inline-block w-6 h-6" />
                              <strong>{team.nextGame.home_team}</strong>
                            </span>
                          );
                          return <>{awayTeam} <span className="mx-1">at</span> {homeTeam}</>;
                        })()}
                    </p>
                    <p className="text-xs text-gray-500 font-normal geist-mono" id="nextGame-details">
                      {new Date(team.nextGame.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}{' '}
                      {new Date(team.nextGame.date).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No upcoming game scheduled</p>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {(team.record || team.quad1 || team.quad2 || team.quad3 || team.quad4) && (
        <div id="schedule-details" className="bg-gray-50">
          <div className="px-6 py-12 lg:px-12 lg:py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 ibm-plex-sans">{ team.shortName } schedule</h2>

        <div className="grid grid-cols-1 lg:grid-cols-8 gap-12">

          <div id="schedule-table" className="order-2 lg:order-1 lg:col-span-5">
            {schedule && schedule.schedule && schedule.schedule.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left text-xs py-3 pr-2 font-medium geist-mono text-gray-400 uppercase">Opponent</th>
                    <th className="text-left text-xs py-3 px-2 font-medium geist-mono text-gray-400 uppercase">Date</th>
                    <th className="text-right text-xs py-3 pl-4 font-medium text-gray-400 geist-mono uppercase">Result</th>
                    <th className="text-right text-xs py-3 font-medium geist-mono text-gray-400 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.schedule.map((game, idx) => {
                    // Find current team and opponent
                    const currentTeamComp = game.competitors.find(c => c.team_nickname === team.shortName);
                    const opponentComp = game.competitors.find(c => c.team_nickname !== team.shortName);
                    
                    if (!opponentComp) return null;

                    // Check if opponent is competitors[0] to determine if it's a road game
                    const isRoadGame = game.competitors[0].team_nickname === opponentComp.team_nickname;
                    // Use pre-computed slug from schedule data, fallback to lookup if not available
                    const opponentSlug = opponentComp.slug || getTeamSlug(opponentComp.team_id);
                    const opponentDisplay = opponentSlug ? (
                      <a href={`/${opponentSlug}`} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                        {opponentComp.logo && (
                          <img 
                            src={opponentComp.logo} 
                            alt={opponentComp.team_nickname} 
                            className="w-6 h-6 object-contain"
                            loading="lazy"
                          />
                        )}
                        <span>
                          {isRoadGame && <span className="text-gray-500 font-light text-sm">at </span>}
                          {opponentComp.gameRank && opponentComp.gameRank >= 1 && opponentComp.gameRank <= 25 && (
                            <span className="mx-1 text-xs font-medium text-gray-600">#{opponentComp.gameRank}</span>
                          )}
                          {opponentComp.team_nickname}
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3">
                        {opponentComp.logo && (
                          <img 
                            src={opponentComp.logo} 
                            alt={opponentComp.team_nickname} 
                            className="w-6 h-6 object-contain"
                            loading="lazy"
                          />
                        )}
                        <span>
                          {isRoadGame && <span className="text-gray-500 font-light text-sm">at </span>}
                          {opponentComp.gameRank && opponentComp.gameRank >= 1 && opponentComp.gameRank <= 25 && (
                            <span className="mx-1 text-xs font-medium text-gray-600">#{opponentComp.gameRank}</span>
                          )}
                          {opponentComp.team_nickname}
                        </span>
                      </div>
                    );
                    
                    // Check if game has been played (scores exist)
                    const hasScores = game.competitors.every(c => c.score !== null && c.score !== undefined);
                    
                    let dateDisplay: string | React.JSX.Element = '—';
                    let resultDisplay = '—';
                    let resultClass = 'text-gray-400 font-light';
                    
                    const gameDate = new Date(game.date);
                    
                    if (hasScores) {
                      // Game has been played - show date only
                      dateDisplay = `${formatMonth(gameDate)} ${gameDate.getDate()}`;
                      
                      // Determine winner and format score
                      const winner = game.competitors.find(c => c.winner);
                      const loser = game.competitors.find(c => !c.winner);
                      
                      let scoreDisplay = '—';
                      if (winner && loser && winner.score && loser.score) {
                        scoreDisplay = `${winner.score.displayValue}-${loser.score.displayValue}`;
                      }
                      
                      // Determine result
                      if (currentTeamComp?.winner) {
                        resultDisplay = `W ${scoreDisplay}`;
                        resultClass = 'text-green-700 font-medium';
                      } else {
                        resultDisplay = `L ${scoreDisplay}`;
                        resultClass = 'text-red-700 font-medium';
                      }
                    } else {
                      // Game hasn't been played yet - show date and time
                      const formattedDate = `${formatMonth(gameDate)} ${gameDate.getDate()}`;
                      const timeDisplay = formatGameTime(gameDate);
                      dateDisplay = <>{formattedDate} <span className="ml-2 text-[10px] text-gray-400">{timeDisplay}</span></>;
                      resultDisplay = '—';
                    }
                    
                    return (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-3 pr-2 text-gray-900 text-sm font-medium">{opponentDisplay}</td>
                        <td className="py-3 px-2 text-left text-gray-700 text-sm">{dateDisplay}</td>
                        <td className="py-3 pl-2 text-right text-sm geist-mono">
                          
                          {resultDisplay.split(' ').length > 1 && (
                            <span className="text-gray-700">{resultDisplay.split(' ').slice(1).join(' ')}</span>
                          )}
                        </td>
                        <td className="text-right pl-2">
                          <span className={resultClass}>
                            {resultDisplay[0]}
                          </span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center">Schedule not available</p>
            )}
          </div>

            <div id="record-details" className="order-1 lg:order-2 lg:col-span-3 lg:col-start-6">
              <div className="bg-white rounded-lg shadow-xs border border-gray-200 mb-6">
              <div className="grid grid-cols-4 gap-2">
                {team.record && (
                   <div className="text-center p-3 border-r border-gray-200">
                      <div className="text-xs text-gray-400 mb-1 geist-mono">RECORD</div>
                      <div className="text-xl font-medium text-gray-700">{team.record}</div>
                    </div>
                )}
                {team.home && (
                  <div className="text-center p-3 border-r border-gray-200">
                      <div className="text-xs text-gray-400 mb-1 geist-mono">HOME</div>
                      <div className="text-xl font-medium text-gray-900">{team.home}</div>
                  </div>
                )}
                {team.road && (
                  <div className="text-center p-3 border-r border-gray-200">
                    <div className="text-xs text-gray-400 mb-1 geist-mono">AWAY</div>
                    <div className="text-xl font-medium text-gray-900">{team.road}</div>
                  </div>
                )}
                {team.neutral && (
                  <div className="text-center p-3">
                    <div className="text-xs text-gray-400 mb-1 geist-mono">NEUTRAL</div>
                    <div className="text-xl font-medium text-gray-900">{team.neutral}</div>
                  </div>
                )}
              </div>
            </div>
            
            {(team.quad1 || team.quad2 || team.quad3 || team.quad4) && (
              
              <div className="bg-white rounded-lg shadow-xs border border-gray-200">

                <div className="grid grid-cols-4 gap-2">
                  {team.quad1 && (
                    <div className="text-center p-3 border-r border-gray-200">
                      <div className="text-xs text-gray-400 mb-1 geist-mono">QUAD 1</div>
                      <div className="text-xl font-medium">{team.quad1}</div>
                    </div>
                  )}
                  {team.quad2 && (
                    <div className="text-center p-3 border-r border-gray-200">
                      <div className="text-xs text-gray-400 mb-1 geist-mono">QUAD 2</div>
                      <div className="text-xl font-medium text-gray-700">{team.quad2}</div>
                    </div>
                  )}
                  {team.quad3 && (
                    <div className="text-center p-3 border-r border-gray-200">
                      <div className="text-xs text-gray-400 mb-1 geist-mono">QUAD 3</div>
                      <div className="text-xl font-medium text-gray-700">{team.quad3}</div>
                    </div>
                  )}
                  {team.quad4 && (
                    <div className="text-center p-3">
                      <div className="text-xs text-gray-400 mb-1 geist-mono">QUAD 4</div>
                      <div className="text-xl font-medium text-gray-700">{team.quad4}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
          </div>
        </div>
            </div>

      )}

      {/* Other Notable Rankings & Bracket Chances - Nebraska only */}
      {team.slug === 'nebraska-cornhuskers' && (team as any).polls && (
        <div id="other-rankings-bracket-chances" className="bg-white px-6 py-6 md:px-12 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            
            {/* Other Notable Rankings */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 ibm-plex-sans">Other Notable Rankings</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 uppercase">
                    <th className="text-left text-xs py-3 pr-4 font-medium geist-mono text-gray-400">Metric</th>
                    <th className="text-center text-xs py-3 px-4 font-medium geist-mono text-gray-400"></th>
                    <th className="text-right text-xs py-3 pl-4 font-medium geist-mono text-gray-400">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {(team as any).bauertology?.BRCT_rank && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">Bauertology</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).bauertology.BRCT_rank} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).bauertology.BRCT_rank}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).evanmiya?.miya_rating && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">Evan Miyakawa</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).evanmiya.miya_rating} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).evanmiya.miya_rating}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).haslametrics?.haslam_rating && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">Haslametrics</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).haslametrics.haslam_rating} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).haslametrics.haslam_rating}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).shot_quality?.sq_ranking && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">Shot Quality</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).shot_quality.sq_ranking} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).shot_quality.sq_ranking}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).warrennolan?.rpi && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">RPI</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).warrennolan.rpi} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).warrennolan.rpi}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).sports_reference?.srs_rank && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">Sports Reference SRS</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).sports_reference.srs_rank} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).sports_reference.srs_rank}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).massey_ratings?.massey_rank && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">Massey Composite</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).massey_ratings.massey_rank} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).massey_ratings.massey_rank}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).warrennolan?.elo && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">ELO Rank</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).warrennolan.elo} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).warrennolan.elo}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).teamrankings?.rank && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">TeamRankings.com</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).teamrankings.rank} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).teamrankings.rank}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).polls?.ap_rank && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">AP Poll</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).polls.ap_rank} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).polls.ap_rank}</span>
                      </td>
                    </tr>
                  )}
                  {(team as any).polls?.coaches_rank && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-gray-900 font-semibold">Coaches Poll</td>
                      <td className="py-3 px-4 flex justify-center">
                        <RankingSparkline rank={(team as any).polls.coaches_rank} color={primaryColor} />
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="text-gray-800 font-semibold geist-mono">{(team as any).polls.coaches_rank}</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bracket Chances */}
            {((team as any).trank?.trank_make_tourney || (team as any).teamrankings?.make_tournament || (team as any).bracketproject?.matrix_count) && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 ibm-plex-sans">Bracket Chances</h2>
                <div className="bg-white rounded-lg shadow-xs border border-gray-200 mb-6">
                  <div className="grid grid-cols-3 divide-x divide-gray-200">
                    {(team as any).trank?.trank_make_tourney && (
                      <div className="text-center p-4">
                        <div className="text-xs text-gray-400 mb-1 geist-mono uppercase">Torvik</div>
                        <div className="text-xl font-medium text-gray-900">{(team as any).trank.trank_make_tourney}%</div>
                      </div>
                    )}
                    {(team as any).teamrankings?.make_tournament && (
                      <div className="text-center p-4">
                        <div className="text-xs text-gray-400 mb-1 geist-mono uppercase">TeamRankings.com</div>
                        <div className="text-xl font-medium text-gray-900">{(team as any).teamrankings.make_tournament}</div>
                      </div>
                    )}
                    {(team as any).bracketproject?.matrix_count && (team as any).bracketproject?.total_brackets && (
                      <div className="text-center p-4">
                        <div className="text-xs text-gray-400 mb-1 geist-mono uppercase">Bracket Matrix</div>
                        <div className="text-xl font-medium text-gray-900">
                          {(team as any).bracketproject.matrix_count}/{(team as any).bracketproject.total_brackets}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Projected Seeds Table */}
                <div className="bg-white rounded-lg shadow-xs border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">Projection</th>
                        <th className="text-right text-xs py-3 px-4 font-medium geist-mono text-gray-400 uppercase">Seed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(team as any).bracketproject?.matrix_seed && (
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900 text-sm">Bracket Matrix</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold geist-mono">{(team as any).bracketproject.matrix_seed}</td>
                        </tr>
                      )}
                      {(team as any).espn_bracketology?.seed && (
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900 text-sm">ESPN Lunardi</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold geist-mono">{(team as any).espn_bracketology.seed}</td>
                        </tr>
                      )}
                      {(team as any).trank?.trank_seed && (
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900 text-sm">Bart Torvik</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold geist-mono">{(team as any).trank.trank_seed}</td>
                        </tr>
                      )}
                      {(team as any).teamrankings?.most_likely_seed && (
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900 text-sm">TeamRankings.com</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold geist-mono">{(team as any).teamrankings.most_likely_seed}</td>
                        </tr>
                      )}
                      {(team as any).haslametrics?.seed && (
                        <tr className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900 text-sm">Haslametrics</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold geist-mono">{(team as any).haslametrics.seed}</td>
                        </tr>
                      )}
                      {(team as any).evanmiya?.miya_resume_category && (
                        <tr>
                          <td className="py-3 px-4 text-gray-900 text-sm">Evan Miyakawa</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold geist-mono">{(team as any).evanmiya.miya_resume_category}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
