import type { Team } from '@/types/team';

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
  // Determine auto-bids: one per conference, first place team with highest seedOdds
  const conferenceLeaders = new Map<string, Team>();
  
  teams.forEach(team => {
    if (!team.conference || !team.confStandingsPosition) return;
    
    // Check if team is in first place
    const isFirstPlace = team.confStandingsPosition.toLowerCase().includes('1st');
    if (!isFirstPlace) return;
    
    const existing = conferenceLeaders.get(team.conference);
    if (!existing || (team.seedOdds ?? 0) > (existing.seedOdds ?? 0)) {
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
  
  // Sort bracket by seedOdds for seeding purposes
  bracketTeams.sort((a, b) => (b.seedOdds ?? 0) - (a.seedOdds ?? 0));
  
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
