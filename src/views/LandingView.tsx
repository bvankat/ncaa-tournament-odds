import React from 'react';
import { Combobox } from '@/components/ui/combobox';
import { Speedometer } from '@/components/Speedometer';
import type { Team } from '@/types/team';

type LandingViewProps = {
  teams?: Team[];
  selectedSlug?: string;
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime: (t: number | string) => string;
  landingGauge: number;
  shuffledTeams?: Team[];
};

export function LandingView({
  teams = [],
  selectedSlug = '',
  onTeamSelect,
  lastUpdated,
  formatRelativeTime,
  landingGauge,
  shuffledTeams = [],
}: LandingViewProps) {
  return (
    <div className="max-w-screen bg-gray-100 mx-auto py-16 lg:py-24 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:px-16 xl:px-48 mb-24">
        <div className="flex flex-col px-4 justify-center gap-6 items-center lg:items-start text-center lg:text-left">
          {lastUpdated && (
            <div id="updates-pill" className="inline-flex items-center w-fit px-4 py-2 shadow-sm bg-white/40 rounded-full border border-white/15 mb-2">
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
          <div className="flex flex-col mb-6 px-4">
            <h1 className="text-center lg:text-left text-4xl lg:text-5xl font-bold mb-4 text-balance">NCAA Men's Basketball Tournament Odds</h1>
            <p className="text-center lg:text-left text-lg lg:text-xl opacity-70 text-balance">Select any team to view updated rankings and current chances for making the NCAA tournament.</p>
          </div>
          <div className="w-full max-w-xl">
          <Combobox teams={teams} value={selectedSlug} onValueChange={onTeamSelect} placeholder="Select a team..." />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Speedometer value={landingGauge} />
        </div>
      </div>

      <div id="logo-scroller" className="mt-16 overflow-hidden" style={{ perspective: '1000px' }}>
        <div className="logo-row logo-row-1 flex gap-8 mb-8">
          {shuffledTeams.slice(0, 25).concat(shuffledTeams.slice(0, 25)).map((team, idx) => (
            <button key={`row1-${idx}`} className="logo-item flex-shrink-0 cursor-pointer" onClick={() => onTeamSelect(team.slug)} title={team.displayName}>
              <img src={team.logo ?? ''} alt={team.shortName} className="w-16 h-16 object-contain" />
            </button>
          ))}
        </div>
        <div className="logo-row logo-row-2 flex gap-8 mb-8">
          {shuffledTeams.slice(25, 50).concat(shuffledTeams.slice(25, 50)).map((team, idx) => (
            <button key={`row2-${idx}`} className="logo-item flex-shrink-0 cursor-pointer" onClick={() => onTeamSelect(team.slug)} title={team.displayName}>
              <img src={team.logo ?? ''} alt={team.shortName} className="w-16 h-16 object-contain" />
            </button>
          ))}
        </div>
        <div className="logo-row logo-row-3 flex gap-8 mb-8">
          {shuffledTeams.slice(50, 75).concat(shuffledTeams.slice(50, 75)).map((team, idx) => (
            <button key={`row3-${idx}`} className="logo-item flex-shrink-0 cursor-pointer" onClick={() => onTeamSelect(team.slug)} title={team.displayName}>
              <img src={team.logo ?? ''} alt={team.shortName} className="w-16 h-16 object-contain" />
            </button>
          ))}
        </div>
        <div className="logo-row logo-row-4 flex gap-8">
          {shuffledTeams.slice(75, 100).concat(shuffledTeams.slice(75, 100)).map((team, idx) => (
            <button key={`row4-${idx}`} className="logo-item flex-shrink-0 cursor-pointer" onClick={() => onTeamSelect(team.slug)} title={team.displayName}>
              <img src={team.logo ?? ''} alt={team.shortName} className="w-16 h-16 object-contain" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
