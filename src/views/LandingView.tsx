import React from 'react';
import { Combobox } from '@/components/ui/combobox';
import { Speedometer } from '@/components/Speedometer';
import { OddsMovers } from '@/components/OddsMovers';
import type { Team, OddsMovers as OddsMoversType } from '@/types/team';

type LandingViewProps = {
  teams?: Team[];
  selectedSlug?: string;
  onTeamSelect: (slug: string) => void;
  lastUpdated?: number | string | null;
  formatRelativeTime: (t: number | string) => string;
  landingGauge: number;
  shuffledTeams?: Team[];
  oddsMovers?: OddsMoversType;
};

export function LandingView({
  teams = [],
  selectedSlug = '',
  onTeamSelect,
  lastUpdated,
  formatRelativeTime,
  landingGauge,
  shuffledTeams = [],
  oddsMovers,
}: LandingViewProps) {
  return (
    <div className="max-w-screen bg-gray-50 mx-auto py-12 lg:py-24 overflow-x-hidden relative" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' viewBox='0 0 800 450' opacity='0.12'%3E%3Cdefs%3E%3Cfilter id='bbblurry-filter' x='-100%25' y='-100%25' width='400%25' height='400%25' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='130' x='0%25' y='0%25' width='100%25' height='100%25' in='SourceGraphic' edgeMode='none' result='blur'%3E%3C/feGaussianBlur%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23bbblurry-filter)'%3E%3Cellipse rx='277.5' ry='63.5' cx='396.1211464621804' cy='-24.698486328125' fill='hsla(212, 72%, 59%, 1.00)'%3E%3C/ellipse%3E%3C/g%3E%3C/svg%3E"),url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='28' height='28' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='rgba(0,0,0,0)'/><path d='M3.25 10h13.5M10 3.25v13.5' transform='translate(4,0)' stroke-linecap='square' stroke-width='1' stroke='rgba(0,0,0,0.03)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
      backgroundRepeat: 'repeat, repeat',
      backgroundSize: 'cover, auto',
      backgroundPosition: 'center, 0 0'
      }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 lg:px-16 xl:px-24 mb-24">
        <div className="flex flex-col px-4 justify-center gap-6 items-center md:items-start text-center md:text-left">
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
          <div className="flex flex-col mb-6 px-4 lg:px-0">
            <h1 className="text-center md:text-left text-4xl lg:text-5xl font-extrabold mb-4 text-balance">NCAA Men's Basketball Tournament Odds</h1>
            <p className="text-center md:text-left text-lg lg:text-xl opacity-70 text-balance">Select any team to view updated rankings and current chances for making the NCAA tournament.</p>
          </div>
          <div className="w-full max-w-xl">
          <Combobox teams={teams} value={selectedSlug} onValueChange={onTeamSelect} placeholder="Select a team" />
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

      <OddsMovers moversData={oddsMovers} onTeamSelect={onTeamSelect} />
    </div>
  );
}
