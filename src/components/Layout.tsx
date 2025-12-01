import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import type { Team } from '@/types/team';

type LayoutProps = {
  children: React.ReactNode;
  onHome: () => void;
  teams: Team[];
  selectedSlug?: string;
  onTeamSelect: (slug: string) => void;
};

export function Layout({ children, onHome, teams, selectedSlug = '', onTeamSelect }: LayoutProps) {
  return (
    <>
      <Header onHome={onHome} teams={teams} onTeamSelect={onTeamSelect} />
      {children}
      <Footer onHome={onHome} teams={teams} selectedSlug={selectedSlug} onTeamSelect={onTeamSelect} />
    </>
  );
}
