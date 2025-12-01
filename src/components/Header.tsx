import React, { useState } from 'react';
import type { Team } from '@/types/team';

type HeaderProps = {
  onHome: () => void;
  teams: Team[];
  onTeamSelect: (slug: string) => void;
};

export function Header({ onHome, teams = [], onTeamSelect }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-black text-white py-3 px-6 flex items-center justify-between">
        <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M13.45 11.55l2.05 -2.05"></path>
            <path d="M6.4 20a9 9 0 1 1 11.2 0z"></path>
          </svg>
          <span className="font-medium geist-mono text-sm tracking-wide">tourneyodds<span className="font-normal">.info</span></span>
        </button>
        <button onClick={() => setMenuOpen(true)} className="hover:opacity-80 transition-opacity">
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Select a team</h2>
              <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-gray-900">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              {teams.map((team) => (
                <button
                  key={team.id ?? team.slug}
                  onClick={() => {
                    onTeamSelect(team.slug);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
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
