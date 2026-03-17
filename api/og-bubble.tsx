import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'nodejs' };

// ─── Minimal Team type ───────────────────────────────────────────────────────
interface Team {
  slug: string;
  espnId?: string;
  shortName: string;
  conference?: string;
  confStandingsPosition?: string;
  autoBid?: boolean;
  tournamentOdds?: number;
  logo?: string;
}

// ─── Thresholds (mirrored from src/lib/utils.ts) ─────────────────────────────
const THRESHOLDS = { LOCK: 90, SAFE: 70, BUBBLE: 15 };

function getConferenceLeaderSlugs(teams: Team[]): Set<string> {
  const confGroups: Record<string, Team[]> = {};
  teams.forEach(t => {
    const c = t.conference ?? 'Unknown';
    (confGroups[c] ??= []).push(t);
  });

  const leaders = new Set<string>();
  Object.values(confGroups).forEach(group => {
    const confirmed = group.find(t => t.autoBid === true);
    if (confirmed) { leaders.add(confirmed.slug); return; }
    const sorted = [...group].sort((a, b) => {
      const aPos = parseInt(a.confStandingsPosition?.match(/^\d+/)?.[0] ?? '999');
      const bPos = parseInt(b.confStandingsPosition?.match(/^\d+/)?.[0] ?? '999');
      return aPos - bPos;
    });
    if (sorted[0]) leaders.add(sorted[0].slug);
  });
  return leaders;
}

// ─── Font loader ─────────────────────────────────────────────────────────────
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Vercel Edge)' } }
    ).then(r => r.text());
    const fontUrl = css.match(/url\(([^)]+)\)/)?.[1];
    if (!fontUrl) return null;
    return fetch(fontUrl).then(r => r.arrayBuffer());
  } catch {
    return null;
  }
}

// ─── OG Image ────────────────────────────────────────────────────────────────
const MAX_PILLS = 12;

export default async function handler(_req: Request): Promise<Response> {
  const [fontData, data] = await Promise.all([
    loadFont(),
    fetch('https://www.tourneyodds.info/all_teams_rankings.json').then(r => r.json()).catch(() => ({ teams: [] })),
  ]);

  const teams: Team[] = data.teams ?? [];
  const leaderSlugs = getConferenceLeaderSlugs(teams);

  const safeTeams = teams
    .filter(t => (t.tournamentOdds ?? 0) > THRESHOLDS.SAFE && (t.tournamentOdds ?? 0) <= THRESHOLDS.LOCK && !leaderSlugs.has(t.slug))
    .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0))
    .slice(0, MAX_PILLS);

  const bubbleTeams = teams
    .filter(t => (t.tournamentOdds ?? 0) > THRESHOLDS.BUBBLE && (t.tournamentOdds ?? 0) <= THRESHOLDS.SAFE && !leaderSlugs.has(t.slug))
    .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0))
    .slice(0, MAX_PILLS);

  const fonts = fontData
    ? [{ name: 'IBM Plex Sans Condensed', data: fontData, weight: 700 as const, style: 'normal' as const }]
    : [];

  function Pill({ team, style }: { team: Team; style: { bg: string; border: string; text: string } }) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: 20,
          padding: '4px 9px 4px 4px',
          marginBottom: 0,
        }}
      >
        {team.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.logo}
            width={22}
            height={22}
            style={{ objectFit: 'contain' }}
            alt=""
          />
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: style.text, fontFamily: 'sans-serif' }}>
          {team.shortName}
        </span>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: 1200,
          height: 630,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* Blue gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: 'linear-gradient(to bottom, hsla(212, 72%, 59%, 0.14) 0%, rgba(255,255,255,0) 55%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 64px 40px',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Label */}
          <div
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: 10,
              display: 'flex',
            }}
          >
            tourneyodds.info
          </div>

          {/* Heading */}
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              fontFamily: fonts.length ? 'IBM Plex Sans Condensed' : 'sans-serif',
              color: '#111827',
              lineHeight: 1.1,
              marginBottom: 8,
              display: 'flex',
            }}
          >
            Bubble Watch
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 18,
              color: '#6b7280',
              marginBottom: 28,
              display: 'flex',
            }}
          >
            Updated projections for teams chasing at-large bids
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'flex', gap: 16, flex: 1 }}>

            {/* Safe for Now column */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: 14,
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#166534',
                  marginBottom: 4,
                  display: 'flex',
                }}
              >
                Safe for Now
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  fontFamily: fonts.length ? 'IBM Plex Sans Condensed' : 'sans-serif',
                  color: '#4ade80',
                  marginBottom: 12,
                  display: 'flex',
                }}
              >
                {safeTeams.length}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {safeTeams.map(team => (
                  <Pill
                    key={team.slug}
                    team={team}
                    style={{ bg: 'white', border: '#86efac', text: '#111827' }}
                  />
                ))}
              </div>
            </div>

            {/* Bubble column */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fefce8',
                border: '1.5px solid #fde047',
                borderRadius: 14,
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#854d0e',
                  marginBottom: 4,
                  display: 'flex',
                }}
              >
                Bubble
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  fontFamily: fonts.length ? 'IBM Plex Sans Condensed' : 'sans-serif',
                  color: '#ca8a04',
                  marginBottom: 12,
                  display: 'flex',
                }}
              >
                {bubbleTeams.length}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {bubbleTeams.map(team => (
                  <Pill
                    key={team.slug}
                    team={team}
                    style={{ bg: '#fefce8', border: '#fde047', text: '#111827' }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
