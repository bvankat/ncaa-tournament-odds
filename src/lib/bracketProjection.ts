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

// Calculate composite intangible multiplier (>1.0 = worse bid, <1.0 = better bid)
function calculateIntangibleMultiplier(team: Team): number {
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
    kenpom: 0.14,
    torvik: 0.14,
    bpi: 0.14,
    net: 0.16
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
  autoBidTeams: Set<string>;
  playInTeams: Set<string>;
  lastFourIn: Set<string>;
  lastFourByes: Set<string>;
  lastFourInList: Team[];
  lastFourByesList: Team[];
  bubbleTeams: Team[];
  autoBidList: Team[];
};

/**
 * Calculate projected NCAA tournament bracket with seeds
 * Returns 68-team bracket (31 auto-bids + 37 at-large) with seed assignments
 */
export function calculateBracket(teams: Team[]): BracketProjection {
  // Determine auto-bids: one per conference, first place team with best (lowest) selection ranking
  const conferenceLeaders = new Map<string, Team>();
  
  teams.forEach(team => {
    if (!team.conference || !team.confStandingsPosition) return;
    
    // Check if team is in first place
    const isFirstPlace = team.confStandingsPosition.toLowerCase().includes('1st');
    if (!isFirstPlace) return;
    
    const existing = conferenceLeaders.get(team.conference);
    if (!existing || calculateSelectionRanking(team) < calculateSelectionRanking(existing)) {
      conferenceLeaders.set(team.conference, team);
    }
  });
  
  const autoBidList = Array.from(conferenceLeaders.values());
  const autoBidTeams = new Set(autoBidList.map(t => t.espnId || t.slug));

  // Build the 68-team bracket: 31 auto-bids + 37 best at-large teams
  // Get all non-auto-bid teams sorted by SELECTION ranking (resume-focused)
  const atLargePool = teams
    .filter(team => !autoBidTeams.has(team.espnId || team.slug))
    .sort((a, b) => {
      const scoreA = calculateSelectionRanking(a);
      const scoreB = calculateSelectionRanking(b);
      return scoreA - scoreB;
    });
  
  // Take top 37 at-large teams based on selection ranking
  const atLargeTeams = atLargePool.slice(0, 37);
  
  // Combine auto-bids and at-large teams
  const bracketTeams = [...autoBidList, ...atLargeTeams];
  
  // Sort bracket by SEEDING ranking (predictive-focused) to assign seeds
  bracketTeams.sort((a, b) => {
    const scoreA = calculateSeedingRanking(a);
    const scoreB = calculateSeedingRanking(b);
    return scoreA - scoreB;
  });
  
  // Get bubble teams (next 8 teams after the bracket based on selection ranking)
  const bubbleTeams = atLargePool.slice(37, 45);

  // Create seed map for O(1) lookups
  const teamSeedMap = new Map<string, number>();
  bracketTeams.forEach((team, index) => {
    const seed = getSeedFromIndex(index);
    const teamId = team.espnId || team.slug;
    teamSeedMap.set(teamId, seed);
  });

  // Identify play-in teams, Last Four In, and Last Four Byes
  const atLargeInBracket = bracketTeams.filter(team => 
    !autoBidTeams.has(team.espnId || team.slug)
  );
  const autoBidsInBracket = bracketTeams.filter(team =>
    autoBidTeams.has(team.espnId || team.slug)
  );
  
  // Last 4 at-large teams are "Last Four In" (11-seed play-ins)
  const lastFourInList = atLargeInBracket.slice(-4);
  const lastFourIn = new Set(lastFourInList.map(t => t.espnId || t.slug));
  
  // 4 teams before Last Four In are "Last Four Byes"
  const lastFourByesList = atLargeInBracket.slice(-8, -4);
  const lastFourByes = new Set(lastFourByesList.map(t => t.espnId || t.slug));
  
  // Last 4 auto-bids are 16-seed play-ins
  const autoBidPlayIns = autoBidsInBracket.slice(-4);
  const autoBidPlayInIds = new Set(autoBidPlayIns.map(t => t.espnId || t.slug));
  
  // All 8 play-in teams
  const playInTeams = new Set([...lastFourIn, ...autoBidPlayInIds]);

  return {
    bracketTeams,
    teamSeedMap,
    autoBidTeams,
    playInTeams,
    lastFourIn,
    lastFourByes,
    lastFourInList,
    lastFourByesList,
    bubbleTeams,
    autoBidList
  };
}

/**
 * Determine seed number from bracket index
 * Adjusted for 11-seed and 16-seed play-ins
 */
function getSeedFromIndex(index: number): number {
  if (index < 40) {
    // Seeds 1-10, four teams each
    return Math.floor(index / 4) + 1;
  } else if (index < 46) {
    // Seed 11: 6 teams (indices 40-45)
    return 11;
  } else if (index < 62) {
    // Seeds 12-15: 4 teams each (indices 46-61)
    return Math.floor((index - 46) / 4) + 12;
  } else {
    // Seed 16: 6 teams (indices 62-67)
    return 16;
  }
}

/**
 * Get seed display string from index (for BracketView)
 */
export function getSeedDisplay(index: number): string {
  return getSeedFromIndex(index).toString();
}

/**
 * Check if separator should be added after this row in bracket table
 */
export function shouldAddSeparator(index: number): boolean {
  // Add separator after every seed group
  if (index === 39) return true; // After seed 10
  if (index === 45) return true; // After seed 11
  if (index < 40 && (index + 1) % 4 === 0) return true; // After seeds 1-10
  if (index >= 46 && index < 62 && (index - 46 + 1) % 4 === 0) return true; // After seeds 12-15
  return false;
}
