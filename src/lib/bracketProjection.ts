import type { Team } from '@/types/team';

// Helper function to convert values to numbers
const toNumber = (val: number | string | null | undefined): number | null => {
  if (val == null) return null;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(num) ? null : num;
};

// Parse a "W-L" record string into wins and losses
function parseRecord(record: string | null | undefined): { wins: number; losses: number } {
  if (!record) return { wins: 0, losses: 0 };
  const parts = record.split('-');
  return {
    wins: parseInt(parts[0] ?? '0', 10) || 0,
    losses: parseInt(parts[1] ?? '0', 10) || 0,
  };
}

// ─── INTANGIBLES CONFIG ────────────────────────────────────────────────────────
// INTANGIBLE_UNIT: ranking points added/subtracted per qualifying hit.
// Bonuses subtract from the score (lower = better bid).
// Penalties add to the score.
// Set enabled: false to quickly toggle any rule off without deleting it.

const INTANGIBLE_UNIT = 0.05; // 5% per qualifying hit

type IntangibleRule = {
  name: string;
  type: 'bonus' | 'penalty';
  enabled: boolean;
  // Return 1 for binary rules, or a count for per-occurrence rules
  value: (team: Team) => number;
};

const INTANGIBLES: IntangibleRule[] = [
  // ── BONUSES (subtract from composite score) ──
  {
    name: 'Undefeated in Q3+Q4 combined',
    type: 'bonus',
    enabled: true,
    value: (t) => {
      const q3 = parseRecord(t.quad3);
      const q4 = parseRecord(t.quad4);
      return q3.losses === 0 && q4.losses === 0 ? 1 : 0;
    },
  },
  {
    name: 'Above .500 in Q1+Q2 combined',
    type: 'bonus',
    enabled: true,
    value: (t) => {
      const q1 = parseRecord(t.quad1);
      const q2 = parseRecord(t.quad2);
      return (q1.wins + q2.wins) > (q1.losses + q2.losses) ? 1 : 0;
    },
  },
  {
    name: 'Above .500 road record',
    type: 'bonus',
    enabled: true,
    value: (t) => {
      const road = parseRecord(t.road);
      return road.wins > road.losses ? 1 : 0;
    },
  },
  {
    name: '25+ wins with 2 or fewer losses',
    type: 'bonus',
    enabled: true,
    value: (t) => {
      const rec = parseRecord(t.record);
      return rec.wins >= 25 && rec.losses <= 2 ? 1 : 0;
    },
  },

  // ── PENALTIES (add to composite score) ──
  {
    name: 'Each Q4 loss',
    type: 'penalty',
    enabled: true,
    value: (t) => parseRecord(t.quad4).losses,
  },
  {
    name: 'Nonconference SOS above 250',
    type: 'penalty',
    enabled: true,
    value: (t) => {
      const sos = toNumber(t.nonconsos);
      return sos !== null && sos > 250 ? 1 : 0;
    },
  },
  {
    name: 'Below .500 in Q1+Q2 combined',
    type: 'penalty',
    enabled: true,
    value: (t) => {
      const q1 = parseRecord(t.quad1);
      const q2 = parseRecord(t.quad2);
      return (q1.wins + q2.wins) < (q1.losses + q2.losses) ? 1 : 0;
    },
  },
  {
    name: 'Each Q3 loss',
    type: 'penalty',
    enabled: true,
    value: (t) => parseRecord(t.quad3).losses,
  },
  {
    name: 'Fewer than 2 Quad 1 wins',
    type: 'penalty',
    enabled: true,
    value: (t) => parseRecord(t.quad1).wins < 2 ? 1 : 0,
  },
  {
    name: 'Overall win percentage below .575',
    type: 'penalty',
    enabled: true,
    value: (t) => {
      const rec = parseRecord(t.record);
      const total = rec.wins + rec.losses;
      if (total === 0) return 0;
      return rec.wins / total < 0.575 ? 1 : 0;
    },
  },
];

// Intangibles read record/quad/road data. Without any of it (e.g. preseason, or the
// records source switched off) the missing values would parse as 0-0 and fire
// rules like "undefeated in Q3+Q4" or "fewer than 2 Q1 wins" for every team.
function hasResumeData(team: Team): boolean {
  return [team.record, team.quad1, team.quad2, team.quad3, team.quad4, team.road, team.nonconsos]
    .some(v => v !== null && v !== undefined && v !== '');
}

// Calculate composite intangible multiplier (>1.0 = worse bid, <1.0 = better bid)
function calculateIntangibleMultiplier(team: Team): number {
  if (!hasResumeData(team)) return 1.0;
  return INTANGIBLES
    .filter(rule => rule.enabled)
    .reduce((multiplier, rule) => {
      const count = rule.value(team);
      if (count === 0) return multiplier;
      const factor = rule.type === 'bonus' ? (1 - INTANGIBLE_UNIT) : (1 + INTANGIBLE_UNIT);
      return multiplier * Math.pow(factor, count);
    }, 1.0);
}

export type IntangibleBreakdownItem = {
  name: string;
  type: 'bonus' | 'penalty';
  count: number;
  pctDelta: number; // e.g. -0.05 = -5% (bonus), +0.10 = +10% (2 Q4 losses)
};

// Returns per-rule breakdown for display in UI
export function getIntangibleBreakdown(team: Team): IntangibleBreakdownItem[] {
  if (!hasResumeData(team)) return [];
  return INTANGIBLES
    .filter(rule => rule.enabled)
    .map(rule => {
      const count = rule.value(team);
      const factor = rule.type === 'bonus' ? (1 - INTANGIBLE_UNIT) : (1 + INTANGIBLE_UNIT);
      const pctDelta = count === 0 ? 0 : Math.pow(factor, count) - 1;
      return { name: rule.name, type: rule.type, count, pctDelta };
    });
}
// ──────────────────────────────────────────────────────────────────────────────

// Helper function to calculate weighted ranking with direct multipliers
function calculateWeightedRanking(
  team: Team,
  weights: { wab: number; kpi: number; sor: number; kenpom: number; torvik: number; bpi: number; net: number }
): number {
  const metrics = [
    { value: toNumber(team.wab), weight: weights.wab },
    { value: toNumber(team.kpi), weight: weights.kpi },
    { value: toNumber(team.sor), weight: weights.sor },
    { value: toNumber(team.kenpom), weight: weights.kenpom },
    { value: toNumber(team.torvik), weight: weights.torvik },
    { value: toNumber(team.bpi), weight: weights.bpi },
    { value: toNumber(team.net), weight: weights.net }
  ].filter(m => m.value !== null) as { value: number; weight: number }[];

  // If no metrics available, sort to bottom
  if (metrics.length === 0) {
    return Infinity;
  }

  // Calculate weighted average (normalize weights if some metrics missing)
  const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
  return metrics.reduce((sum, m) => sum + m.value * m.weight, 0) / totalWeight;
}

/**
 * Calculate selection ranking
 * Resume-focused: WAB 22%, KPI 16.5%, SOR 16.5%, Predictive 10% each, NET 15%
 * Intangible adjustments applied after base score.
 * Returns a lower-is-better ranking
 */
export function calculateSelectionRanking(team: Team): number {
  const base = calculateWeightedRanking(team, {
    wab: 0.22,
    kpi: 0.165,
    sor: 0.165,
    kenpom: 0.10,
    torvik: 0.10,
    bpi: 0.10,
    net: 0.15
  });
  return base * calculateIntangibleMultiplier(team);
}

/**
 * Calculate seeding ranking
 * Thought to be predictive-focused
 * Dave Ommen says 2025 committe seemed to weight WAB, SOR and NET higher.
 * Returns a lower-is-better ranking
 */
export function calculateSeedingRanking(team: Team): number {
  return calculateWeightedRanking(team, {
    wab: 0.16,
    kpi: 0.10,
    sor: 0.16,
    kenpom: 0.13,
    torvik: 0.13,
    bpi: 0.13,
    net: 0.19
  });
}

/**
 * Calculate composite ranking (uses seeding formula for display)
 * Returns a lower-is-better ranking
 */
export function calculateCompositeRanking(team: Team): number {
  return calculateSeedingRanking(team);
}

export type BracketProjection = {
  bracketTeams: Team[];
  teamSeedMap: Map<string, number>;
  /** True seed (1..N) on the unconstrained S-curve seed list, by team id. */
  trueSeedMap: Map<string, number>;
  /** The seed list itself, in true-seed order. */
  trueSeedList: Team[];
  /** Seed line for each row of `bracketTeams`, parallel to that array. */
  seedByIndex: number[];
  autoBidTeams: Set<string>;
  /** All 24 Opening Round participants: 12 at-large + 12 automatic qualifiers. */
  openingRoundTeams: Set<string>;
  lastFourIn: Set<string>;
  lastFourByes: Set<string>;
  lastFourInList: Team[];
  lastFourByesList: Team[];
  bubbleTeams: Team[];
  autoBidList: Team[];
};

/** At-large bids in the 76-team field (76 total - 32 automatic qualifiers). */
const AT_LARGE_COUNT = 44;

/** Teams from each side (at-large / auto-bid) that play in the Opening Round. */
const OPENING_ROUND_PER_SIDE = 12;

/**
 * Calculate projected NCAA tournament bracket with seeds
 * Returns 76-team bracket (32 auto-bids + 44 at-large) with seed assignments
 */
export function calculateBracket(teams: Team[]): BracketProjection {
  // Step 1: Collect confirmed auto-bid winners (autoBid === true from data)
  const conferenceLeaders = new Map<string, Team>();

  teams.forEach(team => {
    if (team.autoBid === true && team.conference) {
      if (!conferenceLeaders.has(team.conference)) {
        conferenceLeaders.set(team.conference, team);
      }
    }
  });

  // Step 2: For conferences without a confirmed auto-bid, fall back to standings leader
  teams.forEach(team => {
    if (!team.conference || !team.confStandingsPosition) return;
    if (conferenceLeaders.has(team.conference)) return; // already have a confirmed winner

    const isFirstPlace = team.confStandingsPosition.toLowerCase().includes('1st');
    if (!isFirstPlace) return;

    const existing = conferenceLeaders.get(team.conference);
    if (!existing || calculateSelectionRanking(team) < calculateSelectionRanking(existing)) {
      conferenceLeaders.set(team.conference, team);
    }
  });

  const autoBidList = Array.from(conferenceLeaders.values());
  const autoBidTeams = new Set(autoBidList.map(t => t.espnId || t.slug));

  // Build the 76-team bracket: 32 auto-bids + 44 best at-large teams
  // Get all non-auto-bid teams sorted by SELECTION ranking (resume-focused)
  const atLargePool = teams
    .filter(team => !autoBidTeams.has(team.espnId || team.slug))
    .sort((a, b) => {
      const scoreA = calculateSelectionRanking(a);
      const scoreB = calculateSelectionRanking(b);
      return scoreA - scoreB;
    });
  
  // Take top 44 at-large teams based on selection ranking
  const atLargeTeams = atLargePool.slice(0, AT_LARGE_COUNT);
  
  // Get bubble teams (next 8 teams after the bracket based on selection ranking)
  const bubbleTeams = atLargePool.slice(AT_LARGE_COUNT, AT_LARGE_COUNT + 8);

  const bySeeding = (a: Team, b: Team) =>
    calculateSeedingRanking(a) - calculateSeedingRanking(b);

  // The "seed list": every selected team ranked in true seeds 1..N, the
  // committee's central artifact. Bracketing principles may move a team one
  // line off its true seed when it is placed, so this is kept separate from
  // the seed line in `teamSeedMap` — it is the unconstrained S-curve.
  const trueSeedList = [...autoBidList, ...atLargeTeams].sort(bySeeding);
  const trueSeedMap = new Map<string, number>(
    trueSeedList.map((team, index) => [team.espnId || team.slug, index + 1])
  );

  // The committee selects the field on resume, then builds one S-curve seed
  // list of everyone selected. Opening Round participants are read off the
  // bottom of that S-curve within each category — the 12 lowest at-large teams
  // and the 12 lowest automatic qualifiers — so membership uses the SEEDING
  // ranking, not the selection ranking that decided who got in.
  //
  // Membership has to be resolved before lines are assigned. Reading it off
  // the line boundaries instead does not work: the boundaries are global
  // indices into the merged field, where the two categories interleave, so
  // Opening Round teams would scatter onto lines that play no Opening Round
  // game (observed: one at-large on the 13 line).
  const atLargeBySeed = [...atLargeTeams].sort(bySeeding);
  const autoBidsBySeed = [...autoBidList].sort(bySeeding);

  const openingRoundAtLarge = atLargeBySeed.slice(-OPENING_ROUND_PER_SIDE);
  const openingRoundAutoBids = autoBidsBySeed.slice(-OPENING_ROUND_PER_SIDE);

  // All 24 Opening Round teams
  const openingRoundTeams = new Set(
    [...openingRoundAtLarge, ...openingRoundAutoBids].map(t => t.espnId || t.slug)
  );

  // Everyone else fills the remaining slots in seeding order.
  const remainingBySeed = [
    ...atLargeBySeed.slice(0, -OPENING_ROUND_PER_SIDE),
    ...autoBidsBySeed.slice(0, -OPENING_ROUND_PER_SIDE),
  ].sort(bySeeding);

  // Which Opening Round teams are pinned to which seed line. Within each
  // group the stronger teams take the higher line (11 before 12, 15 before 16).
  const OPENING_ROUND_UPPER_LINE = 4;
  const pinnedByLine = new Map<number, Team[]>([
    [11, openingRoundAtLarge.slice(0, OPENING_ROUND_UPPER_LINE)],
    [12, openingRoundAtLarge.slice(OPENING_ROUND_UPPER_LINE)],
    [15, openingRoundAutoBids.slice(0, OPENING_ROUND_UPPER_LINE)],
    [16, openingRoundAutoBids.slice(OPENING_ROUND_UPPER_LINE)],
  ]);

  // Lay the field out line by line, filling each line's unreserved slots from
  // the seeding-ordered pool. If the field is short (e.g. a conference has no
  // automatic qualifier yet), the pool simply runs out and trailing lines are
  // smaller rather than every seed shifting.
  const teamSeedMap = new Map<string, number>();
  const bracketTeams: Team[] = [];
  const pool = [...remainingBySeed];

  SEED_LINE_SIZES.forEach((lineSize, lineIndex) => {
    const seed = lineIndex + 1;
    const pinned = pinnedByLine.get(seed) ?? [];
    const line = [...pool.splice(0, Math.max(0, lineSize - pinned.length)), ...pinned];
    line.sort(bySeeding);
    line.forEach(team => {
      teamSeedMap.set(team.espnId || team.slug, seed);
      bracketTeams.push(team);
    });
  });

  // Anything left over (field larger than the 76 slots) sits on the last line.
  pool.forEach(team => {
    teamSeedMap.set(team.espnId || team.slug, SEED_LINE_SIZES.length);
    bracketTeams.push(team);
  });

  // Seed line for each row of the bracket table, so the view never has to
  // infer a seed from a row index.
  const seedByIndex = bracketTeams.map(
    team => teamSeedMap.get(team.espnId || team.slug) ?? SEED_LINE_SIZES.length
  );

  // "Last Four In": the weakest 4 of the at-large teams playing in the
  // Opening Round.
  const lastFourInList = openingRoundAtLarge.slice(-4);
  const lastFourIn = new Set(lastFourInList.map(t => t.espnId || t.slug));

  // "Last Four Byes": the last four at-large teams that do NOT play in the
  // Opening Round — i.e. the 4 immediately above the 12-team at-large Opening
  // Round group, going straight to the Round of 64.
  const lastFourByesList = atLargeBySeed.slice(
    -(OPENING_ROUND_PER_SIDE + 4),
    -OPENING_ROUND_PER_SIDE
  );
  const lastFourByes = new Set(lastFourByesList.map(t => t.espnId || t.slug));

  return {
    bracketTeams,
    teamSeedMap,
    trueSeedMap,
    trueSeedList,
    seedByIndex,
    autoBidTeams,
    openingRoundTeams,
    lastFourIn,
    lastFourByes,
    lastFourInList,
    lastFourByesList,
    bubbleTeams,
    autoBidList
  };
}

/**
 * Seed-line sizes for the 76-team field, indexed by seed - 1.
 *
 * Each Opening Round game puts 2 teams on a line that would normally hold 1
 * slot, so a line gains one extra team per game played on it: 2 games at the
 * 11 line, 4 at the 12 line, 2 at the 15 line, 4 at the 16 line.
 * Total: 40 + 6 + 8 + 4 + 4 + 6 + 8 = 76.
 */
const SEED_LINE_SIZES = [
  4, 4, 4, 4, 4, 4, 4, 4, 4, 4, // seeds 1-10
  6,                            // seed 11 (4 + 2 Opening Round games)
  8,                            // seed 12 (4 + 4 Opening Round games)
  4,                            // seed 13
  4,                            // seed 14
  6,                            // seed 15 (4 + 2 Opening Round games)
  8,                            // seed 16 (4 + 4 Opening Round games)
];

/**
 * Get seed display string for a bracket row.
 *
 * Takes the projection's `seedByIndex` rather than deriving a seed from the
 * row index: Opening Round teams are pinned to their seed lines, so a short
 * field leaves a line under-filled instead of shifting every seed after it.
 */
export function getSeedDisplay(seedByIndex: number[], index: number): string {
  const seed = seedByIndex[index];
  return seed === undefined ? '' : seed.toString();
}

/**
 * Check if separator should be added after this row in bracket table
 */
export function shouldAddSeparator(seedByIndex: number[], index: number): boolean {
  // Separate wherever the seed line changes, but never after the last row.
  if (index >= seedByIndex.length - 1) return false;
  return seedByIndex[index] !== seedByIndex[index + 1];
}
