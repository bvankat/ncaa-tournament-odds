import React from 'react';
import { Combobox } from '@/components/ui/combobox';
import type { Team } from '@/types/team';

type FooterProps = {
  onHome: () => void;
  teams?: Team[];
  selectedSlug?: string;
  onTeamSelect?: (slug: string) => void;
};

export function Footer({ onHome, teams = [], selectedSlug = '', onTeamSelect }: FooterProps) {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Column 1: Logo & Title */}
        <div>
          <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity mb-4">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
              <path d="M13.45 11.55l2.05 -2.05"></path>
              <path d="M6.4 20a9 9 0 1 1 11.2 0z"></path>
            </svg>
            <span className="font-medium geist-mono text-sm tracking-wide">
              tourneyodds<span className="font-normal">.info</span>
            </span>
          </button>
        </div>
        {/* Column 2: Meta Description */}
        <div>
          <p className="text-sm leading-relaxed text-gray-300">
            Real-time aggregated NCAA Division I men's basketball efficiency metrics and selection odds combining NET, KenPom, Torvik, BPI, KPI and Strength of Record data.
          </p>
        </div>
        {/* Column 3: Team Selector */}
        <div>
          <h3 className="text-xs uppercase geist-mono tracking-wider text-gray-400 mb-4">Select a team</h3>
          <Combobox
            teams={teams}
            value={selectedSlug}
            onValueChange={(val: string) => onTeamSelect && onTeamSelect(val)}
            placeholder="Search teams..."
          />
        </div>
      </div>
      <div className="border-t border-white/10 px-8 py-4 text-center">
        <p className="text-xs text-gray-500">
          Created by{' '}
          <a href="https://benvankat.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">
            Ben Vankat
          </a>
        </p>
      </div>
    </footer>
  );
}
