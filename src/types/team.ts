export type NcaaNetData = {
  net?: number | string | null;
  record?: string | null;
  conference?: string | null;
  road?: string | null;
  neutral?: string | null;
  home?: string | null;
  nonDiv1?: string | null;
  previous?: string | null;
  quad1?: string | null;
  quad2?: string | null;
  quad3?: string | null;
  quad4?: string | null;
};


export type Team = NcaaNetData & {
  id?: string;
  espnId?: string;
  slug: string;
  displayName: string;
  shortName: string;
  logo?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  bpi?: number | string | null;
  sor?: number | string | null;
  kpi?: number | string | null;
  kenpom?: number | string | null; // mapped in App to kenpomRank
  torvik?: number | string | null; // mapped in App to torvikRank
  wab?: number | string | null;
  nextGame?: NextGame | null;
  tournamentOdds?: number | null;
  previousTournamentOdds?: number | null;
  oddsChange?: number | null;
  previousBpi?: number | string | null;
  previousSor?: number | string | null;
  previousKpi?: number | string | null;
  previousKenpom?: number | string | null;
  previousTorvik?: number | string | null;
  previousWab?: number | string | null;
  previousNet?: number | string | null;
  confRecord?: string | null;
  confStandingsPosition?: string | null;
};

export type NextGame = {
  home_team: string;
  home_team_logo?: string | null;
  home_team_id?: string | null;
  away_team: string;
  away_team_logo?: string | null;
  away_team_id?: string | null;
  date: string;
};

export type GameCompetitor = {
  winner: boolean;
  team_id?: string | null;
  team_nickname: string;
  slug?: string | null;
  logo?: string | null;
  score: {
    value: number;
    displayValue: string;
  } | null;
  gameRank?: number | null;
};

export type ScheduleGame = {
  date: string;
  competitors: GameCompetitor[];
};

export type TeamSchedule = {
  espn_id: string;
  team_name: string;
  schedule: ScheduleGame[];
};

export type OddsChange = {
  espnId: string;
  slug: string;
  displayName: string;
  logo: string;
  currentOdds: number;
  previousOdds: number | null;
  change: number;
};

export type BubbleTeam = {
  espnId: string;
  slug: string;
  displayName: string;
  logo: string;
  currentOdds: number;
  previousOdds: number | null;
  change: number;
  distanceFrom50: number;
};

export type OddsMovers = {
  lastUpdated: string;
  biggestRisers: OddsChange[];
  biggestFallers: OddsChange[];
  bubbleTeams: BubbleTeam[];
};