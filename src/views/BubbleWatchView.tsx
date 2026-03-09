import React, { useMemo } from 'react';
import type { Team, OddsMovers as OddsMoversType, TeamSchedule } from '@/types/team';
import { TournamentDashboard } from '@/components/TournamentDashboard';
import { OddsMovers } from '@/components/OddsMovers';
import { BubbleSidebar } from '@/components/BubbleSidebar';
import { BubbleGames } from '@/components/BubbleGames';
import { calculateBracket } from '@/lib/bracketProjection';

type BubbleWatchViewProps = {
  teams: Team[];
  oddsMovers?: OddsMoversType;
  allSchedules: Record<string, TeamSchedule>;
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime?: (t: number | string) => string;
};

export function BubbleWatchView({ 
  teams, 
  oddsMovers, 
  allSchedules,
  onTeamSelect,
  lastUpdated,
  formatRelativeTime
}: BubbleWatchViewProps) {
  // Calculate bracket projection for sidebar data
  const {
    lastFourInList,
    lastFourByesList,
    bubbleTeams,
    teamSeedMap
  } = useMemo(() => calculateBracket(teams), [teams]);

  return (
    <div className="min-h-screen">
      {/* Header */}
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
              Bubble Watch
            </h1>
            <p className="text-gray-600 text-lg">
              Updated projections and critical upcoming games for teams chasing at-large bids
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pb-12">
          <div className="space-y-12 lg:space-y-16">
            {/* Tournament Dashboard */}
            <div>
              <TournamentDashboard teams={teams} onTeamSelect={onTeamSelect} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            <div className='col-span-1 md:col-span-8'>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 ibm-plex-sans">
                Bracket projection
                </h2>
                <p className="text-gray-600 mb-6 text-sm">Which bubble teams are currently in the field?</p>
                <BubbleSidebar
                lastFourByesList={lastFourByesList}
                lastFourInList={lastFourInList}
                firstFourOut={bubbleTeams.slice(0, 4)}
                nextFourOut={bubbleTeams.slice(4, 8)}
                onTeamSelect={onTeamSelect}
                variant="list"
                teamSeedMap={teamSeedMap}
                />
                
                <a href="/bracket" className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer mt-4 inline-block">
                    Full projected bracket »
                </a>            
            
            </div>
            {/* Bubble Games Today */}
            <div className='col-span-1 md:col-span-4'>
              <BubbleGames 
                teams={teams} 
                allSchedules={allSchedules}
                onTeamSelect={onTeamSelect}
              />
            </div>

            </div>

            
          </div>

          <div className="py-12 lg:py-16max-w-screen-xl mx-auto">
            <OddsMovers moversData={oddsMovers} onTeamSelect={onTeamSelect} />
          </div>

      </div>
    </div>
  );
}
