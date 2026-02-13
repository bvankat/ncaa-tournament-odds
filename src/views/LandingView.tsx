import React from 'react';
import { Combobox } from '@/components/ui/combobox';
import { Speedometer } from '@/components/Speedometer';
import { PulseRings } from '@/components/PulseRings';
import { OddsMovers } from '@/components/OddsMovers';
import { TournamentDashboard } from '@/components/TournamentDashboard';
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
  onHome?: () => void;
  onAllTeams?: () => void;
  onConferences?: () => void;
  onBracket?: () => void;
  onBubbleWatch?: () => void;
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
  onHome,
  onAllTeams,
  onConferences,
  onBracket,
  onBubbleWatch,
}: LandingViewProps) {
  return (
    <div className="max-w-screen bg-gray-50 mx-auto pt-12 lg:pt-24 overflow-x-hidden relative" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' viewBox='0 0 800 450' opacity='0.12'%3E%3Cdefs%3E%3Cfilter id='bbblurry-filter' x='-100%25' y='-100%25' width='400%25' height='400%25' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='130' x='0%25' y='0%25' width='100%25' height='100%25' in='SourceGraphic' edgeMode='none' result='blur'%3E%3C/feGaussianBlur%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23bbblurry-filter)'%3E%3Cellipse rx='277.5' ry='63.5' cx='396.1211464621804' cy='-24.698486328125' fill='hsla(212, 72%, 59%, 1.00)'%3E%3C/ellipse%3E%3C/g%3E%3C/svg%3E"),url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='28' height='28' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='rgba(0,0,0,0)'/><path d='M3.25 10h13.5M10 3.25v13.5' transform='translate(4,0)' stroke-linecap='square' stroke-width='1' stroke='rgba(0,0,0,0.03)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
      backgroundRepeat: 'repeat, repeat',
      backgroundSize: 'cover, auto',
      backgroundPosition: 'center, 0 0'
      }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 lg:px-16 xl:px-24 mb-12">
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
          <div className="flex flex-col mb-3 px-4 lg:px-0">
            <h1 className="text-center md:text-left text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance ibm-plex-sans">NCAA Basketball Tournament Odds Machine</h1>
            <p className="text-center md:text-left text-lg lg:text-xl opacity-70 text-balance">Bubble chances and projected seeds for all 360+ Division I teams</p>
          </div>
          <div className="w-full max-w-xl">
          <Combobox teams={teams} value={selectedSlug} onValueChange={onTeamSelect} placeholder="Select a team" onHome={onHome} onAllTeams={onAllTeams} onConferences={onConferences} onBracket={onBracket} onBubbleWatch={onBubbleWatch} />

          </div>
        </div>

        <div className="flex items-center justify-center">
          <div style={{ position: 'relative', width: 340, height: 340 }}>
            <Speedometer value={landingGauge} />
          </div>
        </div>
      </div>


      <div id="logo-scroller" className="mt-16 pb-16 overflow-hidden" style={{ perspective: '1000px' }}>
        <div className="logo-row logo-row-1 flex gap-4 lg:gap-8 mb-6 lg:mb-8">
          {shuffledTeams.slice(0, 25).concat(shuffledTeams.slice(0, 25)).map((team, idx) => (
            <button key={`row1-${idx}`} className="logo-item flex-shrink-0 cursor-pointer" onClick={() => onTeamSelect(team.slug)} title={team.displayName}>
              <img src={team.logo ?? ''} alt={team.shortName} className="w-9 h-9 lg:w-16 lg:h-16 object-contain" />
            </button>
          ))}
        </div>
        <div className="logo-row logo-row-2 flex gap-4 lg:gap-8 mb-6 lg:mb-8">
          {shuffledTeams.slice(25, 50).concat(shuffledTeams.slice(25, 50)).map((team, idx) => (
            <button key={`row2-${idx}`} className="logo-item flex-shrink-0 cursor-pointer" onClick={() => onTeamSelect(team.slug)} title={team.displayName}>
              <img src={team.logo ?? ''} alt={team.shortName} className="w-9 h-9 lg:w-16 lg:h-16 object-contain" />
            </button>
          ))}
        </div>
        <div className="logo-row logo-row-3 flex gap-4 lg:gap-8">
          {shuffledTeams.slice(50, 75).concat(shuffledTeams.slice(50, 75)).map((team, idx) => (
            <button key={`row3-${idx}`} className="logo-item flex-shrink-0 cursor-pointer" onClick={() => onTeamSelect(team.slug)} title={team.displayName}>
              <img src={team.logo ?? ''} alt={team.shortName} className="w-9 h-9 lg:w-16 lg:h-16 object-contain" />
            </button>
          ))}
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="pb-20 px-4 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Stacked, Desktop: 2x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              

              {/* Card 1 */}
              <button onClick={onAllTeams} className="group p-4 w-full text-left cursor-pointer hover:bg-gray-50/50 rounded-lg transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-md bg-black group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-blue-200 group-hover:text-black transition-colors" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"></path>
                      </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 ibm-plex-sans">Latest rankings</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">NET, Kenpom, Torvik, BPI, SOR, KPI, WAB — all in one place</p>
                  </div>
                </div>
              </button>


              {/* Card 2 */}
              <button onClick={onBracket} className="group p-4 w-full text-left cursor-pointer hover:bg-gray-50/50 rounded-lg transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-md bg-black group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-blue-200 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 30 24" strokeWidth="3" strokeLinecap="round">
                      <line x1="2" y1="3" x2="14" y2="3"/>
                      <line x1="2" y1="21" x2="14" y2="21"/>
                      <line x1="28" y1="12" x2="14.5" y2="12"/>
                      <line x1="14" y1="3" x2="14" y2="21"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 ibm-plex-sans">Projected bracket</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Updated seed list and play-in games</p>
                  </div>
                </div>
              </button>

              {/* Card 3 */}
              <button onClick={onBubbleWatch} className="group p-4 w-full text-left cursor-pointer hover:bg-gray-50/50 rounded-lg transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-md bg-black group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-blue-200 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 ibm-plex-sans">Bubble watch</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Who's safe and who's sweating on Selection Sunday</p>
                  </div>
                </div>
              </button>

              {/* Card 4 */}
              <button onClick={onConferences} className="group p-4 w-full text-left cursor-pointer hover:bg-gray-50/50 rounded-lg transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-md bg-black group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-blue-200 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 ibm-plex-sans">Bid breakdowns</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Current status reports for all 31 conferences</p>
                  </div>
                </div>
              </button>



          </div>
        </div>
      </div>


      <div className="bg-white pt-12 lg:pt-16 pb-4 lg:pb-6">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 ibm-plex-sans">
            At A Glance
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
                Bracket status based on the latest metrics. <a onClick={onBracket} className="underline cursor-pointer">Full projected bracket »</a>
              </p>
          <TournamentDashboard teams={teams} onTeamSelect={onTeamSelect} />
          
          <div className="mt-4 flex gap-5 justify-start">
            <button onClick={onConferences} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer">
              Conference Breakdown »
            </button>
            
          </div>

        </div>

          <div className="py-12 lg:py-16 px-6 lg:px-12 max-w-screen-xl mx-auto">
      <OddsMovers moversData={oddsMovers} onTeamSelect={onTeamSelect} />
          </div>
      </div>
    </div>
  );
}
