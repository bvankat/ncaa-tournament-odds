import React from 'react';
import { Combobox } from '@/components/ui/combobox';
import type { Team } from '@/types/team';

type FooterProps = {
  onHome: () => void;
  teams?: Team[];
  selectedSlug?: string;
  onTeamSelect?: (slug: string) => void;
  onOpenPalette?: () => void;
  onAllTeams?: () => void;
};

export function Footer({ onHome, teams = [], selectedSlug = '', onTeamSelect, onOpenPalette, onAllTeams }: FooterProps) {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Column 1: Logo & Title */}
        <div className='mb-4'>
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
            <span className="font-medium geist-mono text-md tracking-wide">
              tourneyodds<span className="font-normal">.info</span>
            </span>
          </button>
          <p className="text-sm leading-relaxed text-gray-400">
            NCAA men's basketball tournament selection odds and current team-sheet metrics for all 360+ Division I teams. Updated daily.
          </p>
        </div>
        {/* Column 2: Meta Description */}
        <div>
          
        </div>
        {/* Column 3: Team Selector */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase geist-mono tracking-wider text-gray-400">Select a team</h3>
            <p
              className="inline-flex items-center gap-2 text-xs font-medium transition-colors"
            >
              <span className="opacity-80 hidden lg:inline-flex">Team search</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-white/10 text-[10px] geist-mono">⌘K</span>
            </p>
          </div>
          <Combobox
            teams={teams}
            value={selectedSlug}
            onValueChange={(val: string) => onTeamSelect && onTeamSelect(val)}
            placeholder="Select a team"
            onAllTeams={onAllTeams}
          />
        </div>
      </div>
      <div className="border-t border-white/10 px-8 py-4 text-center">
          <p className="text-xs text-gray-500 flex flex-row justify-center items-center gap-2">
            {' '}
            <a href="https://benvankat.com" target="_blank" rel="noopener noreferrer" className="flex items-center underline hover:text-gray-300">
              <img src="https://benvankat.com/images/ben-vankat-headshot-2022-square.jpg" className="rounded-full w-6 h-6 mr-2" alt="Ben Vankat" />
              Created by Ben Vankat 
            </a> &bull; <a href="https://x.com/bvankat" target="_blank" rel="noopener noreferrer" className="text-gray-600 underline hover:text-gray-300">Contact</a>
          </p>
      </div>
    </footer>
  );
}
