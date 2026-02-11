import React, { useState } from 'react';
import type { Team } from '@/types/team';

type HeaderProps = {
  onHome: () => void;
  teams: Team[];
  onTeamSelect: (slug: string) => void;
  onOpenPalette?: () => void;
  onAllTeams?: () => void;
  onConferences?: () => void;
  onBracket?: () => void;
};

export function Header({ onHome, teams = [], onTeamSelect, onOpenPalette, onAllTeams, onConferences, onBracket }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-black text-white py-3 px-6 flex items-center justify-between">
        <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <svg id="gauge" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M13.45 11.55l2.05 -2.05"></path>
            <path d="M6.4 20a9 9 0 1 1 11.2 0z"></path>
          </svg>
          <span className="font-medium geist-mono text-sm tracking-wide">tourneyodds<span className="font-normal">.info</span></span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPalette && onOpenPalette()}
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/15 text-xs font-medium transition-colors cursor-pointer"
            title="Open command palette (⌘K)"
          >
            <span className="opacity-80">Team search</span>
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-white/10 text-[10px] geist-mono">⌘K</span>
          </button>
          <button onClick={() => setMenuOpen(true)} className="hover:opacity-80 transition-opacity cursor-pointer">
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white p-6 flex items-center justify-end border-b border-gray-100">
              <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-gray-900 cursor-pointer">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-2xl font-bold text-gray-900 ibm-plex-sans mb-4">Links</p>
              <button
                onClick={() => {
                  onHome();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors text-left cursor-pointer font-semibold"
              >
                <span className="w-8 h-8 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </span>
                <span className="font-normal text-gray-600"><a href="/">Home</a></span>
              </button>
              {onBracket && (
                <button
                onClick={() => {
                  onBracket();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors text-left cursor-pointer font-semibold"
                >
                  <span className="w-8 h-8 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 30 24" strokeWidth="3" strokeLinecap="round">
                      <line x1="2" y1="3" x2="14" y2="3"/>
                      <line x1="2" y1="21" x2="14" y2="21"/>
                      <line x1="28" y1="12" x2="14.5" y2="12"/>
                      <line x1="14" y1="3" x2="14" y2="21"/>
                    </svg>
                  </span>
                  <span className="font-normal text-gray-600"><a href="/bracket">Projected bracket</a></span>
                </button>
              )}
              {onConferences && (
                <button
                onClick={() => {
                  onConferences();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors text-left cursor-pointer font-semibold"
                >
                  <span className="w-8 h-8 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </span>
                  <span className="font-normal text-gray-600"><a href="/conferences">Conference breakdown</a></span>
                </button>
              )}
              {onAllTeams && (
                <button
                onClick={() => {
                  onAllTeams();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors text-left cursor-pointer font-semibold mb-6"
                >
                  <span className="w-8 h-8 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-200" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                  </span>
                  <span className="font-normal text-gray-600"><a href="/all-teams">Full teams list</a></span>
                </button>
              )}
              <p className="text-2xl font-bold text-gray-900 ibm-plex-sans mb-2">Select a team</p>
              {teams.map((team) => (
                <button
                  key={team.id ?? team.slug}
                  onClick={() => {
                    onTeamSelect(team.slug);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <img src={team.logo ?? ''} alt={team.shortName} className="w-8 h-8 object-contain" />
                  <span className="text-gray-900 font-medium">{team.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
