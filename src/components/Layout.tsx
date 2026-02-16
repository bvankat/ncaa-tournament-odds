import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CommandPalette } from '@/components/CommandPalette';
import type { Team } from '@/types/team';

type LayoutProps = {
  children: React.ReactNode;
  onHome: () => void;
  onAllTeams?: () => void;
  onConferences?: () => void;
  onBracket?: () => void;
  onBubbleWatch?: () => void;
  onCompareResumes?: () => void;
  teams: Team[];
  selectedSlug?: string;
  onTeamSelect: (slug: string) => void;
};

export function Layout({ children, onHome, onAllTeams, onConferences, onBracket, onBubbleWatch, onCompareResumes, teams, selectedSlug = '', onTeamSelect }: LayoutProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <Header onHome={onHome} teams={teams} onTeamSelect={onTeamSelect} onOpenPalette={() => setPaletteOpen(true)} onAllTeams={onAllTeams} onConferences={onConferences} onBracket={onBracket} onBubbleWatch={onBubbleWatch} onCompareResumes={onCompareResumes} />
      {children}
      <Footer onHome={onHome} teams={teams} selectedSlug={selectedSlug} onTeamSelect={onTeamSelect} onOpenPalette={() => setPaletteOpen(true)} onAllTeams={onAllTeams} onConferences={onConferences} onBracket={onBracket} onBubbleWatch={onBubbleWatch} onCompareResumes={onCompareResumes} />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        teams={teams}
        onSelectTeam={onTeamSelect}
        onHome={() => {
          onHome();
          setPaletteOpen(false);
        }}
        onAllTeams={() => {
          onAllTeams?.();
          setPaletteOpen(false);
        }}
        onConferences={() => {
          onConferences?.();
          setPaletteOpen(false);
        }}
        onBracket={() => {
          onBracket?.();
          setPaletteOpen(false);
        }}
        onBubbleWatch={() => {
          onBubbleWatch?.();
          setPaletteOpen(false);
        }}
        onCompareResumes={() => {
          onCompareResumes?.();
          setPaletteOpen(false);
        }}
      />
    </>
  );
}
