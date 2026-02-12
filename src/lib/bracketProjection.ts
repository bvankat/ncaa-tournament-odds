import type { Team } from '@/types/team';

/**
 * Calculate composite ranking for a team based on weighted metrics
 * Returns a lower-is-better ranking (like 1.2, 2.5, etc.)
 * Weighting: 40% Predictive Average, 30% NET, 30% Resume Average
 */
export function calculateCompositeRanking(team: Team): number {
  // Convert string values to numbers
  const toNumber = (val: number | string | null | undefined): number | null => {
    if (val == null) return null;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  };

  // Get predictive metrics (KenPom, Torvik, BPI)
  const predictiveValues = [
    toNumber(team.kenpom),
    toNumber(team.torvik), 
    toNumber(team.bpi)
  ].filter(v => v !== null) as number[];

  // Get resume metrics (WAB, KPI, SOR)
  const resumeValues = [
    toNumber(team.wab),
    toNumber(team.kpi),
    toNumber(team.sor)
  ].filter(v => v !== null) as number[];

  const netValue = toNumber(team.net);

  // Calculate averages
  const predictiveAvg = predictiveValues.length > 0
    ? predictiveValues.reduce((sum, val) => sum + val, 0) / predictiveValues.length
    : null;

  const resumeAvg = resumeValues.length > 0
    ? resumeValues.reduce((sum, val) => sum + val, 0) / resumeValues.length
    : null;

  // Weighted composite: 40% predictive, 25% NET, 35% resume
  // Calculate with whatever metrics are available
  const components: number[] = [];
  const weights: number[] = [];

  if (predictiveAvg !== null) {
    components.push(predictiveAvg);
    weights.push(0.40);
  }
  if (netValue !== null) {
    components.push(netValue);
    weights.push(0.25);
  }
  if (resumeAvg !== null) {
    components.push(resumeAvg);
    weights.push(0.35);
  }

  // If no metrics available, return null (will be handled by caller)
  if (components.length === 0) {
    return Infinity; // Sorts to bottom
  }

  // Calculate weighted average (normalize weights if some metrics missing)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const composite = components.reduce((sum, val, i) => sum + (val * weights[i]), 0) / totalWeight;

  return composite;
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
  // Determine auto-bids: one per conference, first place team with best (lowest) composite ranking
  const conferenceLeaders = new Map<string, Team>();
  
  teams.forEach(team => {
    if (!team.conference || !team.confStandingsPosition) return;
    
    // Check if team is in first place
    const isFirstPlace = team.confStandingsPosition.toLowerCase().includes('1st');
    if (!isFirstPlace) return;
    
    const existing = conferenceLeaders.get(team.conference);
    if (!existing || calculateCompositeRanking(team) < calculateCompositeRanking(existing)) {
      conferenceLeaders.set(team.conference, team);
    }
  });
  
  const autoBidList = Array.from(conferenceLeaders.values());
  const autoBidTeams = new Set(autoBidList.map(t => t.espnId || t.slug));

  // Build the 68-team bracket: 31 auto-bids + 37 best at-large teams
  // Get all non-auto-bid teams sorted by tournamentOdds
  const atLargePool = teams
    .filter(team => !autoBidTeams.has(team.espnId || team.slug))
    .sort((a, b) => (b.tournamentOdds ?? 0) - (a.tournamentOdds ?? 0));
  
  // Take top 37 at-large teams
  const atLargeTeams = atLargePool.slice(0, 37);
  
  // Combine auto-bids and at-large teams
  const bracketTeams = [...autoBidList, ...atLargeTeams];
  
  // Sort bracket by composite ranking (lower is better)
  bracketTeams.sort((a, b) => {
    const scoreA = calculateCompositeRanking(a);
    const scoreB = calculateCompositeRanking(b);
    return scoreA - scoreB;
  });
  
  // Get bubble teams (next 8 teams after the bracket)
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
