import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { LandingView } from '@/views/LandingView';
import { TeamView } from '@/views/TeamView';
import { formatRelativeTime, calculateTournamentOdds } from '@/lib/utils';
import type { Team } from '@/types/team';

function App() {
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | string | null>(null);
  const [landingGauge, setLandingGauge] = useState(0);
  const [allSchedules, setAllSchedules] = useState<Record<string, any>>({});

  useEffect(() => {
    const target = Math.floor(Math.random() * 100);
    const t = setTimeout(() => setLandingGauge(target), 300);
    return () => clearTimeout(t);
  }, []);

  const shuffledTeams = useMemo(() => {
    if (allTeams.length === 0) return [] as Team[];
    const shuffled = [...allTeams].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 100);
  }, [allTeams]);

  // Google Analytics SPA page_view tracking helper
  const trackPageView = (path: string) => {
    try {
      // @ts-ignore: gtag is injected via index.html
      if (typeof gtag === 'function') {
        // Set current page
        // @ts-ignore
        gtag('config', 'G-C80JTF63MK', {
          page_path: path,
        });
        // Explicit page_view event for robustness
        // @ts-ignore
        gtag('event', 'page_view', {
          page_path: path,
        });
      }
    } catch (e) {
      // no-op
    }
  };

  useEffect(() => {
    loadData();

    const path = window.location.pathname;
    const slugs = path.split('/').filter((s) => s);

    if (slugs.length > 0) {
      setSelectedSlugs(slugs);
    }

    // Track initial page load
    trackPageView(window.location.pathname + window.location.search + window.location.hash);

    // Handle back/forward navigation
    const onPopState = () => {
      const currentPath = window.location.pathname;
      const newSlugs = currentPath.split('/').filter((s) => s);
      setSelectedSlugs(newSlugs);
      trackPageView(currentPath + window.location.search + window.location.hash);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Dynamic document title and meta description
  useEffect(() => {
    const isLanding = selectedSlugs.length === 0;
    if (isLanding) {
      document.title = 'NCAA Tournament Odds';
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute(
          'content',
          "NCAA men's basketball tournament selection odds and current team-sheet metrics for all 360+ Division I teams."
        );
      }
      return;
    }

    const team = allTeams.find((t) => t.slug === selectedSlugs[0]);
    if (team) {
      const title = `${team.displayName} — NCAA Tournament Odds`;
      document.title = title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        const descParts = [
          `${team.displayName} current team-sheet rankings:`,
          team.net ? `NET ${team.net}` : null,
          team.kenpom ? `KenPom ${team.kenpom}` : null,
          team.torvik ? `Torvik ${team.torvik}` : null,
          team.bpi ? `BPI ${team.bpi}` : null,
          team.kpi ? `KPI ${team.kpi}` : null,
        ].filter(Boolean);
        meta.setAttribute('content', descParts.join(' · '));
      }
    }
  }, [selectedSlugs, allTeams]);

  const loadData = async () => {
    try {
      const [rankingsResponse, schedulesResponse] = await Promise.all([
        fetch('all_teams_rankings.json'),
        fetch('all_teams_schedules.json')
      ]);
      
      const rankingsData = await rankingsResponse.json();
      const schedulesData = await schedulesResponse.json();

      const teamsMap: Record<string, Team> = {};

      rankingsData.teams.forEach((team: any) => {
        teamsMap[team.slug] = {
          slug: team.slug,
          id: team.slug,
          displayName: team.displayName,
          shortName: team.shortName,
          logo: team.logo,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
          bpi: team.bpi,
          sor: team.sor,
          kpi: team.kpi,
          kenpom: team.kenpomRank,
          torvik: team.torvikRank,
          wab: team.wab,
          net: team.net,
          record: team.record,
          conference: team.conference,
          home: team.home,
          road: team.road,
          neutral: team.neutral,
          previous: team.previous,
          nonDiv1: team.nonDiv1,
          quad1: team.quad1,
          quad2: team.quad2,
          quad3: team.quad3,
          quad4: team.quad4,
          nextGame: team.nextGame,
        } as Team;
      });
      const teams = Object.values(teamsMap).sort((a, b) => a.displayName.localeCompare(b.displayName));

      setAllTeams(teams);
      setAllSchedules(schedulesData.teams || {});
      setLastUpdated(rankingsData.lastUpdated);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    setSelectedSlugs([]);
    window.scrollTo(0, 0);
    trackPageView('/');
  };

  const handleTeamSelect = (slug: string) => {
    if (slug) {
      const newPath = `/${slug}`;
      window.history.pushState({}, '', newPath);
      setSelectedSlugs([slug]);
      window.scrollTo(0, 0);
      trackPageView(newPath);
    }
  };

  const getTeamBySlug = (slug: string) => {
    return allTeams.find((t) => t.slug === slug);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const isLanding = selectedSlugs.length === 0;

  const selectedTeams = selectedSlugs.map((slug) => getTeamBySlug(slug)).filter(Boolean) as Team[];

  return (
    <div className="min-h-screen bg-white">
      <Layout onHome={goHome} teams={allTeams} selectedSlug={selectedSlugs[0] || ''} onTeamSelect={handleTeamSelect}>
        {isLanding ? (
          <LandingView
            teams={allTeams}
            selectedSlug={selectedSlugs[0] || ''}
            onTeamSelect={handleTeamSelect}
            lastUpdated={lastUpdated}
            formatRelativeTime={formatRelativeTime}
            landingGauge={landingGauge}
            shuffledTeams={shuffledTeams}
          />
        ) : (
          <div className="space-y-0">
            {selectedTeams.map((team) => (
              <TeamView
                key={team.id}
                team={team}
                schedule={allSchedules[team.slug]}
                lastUpdated={lastUpdated}
                formatRelativeTime={formatRelativeTime}
                calculateTournamentOdds={calculateTournamentOdds}
              />
            ))}
          </div>
        )}
      </Layout>
    </div>
  );
}

export default App;
