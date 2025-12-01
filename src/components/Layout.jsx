import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function Layout({ children, onHome, teams, selectedSlug = '', onTeamSelect }) {
  return (
    <>
      <Header onHome={onHome} teams={teams} onTeamSelect={onTeamSelect} />
      {children}
      <Footer onHome={onHome} teams={teams} selectedSlug={selectedSlug} onTeamSelect={onTeamSelect} />
    </>
  );
}
