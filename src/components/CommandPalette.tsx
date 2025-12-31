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
};

export function CommandPalette({ open, onOpenChange, teams, onSelectTeam, onHome, onAllTeams }: CommandPaletteProps) {
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
                <span className="mr-2 w-6 h-6 inline-flex items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600">🏠</span>
                Home
              </CommandItem>
              <CommandItem
                value="Full team list"
                keywords={["all teams", "all", "teams", "list"]}
                onSelect={() => {
                  onAllTeams();
                  onOpenChange(false);
                }}
              >
                <span className="mr-2 w-6 h-6 inline-flex items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600">📊</span>
                Full team list
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
