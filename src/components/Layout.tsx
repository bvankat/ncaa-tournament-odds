import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CommandPalette } from '@/components/CommandPalette';
import type { Team } from '@/types/team';

type LayoutProps = {
  children: React.ReactNode;
  onHome: () => void;
  teams: Team[];
  selectedSlug?: string;
  onTeamSelect: (slug: string) => void;
};

export function Layout({ children, onHome, teams, selectedSlug = '', onTeamSelect }: LayoutProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <Header onHome={onHome} teams={teams} onTeamSelect={onTeamSelect} onOpenPalette={() => setPaletteOpen(true)} />
      {children}
      <Footer onHome={onHome} teams={teams} selectedSlug={selectedSlug} onTeamSelect={onTeamSelect} onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        teams={teams}
        onSelectTeam={onTeamSelect}
        onHome={() => {
          onHome();
          setPaletteOpen(false);
        }}
      />
    </>
  );
}
