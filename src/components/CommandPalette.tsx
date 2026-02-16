// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import type { Team } from '@/types/team';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  teams: Team[];
  onSelectTeam: (slug: string) => void;
  onHome: () => void;
  onAllTeams: () => void;
  onConferences: () => void;
  onBracket: () => void;
  onBubbleWatch?: () => void;
  onCompareResumes?: () => void;
};

export function CommandPalette({ open, onOpenChange, teams, onSelectTeam, onHome, onAllTeams, onConferences, onBracket, onBubbleWatch, onCompareResumes }: CommandPaletteProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!open && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(true);
      } else if (open && e.key === 'Escape') {
        onOpenChange(false);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      // Focus the input automatically
      const el = containerRef.current?.querySelector<HTMLInputElement>('input');
      el?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        className="relative w-full max-w-xl mx-auto rounded-xl border border-gray-200 shadow-xl overflow-hidden bg-white"
        role="dialog"
        aria-modal="true"
        aria-label="Team Command Palette"
      >
        <Command
          filter={(value: string, search: string) => {
            const v = value.toLowerCase();
            const s = search.toLowerCase();
            return v.includes(s) ? 1 : 0;
          }}
        >
          <div className="px-3 pt-3">
            <CommandInput placeholder="Type a team name or 'home'..." className="h-10" />
          </div>
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No teams found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem
                value="Home"
                keywords={["home"]}
                onSelect={() => {
                  onHome();
                  onOpenChange(false);
                }}
              >
                <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </span>
                Home
              </CommandItem>
              <CommandItem
                value="Projected Bracket"
                keywords={["bracket", "seed", "seeding", "projection"]}
                onSelect={() => {
                  onBracket();
                  onOpenChange(false);
                }}
              >
                <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 30 24" strokeWidth="3" strokeLinecap="round">
                    <line x1="2" y1="3" x2="14" y2="3"/>
                    <line x1="2" y1="21" x2="14" y2="21"/>
                    <line x1="28" y1="12" x2="14.5" y2="12"/>
                    <line x1="14" y1="3" x2="14" y2="21"/>
                  </svg>
                </span>
                Projected bracket
              </CommandItem>
              {onBubbleWatch && (
                <CommandItem
                  value="Bubble Watch"
                  keywords={["bubble", "watch", "safe", "sweating"]}
                  onSelect={() => {
                    onBubbleWatch();
                    onOpenChange(false);
                  }}
                >
                  <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  Bubble watch
                </CommandItem>
              )}
              {onCompareResumes && (
                <CommandItem
                  value="Compare Resumes"
                  keywords={["compare", "resumes", "metrics", "quadrant", "comparison"]}
                  onSelect={() => {
                    onCompareResumes();
                    onOpenChange(false);
                  }}
                >
                  <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </span>
                  Compare resumes
                </CommandItem>
              )}
              <CommandItem
                value="Conference standings"
                keywords={["conferences", "conference", "standings"]}
                onSelect={() => {
                  onConferences();
                  onOpenChange(false);
                }}
              >
                <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </span>
                Conference breakdown
              </CommandItem>
              <CommandItem
                value="Full team list"
                keywords={["all teams", "all", "teams", "list"]}
                onSelect={() => {
                  onAllTeams();
                  onOpenChange(false);
                }}
              >
                <span className="mr-2 w-6 h-6 rounded-md bg-black inline-flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-200" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </span>
                Full teams list
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Teams">
              {teams.map(team => (
                <CommandItem
                  key={team.slug}
                  value={team.displayName}
                  keywords={[team.displayName, team.shortName]}
                  onSelect={() => {
                    onSelectTeam(team.slug);
                    onOpenChange(false);
                  }}
                >
                  <img
                    src={team.logo ?? ''}
                    alt={team.shortName}
                    className="mr-2 w-6 h-6 object-contain rounded-sm bg-white"
                  />
                  <span className="text-gray-900">{team.displayName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">Press Esc to close</span>
            <span className="text-[10px] tracking-wide font-medium text-gray-400 geist-mono">⌘K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
