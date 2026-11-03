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
  /** The 12 at-large Opening Round teams in seeding order (11 line, then 12 line). */
  openingRoundAtLargeList: Team[];
  lastFourIn: Set<string>;
  lastEightByes: Set<string>;
  lastFourInList: Team[];
  lastEightByesList: Team[];
  bubbleTeams: Team[];
  autoBidList: Team[];
};

/** At-large bids in the 76-team field (76 total - 32 automatic qualifiers). */
const AT_LARGE_COUNT = 44;

/** Teams from each side (at-large / auto-bid) that play in the Opening Round. */
const OPENING_ROUND_PER_SIDE = 12;

/** At-large teams just above the Opening Round that count as bubble byes. */
const LAST_BYES_COUNT = 8;

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

  // Step 3: Early in the season, before any standings are posted, project each
  // conference's auto bid as its best team by selection ranking. Without this,
  // conferences with neither a confirmed winner nor standings data contribute
  // no automatic qualifier, starving the Opening Round / low-seed lines that
  // assume a full 32-team auto-bid side.
  const conferences = new Set(teams.map(t => t.conference).filter((c): c is string => !!c));
  conferences.forEach(conf => {
    if (conferenceLeaders.has(conf)) return;

    const best = teams
      .filter(team => team.conference === conf)
      .sort((a, b) => calculateSelectionRanking(a) - calculateSelectionRanking(b))[0];

    if (best) {
      conferenceLeaders.set(conf, best);
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
  // Membership has to be resolved before lines are assigned: the two
  // categories interleave on the S-curve, so it can't be read off line
  // boundaries. The lines the games land on are then left to the S-curve.
  const atLargeBySeed = [...atLargeTeams].sort(bySeeding);
  const autoBidsBySeed = [...autoBidList].sort(bySeeding);

  const openingRoundAtLarge = atLargeBySeed.slice(-OPENING_ROUND_PER_SIDE);
  const openingRoundAutoBids = autoBidsBySeed.slice(-OPENING_ROUND_PER_SIDE);

  // All 24 Opening Round teams
  const openingRoundTeams = new Set(
    [...openingRoundAtLarge, ...openingRoundAutoBids].map(t => t.espnId || t.slug)
  );

  // The bracket is 16 lines x 4 slots. A slot is either one team with a bye
  // or one Opening Round game (adjacent pair within a category), ranked by the
  // average true seed of the teams in it. Games therefore land on whichever
  // lines their teams' S-curve positions dictate.
  const trueSeed = (team: Team) => trueSeedMap.get(team.espnId || team.slug) ?? Infinity;
  const pairUp = (group: Team[]): Team[][] =>
    Array.from({ length: Math.ceil(group.length / 2) }, (_, i) => group.slice(i * 2, i * 2 + 2));

  const slots: Team[][] = [
    ...atLargeBySeed.slice(0, -OPENING_ROUND_PER_SIDE).map(team => [team]),
    ...autoBidsBySeed.slice(0, -OPENING_ROUND_PER_SIDE).map(team => [team]),
    ...pairUp(openingRoundAtLarge),
    ...pairUp(openingRoundAutoBids),
  ];
  const slotKey = (slot: Team[]) =>
    slot.reduce((sum, team) => sum + trueSeed(team), 0) / slot.length;
  slots.sort((a, b) => slotKey(a) - slotKey(b));

  const teamSeedMap = new Map<string, number>();
  const bracketTeams: Team[] = [];

  for (let seed = 1; seed <= SEED_LINES; seed++) {
    // The last line also absorbs any slots beyond 64.
    const end = seed === SEED_LINES ? slots.length : seed * SLOTS_PER_LINE;
    const line = slots.slice((seed - 1) * SLOTS_PER_LINE, end).flat().sort(bySeeding);
    line.forEach(team => {
      teamSeedMap.set(team.espnId || team.slug, seed);
      bracketTeams.push(team);
    });
  }

  // Seed line for each row of the bracket table, so the view never has to
  // infer a seed from a row index.
  const seedByIndex = bracketTeams.map(
    team => teamSeedMap.get(team.espnId || team.slug) ?? SEED_LINES
  );

  // "Last Four In": the weakest 4 of the at-large teams playing in the
  // Opening Round.
  const lastFourInList = openingRoundAtLarge.slice(-4);
  const lastFourIn = new Set(lastFourInList.map(t => t.espnId || t.slug));

  // "Last Eight Byes": the 8 at-large teams immediately above the 12-team
  // at-large Opening Round group, going straight to the Round of 64.
  const lastEightByesList = atLargeBySeed.slice(
    -(OPENING_ROUND_PER_SIDE + LAST_BYES_COUNT),
    -OPENING_ROUND_PER_SIDE
  );
  const lastEightByes = new Set(lastEightByesList.map(t => t.espnId || t.slug));

  return {
    bracketTeams,
    teamSeedMap,
    trueSeedMap,
    trueSeedList,
    seedByIndex,
    autoBidTeams,
    openingRoundTeams,
    openingRoundAtLargeList: openingRoundAtLarge,
    lastFourIn,
    lastEightByes,
    lastFourInList,
    lastEightByesList,
    bubbleTeams,
    autoBidList
  };
}

const SEED_LINES = 16;
const SLOTS_PER_LINE = 4;

/**
 * Get seed display string for a bracket row.
 *
 * Takes the projection's `seedByIndex` rather than deriving a seed from the
 * row index: lines holding Opening Round games have more than 4 teams.
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
