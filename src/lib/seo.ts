// Page title/description/URL for every route. Pure and free of `@/` imports so
// both the build (vite.config.js prerender) and the client router can use it.

const BASE_URL = 'https://www.tourneyodds.info';
const SITE_NAME = 'NCAA Basketball Tournament Odds Machine';

export type SeoSiteConfig = {
  season: string;
  phase: string;
  sources: Record<string, boolean>;
  sections: Record<string, string>;
};

export type SeoTeam = {
  slug: string;
  displayName: string;
  conference?: string | null;
  record?: string | null;
  tournamentOdds?: number | null;
  net?: number | string | null;
  kenpomRank?: number | string | null;
  torvikRank?: number | string | null;
  bpi?: number | string | null;
  sor?: number | string | null;
  kpi?: number | string | null;
  wab?: number | string | null;
};

export type PageMeta = { title: string; description: string; url: string };

const RATINGS: { source: string; label: string; value: (t: SeoTeam) => unknown }[] = [
  { source: 'net', label: 'NET', value: t => t.net },
  { source: 'kenpom', label: 'KenPom', value: t => t.kenpomRank },
  { source: 'torvik', label: 'Torvik', value: t => t.torvikRank },
  { source: 'bpi', label: 'BPI', value: t => t.bpi },
  { source: 'sor', label: 'SOR', value: t => t.sor },
  { source: 'kpi', label: 'KPI', value: t => t.kpi },
  { source: 'wab', label: 'WAB', value: t => t.wab },
];

function teamMeta(team: SeoTeam, config: SeoSiteConfig): PageMeta {
  const ratings = RATINGS
    .filter(r => config.sources[r.source] && r.value(team) != null && r.value(team) !== '')
    .map(r => `${r.label} ${r.value(team)}`)
    .join(' | ');

  const context = [config.sources.records ? team.record : null, team.conference]
    .filter(Boolean)
    .join(', ');
  const name = context ? `${team.displayName} (${context})` : team.displayName;

  const hasOdds = team.tournamentOdds != null && config.sections['team.odds'] === 'on';

  let description: string;
  if (hasOdds) {
    description = `${name}: ${team.tournamentOdds!.toFixed(1)}% chance at an at-large NCAA Tournament bid.${ratings ? ` ${ratings}` : ''}`;
  } else if (config.phase === 'preseason') {
    description = `${team.displayName} ${config.season} preseason ratings${ratings ? `: ${ratings}` : ''}. NCAA Tournament odds and the remaining team-sheet metrics are coming soon.`;
  } else {
    description = `${name} NCAA Tournament odds and ratings${ratings ? `: ${ratings}` : ''}. Updated daily.`;
  }

  return {
    title: `${team.displayName} NCAA Tournament Odds - tourneyodds.info`,
    description,
    url: `${BASE_URL}/${team.slug}`,
  };
}

export function getPageMeta(route: string, teams: SeoTeam[], config: SeoSiteConfig): PageMeta {
  const preseason = config.phase === 'preseason';
  const sectionOn = (id: string) => config.sections[id] === 'on';

  switch (route) {
    case '/':
      return {
        title: SITE_NAME,
        description: preseason
          ? `${config.season} preseason ratings for all 360+ Division I teams. Bubble chances and projected seeds arrive as the season's ratings are released.`
          : 'Latest rankings, bubble chances and projected seeds for all 360+ Division I teams. Updated daily.',
        url: BASE_URL,
      };
    case '/latest-rankings':
      return {
        title: `Latest Rankings — ${SITE_NAME}`,
        description: preseason
          ? `${config.season} preseason ratings for all 360+ Division I basketball teams; tournament odds and team-sheet metrics are added as they are released.`
          : 'View tournament odds and team-sheet metrics for all 360+ Division I basketball teams.',
        url: `${BASE_URL}/latest-rankings`,
      };
    case '/bracket':
      return {
        title: `Projected Bracket — ${SITE_NAME}`,
        description: sectionOn('bracket.table')
          ? 'Tournament seed projections based on current team-sheet metrics'
          : 'Projected NCAA Tournament bracket — coming soon as team-sheet metrics are released this season.',
        url: `${BASE_URL}/bracket`,
      };
    case '/bubble-watch':
      return {
        title: `Bubble Watch — ${SITE_NAME}`,
        description: sectionOn('bubble.dashboard')
          ? 'Updated projections and critical upcoming games for teams chasing at-large bids'
          : 'Bubble Watch — coming soon as team-sheet metrics are released this season.',
        url: `${BASE_URL}/bubble-watch`,
      };
    case '/conferences':
      return {
        title: `Conference Breakdown — ${SITE_NAME}`,
        description: sectionOn('conf.standings')
          ? 'Updated tournament projections and current standings for all 32 Division I conferences.'
          : `Every Division I conference for ${config.season}. Standings and bid projections are coming soon.`,
        url: `${BASE_URL}/conferences`,
      };
    case '/compare-resumes':
      return {
        title: `Compare Resumes — ${SITE_NAME}`,
        description: 'Side-by-side team resumes. Compare rankings, metrics, quadrant records, and tournament odds for up to 8 teams.',
        url: `${BASE_URL}/compare-resumes`,
      };
  }

  const team = teams.find(t => t.slug === route.replace(/^\//, ''));
  if (team) return teamMeta(team, config);

  return {
    title: SITE_NAME,
    description: preseason
      ? `${config.season} preseason ratings for all 360+ Division I teams.`
      : 'Latest rankings, bubble chances and projected seeds for all 360+ Division I teams. Updated daily.',
    url: BASE_URL + route,
  };
}
