import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { LandingView } from '@/views/LandingView';
import { TeamView } from '@/views/TeamView';
import { AllTeamsView } from '@/views/AllTeamsView';
import { ConferenceListView } from '@/views/ConferenceListView';
import { BracketView } from '@/views/BracketView';
import { BubbleWatchView } from '@/views/BubbleWatchView';
import { ResumeCompareView } from '@/views/ResumeCompareView';
import { formatRelativeTime } from '@/lib/utils';
import { applySourceFilter } from '@/lib/sourceFilter';
import { getPageMeta } from '@/lib/seo';
import { SEASON, PHASE, SOURCES, SECTIONS } from '@/lib/config';
import type { Team, OddsMovers } from '@/types/team';

function App() {
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() =>
    window.location.pathname.split('/').filter((s) => s)
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | string | null>(null);
  const [landingGauge, setLandingGauge] = useState(0);
  const [allSchedules, setAllSchedules] = useState<Record<string, any>>({});
  const [oddsMovers, setOddsMovers] = useState<OddsMovers | undefined>(undefined);

  useEffect(() => {
    const target = Math.floor(Math.random() * 100);
    const t = setTimeout(() => setLandingGauge(target), 300);
    return () => clearTimeout(t);
  }, []);

  const shuffledTeams = useMemo(() => {
    if (allTeams.length === 0) return [] as Team[];
    const shuffled = [...allTeams].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 75);
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

    // Handle back/forward navigation
    const onPopState = () => {
      setSelectedSlugs(window.location.pathname.split('/').filter((s) => s));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const routePath = '/' + selectedSlugs.join('/');

  // Client-side navigation keeps the prerendered <head>, so refresh it per route.
  // Skipped until data loads: the static HTML already has the right tags.
  useEffect(() => {
    if (allTeams.length === 0) return;
    const meta = getPageMeta(routePath, allTeams, { season: SEASON, phase: PHASE, sources: SOURCES, sections: SECTIONS });
    document.title = meta.title;
    const setContent = (selector: string, value: string) =>
      document.querySelector(selector)?.setAttribute('content', value);
    setContent('meta[name="description"]', meta.description);
    setContent('meta[property="og:title"]', meta.title);
    setContent('meta[property="og:description"]', meta.description);
    setContent('meta[property="og:url"]', meta.url);
    setContent('meta[name="twitter:title"]', meta.title);
    setContent('meta[name="twitter:description"]', meta.description);
    setContent('meta[property="twitter:url"]', meta.url);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.url);
  }, [routePath, allTeams]);

  // Declared after the meta effect so GA sees the updated document.title.
  useEffect(() => {
    trackPageView(window.location.pathname + window.location.search + window.location.hash);
  }, [routePath]);

  const loadData = async () => {
    try {
      const [rankingsResponse, schedulesResponse, moversResponse] = await Promise.all([
        fetch('all_teams_rankings.json'),
        fetch('all_teams_schedules.json'),
        fetch('odds_movers.json').catch(() => null) // Gracefully handle missing file
      ]);
      
      const rankingsData = await rankingsResponse.json();
      const schedulesData = await schedulesResponse.json();
      const moversData = moversResponse ? await moversResponse.json() : undefined;

      const teamsMap: Record<string, Team> = {};

      rankingsData.teams.forEach((team: any) => {
        // Null out fields from sources disabled in config/site-config.json so every
        // calculation downstream only sees the enabled sources.
        const filtered = applySourceFilter(team);
        teamsMap[team.slug] = {
          ...filtered, // Spread all team properties to preserve Nebraska-specific data
          id: team.slug,
          kenpom: filtered.kenpomRank,
          torvik: filtered.torvikRank,
        } as Team;
      });
      const teams = Object.values(teamsMap).sort((a, b) => a.displayName.localeCompare(b.displayName));

      setAllTeams(teams);
      setAllSchedules(schedulesData.teams || {});
      setLastUpdated(rankingsData.lastUpdated);
      setOddsMovers(moversData);
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
  };

  const goAllTeams = () => {
    const newPath = '/latest-rankings';
    window.history.pushState({}, '', newPath);
    setSelectedSlugs(['latest-rankings']);
    window.scrollTo(0, 0);
  };

  const goConferences = () => {
    const newPath = '/conferences';
    window.history.pushState({}, '', newPath);
    setSelectedSlugs(['conferences']);
    window.scrollTo(0, 0);
  };

  const goBracket = () => {
    const newPath = '/bracket';
    window.history.pushState({}, '', newPath);
    setSelectedSlugs(['bracket']);
    window.scrollTo(0, 0);
  };

  const goBubbleWatch = () => {
    const newPath = '/bubble-watch';
    window.history.pushState({}, '', newPath);
    setSelectedSlugs(['bubble-watch']);
    window.scrollTo(0, 0);
  };

  const goCompareResumes = () => {
    const newPath = '/compare-resumes';
    window.history.pushState({}, '', newPath);
    setSelectedSlugs(['compare-resumes']);
    window.scrollTo(0, 0);
  };

  const handleTeamSelect = (slug: string) => {
    if (slug) {
      const newPath = `/${slug}`;
      window.history.pushState({}, '', newPath);
      setSelectedSlugs([slug]);
      window.scrollTo(0, 0);
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
  const isAllTeamsPage = selectedSlugs.length === 1 && selectedSlugs[0] === 'latest-rankings';
  const isConferencesPage = selectedSlugs.length === 1 && selectedSlugs[0] === 'conferences';
  const isBracketPage = selectedSlugs.length === 1 && selectedSlugs[0] === 'bracket';
  const isBubbleWatchPage = selectedSlugs.length === 1 && selectedSlugs[0] === 'bubble-watch';
  const isCompareResumesPage = selectedSlugs.length === 1 && selectedSlugs[0] === 'compare-resumes';

  const selectedTeams = selectedSlugs
    .filter(slug => slug !== 'latest-rankings' && slug !== 'conferences' && slug !== 'bracket' && slug !== 'bubble-watch' && slug !== 'compare-resumes')
    .map((slug) => getTeamBySlug(slug))
    .filter(Boolean) as Team[];

  return (
    <div className="min-h-screen bg-white">
      <Layout onHome={goHome} onAllTeams={goAllTeams} onConferences={goConferences} onBracket={goBracket} onBubbleWatch={goBubbleWatch} onCompareResumes={goCompareResumes} teams={allTeams} selectedSlug={selectedSlugs[0] || ''} onTeamSelect={handleTeamSelect}>
        {isLanding ? (
          <LandingView
            teams={allTeams}
            selectedSlug={selectedSlugs[0] || ''}
            onTeamSelect={handleTeamSelect}
            lastUpdated={lastUpdated}
            formatRelativeTime={formatRelativeTime}
            landingGauge={landingGauge}
            shuffledTeams={shuffledTeams}
            oddsMovers={oddsMovers}
            onAllTeams={goAllTeams}
            onConferences={goConferences}
            onBracket={goBracket}
            onBubbleWatch={goBubbleWatch}
            onResumeCompare={goCompareResumes}
          />
        ) : isAllTeamsPage ? (
          <AllTeamsView
            teams={allTeams}
            onTeamSelect={handleTeamSelect}
            lastUpdated={lastUpdated}
            formatRelativeTime={formatRelativeTime}
          />
        ) : isConferencesPage ? (
          <ConferenceListView
            teams={allTeams}
            onTeamSelect={handleTeamSelect}
            lastUpdated={lastUpdated}
            formatRelativeTime={formatRelativeTime}
          />
        ) : isBracketPage ? (
          <BracketView
            teams={allTeams}
            onTeamSelect={handleTeamSelect}
            lastUpdated={lastUpdated}
            formatRelativeTime={formatRelativeTime}
          />
        ) : isBubbleWatchPage ? (
          <BubbleWatchView
            teams={allTeams}
            oddsMovers={oddsMovers}
            allSchedules={allSchedules}
            onTeamSelect={handleTeamSelect}
            lastUpdated={lastUpdated}
            formatRelativeTime={formatRelativeTime}
          />
        ) : isCompareResumesPage ? (
          <ResumeCompareView
            teams={allTeams}
            onTeamSelect={handleTeamSelect}
            lastUpdated={lastUpdated}
            formatRelativeTime={formatRelativeTime}
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
                allTeams={allTeams}
              />
            ))}
          </div>
        )}
      </Layout>
    </div>
  );
}

export default App;
