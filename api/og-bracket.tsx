import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// ─── Minimal Team type ───────────────────────────────────────────────────────
interface Team {
  slug: string;
  espnId?: string;
  shortName: string;
  displayName: string;
  logo?: string;
  conference?: string;
  confStandingsPosition?: string;
  autoBid?: boolean;
  tournamentOdds?: number;
  wab?: number | string | null;
  kpi?: number | string | null;
  sor?: number | string | null;
  kenpom?: number | string | null;
  torvik?: number | string | null;
  bpi?: number | string | null;
  net?: number | string | null;
  quad1?: string;
  quad2?: string;
  quad3?: string;
  quad4?: string;
  road?: string;
  record?: string;
  nonconsos?: number | string | null;
}

// ─── Helpers (inlined from bracketProjection.ts) ─────────────────────────────
const toNum = (v: number | string | null | undefined): number | null => {
  if (v == null) return null;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(n) ? null : n;
};

function parseRecord(r: string | null | undefined) {
  if (!r) return { wins: 0, losses: 0 };
  const [w = '0', l = '0'] = r.split('-');
  return { wins: parseInt(w, 10) || 0, losses: parseInt(l, 10) || 0 };
}

const INTANGIBLE_UNIT = 0.05;

type IntangibleRule = { type: 'bonus' | 'penalty'; enabled: boolean; value: (t: Team) => number };
const INTANGIBLES: IntangibleRule[] = [
  { type: 'bonus', enabled: true, value: (t) => { const q3 = parseRecord(t.quad3); const q4 = parseRecord(t.quad4); return q3.losses === 0 && q4.losses === 0 ? 1 : 0; } },
  { type: 'bonus', enabled: true, value: (t) => { const q1 = parseRecord(t.quad1); const q2 = parseRecord(t.quad2); return (q1.wins + q2.wins) > (q1.losses + q2.losses) ? 1 : 0; } },
  { type: 'bonus', enabled: true, value: (t) => { const r = parseRecord(t.road); return r.wins > r.losses ? 1 : 0; } },
  { type: 'bonus', enabled: true, value: (t) => { const r = parseRecord(t.record); return r.wins >= 25 && r.losses <= 2 ? 1 : 0; } },
  { type: 'penalty', enabled: true, value: (t) => parseRecord(t.quad4).losses },
  { type: 'penalty', enabled: true, value: (t) => { const s = toNum(t.nonconsos); return s !== null && s > 250 ? 1 : 0; } },
  { type: 'penalty', enabled: true, value: (t) => { const q1 = parseRecord(t.quad1); const q2 = parseRecord(t.quad2); return (q1.wins + q2.wins) < (q1.losses + q2.losses) ? 1 : 0; } },
  { type: 'penalty', enabled: true, value: (t) => parseRecord(t.quad3).losses },
  { type: 'penalty', enabled: true, value: (t) => parseRecord(t.quad1).wins < 2 ? 1 : 0 },
  { type: 'penalty', enabled: true, value: (t) => { const r = parseRecord(t.record); const total = r.wins + r.losses; return total > 0 && r.wins / total < 0.575 ? 1 : 0; } },
];

function intangibleMultiplier(team: Team): number {
  return INTANGIBLES.filter(r => r.enabled).reduce((m, r) => {
    const count = r.value(team);
    if (count === 0) return m;
    const f = r.type === 'bonus' ? (1 - INTANGIBLE_UNIT) : (1 + INTANGIBLE_UNIT);
    return m * Math.pow(f, count);
  }, 1.0);
}

function weightedRank(team: Team, w: { wab: number; kpi: number; sor: number; kenpom: number; torvik: number; bpi: number; net: number }): number {
  const metrics = [
    { v: toNum(team.wab), w: w.wab }, { v: toNum(team.kpi), w: w.kpi },
    { v: toNum(team.sor), w: w.sor }, { v: toNum(team.kenpom), w: w.kenpom },
    { v: toNum(team.torvik), w: w.torvik }, { v: toNum(team.bpi), w: w.bpi },
    { v: toNum(team.net), w: w.net },
  ].filter((m): m is { v: number; w: number } => m.v !== null);
  if (metrics.length === 0) return Infinity;
  const totalW = metrics.reduce((s, m) => s + m.w, 0);
  return metrics.reduce((s, m) => s + m.v * m.w, 0) / totalW;
}

function selectionRank(t: Team) {
  return weightedRank(t, { wab: 0.22, kpi: 0.165, sor: 0.165, kenpom: 0.10, torvik: 0.10, bpi: 0.10, net: 0.15 }) * intangibleMultiplier(t);
}

function seedingRank(t: Team) {
  return weightedRank(t, { wab: 0.16, kpi: 0.10, sor: 0.16, kenpom: 0.13, torvik: 0.13, bpi: 0.13, net: 0.19 });
}

function getTop16Seeds(teams: Team[]): [Team[], Team[], Team[], Team[]] {
  // Determine auto-bid winners (confirmed autoBid or standings leader per conference)
  const confLeaders = new Map<string, Team>();
  teams.forEach(t => {
    if (t.autoBid === true && t.conference && !confLeaders.has(t.conference)) {
      confLeaders.set(t.conference, t);
    }
  });
  teams.forEach(t => {
    if (!t.conference || !t.confStandingsPosition || confLeaders.has(t.conference)) return;
    if (t.confStandingsPosition.toLowerCase().includes('1st')) confLeaders.set(t.conference, t);
  });

  const autoBidIds = new Set(Array.from(confLeaders.values()).map(t => t.espnId || t.slug));
  const autoBidList = Array.from(confLeaders.values());

  const atLarge = teams
    .filter(t => !autoBidIds.has(t.espnId || t.slug))
    .sort((a, b) => selectionRank(a) - selectionRank(b))
    .slice(0, 37);

  const bracket = [...autoBidList, ...atLarge];
  bracket.sort((a, b) => seedingRank(a) - seedingRank(b));

  return [
    bracket.slice(0, 4),   // 1 seeds
    bracket.slice(4, 8),   // 2 seeds
    bracket.slice(8, 12),  // 3 seeds
    bracket.slice(12, 16), // 4 seeds
  ];
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
const SEED_LABELS = ['1 seeds', '2 seeds', '3 seeds', '4 seeds'];

const SEED_COLORS = [
  { bg: '#f0fdf4', border: '#86efac', label: '#166534' }, // 1 seeds - green
  { bg: '#eff6ff', border: '#93c5fd', label: '#1e40af' }, // 2 seeds - blue
  { bg: '#fefce8', border: '#fde047', label: '#854d0e' }, // 3 seeds - yellow
  { bg: '#fff7ed', border: '#fdba74', label: '#9a3412' }, // 4 seeds - orange
];

export default async function handler(_req: Request): Promise<Response> {
  const [fontData, data] = await Promise.all([
    loadFont(),
    fetch('https://www.tourneyodds.info/all_teams_rankings.json').then(r => r.json()).catch(() => ({ teams: [] })),
  ]);

  const teams: Team[] = data.teams ?? [];
  const [seed1, seed2, seed3, seed4] = getTop16Seeds(teams);
  const seedGroups = [seed1, seed2, seed3, seed4];

  const fonts = fontData
    ? [{ name: 'IBM Plex Sans Condensed', data: fontData, weight: 700 as const, style: 'normal' as const }]
    : [];

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
          // Dot-grid approximation via radial-gradient; falls back gracefully if unsupported
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
            Projected bracket
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
            Tournament seed projections based on current team-sheet metrics
          </div>

          {/* Seed grid — 2 rows × 2 columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {([0, 1] as const).map((row) => (
              <div key={row} style={{ display: 'flex', gap: 10, flex: 1 }}>
                {([0, 1] as const).map((col) => {
                  const seedIdx = row * 2 + col;
                  const teams = seedGroups[seedIdx] ?? [];
                  const colors = SEED_COLORS[seedIdx];
                  return (
                    <div
                      key={col}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: colors.bg,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: 14,
                        padding: '16px 18px',
                      }}
                    >
                      {/* Seed label */}
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: colors.label,
                          marginBottom: 10,
                          display: 'flex',
                        }}
                      >
                        {SEED_LABELS[seedIdx]}
                      </div>

                      {/* Team pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {teams.map((team) => (
                          <div
                            key={team.slug}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: 20,
                              padding: '5px 10px 5px 5px',
                            }}
                          >
                            {team.logo && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={team.logo}
                                width={26}
                                height={26}
                                style={{ objectFit: 'contain' }}
                                alt=""
                              />
                            )}
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#111827',
                                fontFamily: 'sans-serif',
                              }}
                            >
                              {team.shortName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
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
