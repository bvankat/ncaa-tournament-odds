import React from 'react';
import { Speedometer } from '@/components/Speedometer';
import { RankingSparkline } from '@/components/RankingSparkline';
import type { Team } from '@/types/team';

type TeamViewProps = {
  team: Team;
  lastUpdated?: number | string | null;
  formatRelativeTime: (t: number | string) => string;
  calculateTournamentOdds: (rankings: Record<string, number | string | undefined>) => number;
};

export function TeamView({ team, lastUpdated, formatRelativeTime, calculateTournamentOdds }: TeamViewProps) {
  const primaryColor = team.primaryColor ? `#${team.primaryColor}` : '#000000';
  const secondaryColor = team.secondaryColor ? `#${team.secondaryColor}` : '#ffffff';
  const tournamentOdds = calculateTournamentOdds(team as unknown as Record<string, number | string>);

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
        <div className="max-w-screen-xl mx-auto px-2 py-8 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-3 lg:px-12">
            <div className="flex flex-col justify-center gap-4 text-center lg:text-left items-center lg:items-start">
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
                <h1 className="text-3xl lg:text-5xl px-6 lg:px-0 font-extrabold mb-0 lg:mb-4 text-balance text-white">
                  {team.displayName} <span className="font-normal">NCAA Tournament Odds</span>
                </h1>
                <p className="hidden lg:block text-md lg:text-md opacity-90 text-balance font-normal text-gray-200">
                  NCAA Tournament chances for {team.shortName} based on its current team-sheet ranks
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Speedometer value={tournamentOdds} />
            </div>
          </div>
        </div>
      </div>

      <div id="ratings" className="bg-white px-6 py-6 lg:px-12 lg:py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-8 gap-12">
          <div className="lg:col-span-5">
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
                  <td className="py-3 pl-4 text-right text-gray-700 geist-mono">{team.net || '—'}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">BPI</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.bpi} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right text-gray-700 geist-mono">{team.bpi || '—'}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">SOR</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.sor} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right text-gray-700 geist-mono">{team.sor || '—'}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">KPI</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.kpi} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right text-gray-700 geist-mono">{team.kpi || '—'}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">KenPom</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.kenpom} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right text-gray-700 geist-mono">{team.kenpom || '—'}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">Torvik</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.torvik} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right text-gray-700 geist-mono">{team.torvik || '—'}</td>
                </tr>
                <tr className="">
                  <td className="py-3 pr-4 text-gray-900 font-semibold">WAB</td>
                  <td className="py-3 px-4 flex justify-center"><RankingSparkline rank={team.wab} color={primaryColor} /></td>
                  <td className="py-3 pl-4 text-right text-gray-700 geist-mono">{team.wab || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="lg:col-span-3 lg:col-start-6">

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-xs geist-mono text-gray-400 uppercase mb-1">RECORD</h3>
              <div className="">
                {team.record && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{team.record}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-xs geist-mono text-gray-400 uppercase mb-1">NEXT GAME</h3>
              {team.nextGame ? (
                <div className="grid grid-cols-1 gap-2 align-middle items-center justify-between mt-2">
                    <p className="text-md leading-4 items-center flex flex-row gap-2 font-medium text-gray-900 mt-1" id="nextGame-teams">
                        <img src={`${team.nextGame.away_team_logo}`} alt={`${team.nextGame.away_team} logo`} className="inline-block w-6 h-6" /> <strong>{team.nextGame.away_team}</strong> at <img src={`${team.nextGame.home_team_logo}`} alt={`${team.nextGame.home_team} logo`} className="inline-block w-6 h-6" />  <strong>{team.nextGame.home_team}</strong>
                    </p>
                    <p className="text-xs text-gray-500 font-normal geist-mono" id="nextGame-details">{team.nextGame.date_time}</p>
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
          <div className="max-w-7xl mx-auto px-6 py-12 lg:px-12 lg:py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Details</h2>

        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">

          <div className="lg:col-span-5 border border-gray-200 p-8">
            <table className="w-full">
             <tr className="text-gray-500 text-center">[ Full schedule coming soon ] </tr>
            </table>
          </div>

            <div className="lg:col-span-2 lg:col-start-7">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-md font-semibold mb-4">Record</h3>
              <div className="grid grid-rows-2 grid-cols-2 gap-4">
                {team.record && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">OVERALL</div>
                    <div className="text-2xl font-semibold text-gray-900">{team.record}</div>
                  </div>
                )}
                {team.home && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">HOME</div>
                    <div className="text-2xl font-semibold text-gray-900">{team.home}</div>
                  </div>
                )}
                {team.road && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">AWAY</div>
                    <div className="text-2xl font-semibold text-gray-900">{team.road}</div>
                  </div>
                )}
                {team.neutral && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">NEUTRAL</div>
                    <div className="text-2xl font-semibold text-gray-900">{team.neutral}</div>
                  </div>
                )}
              </div>
            </div>

            {(team.quad1 || team.quad2 || team.quad3 || team.quad4) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-00  mb-4">Quadrant Records</h3>
                <div className="grid grid-rows-2 grid-cols-2 gap-4">
                  {team.quad1 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1 geist-mono">QUAD 1</div>
                      <div className="text-2xl font-bold">{team.quad1}</div>
                    </div>
                  )}
                  {team.quad2 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1 geist-mono">QUAD 2</div>
                      <div className="text-2xl font-bold text-gray-700">{team.quad2}</div>
                    </div>
                  )}
                  {team.quad3 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1 geist-mono">QUAD 3</div>
                      <div className="text-2xl font-bold text-gray-700">{team.quad3}</div>
                    </div>
                  )}
                  {team.quad4 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1 geist-mono">QUAD 4</div>
                      <div className="text-2xl font-bold text-gray-700">{team.quad4}</div>
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
    </div>
  );
}
