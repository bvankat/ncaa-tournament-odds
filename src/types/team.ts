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
};

export type NextGame = {
  home_team: string;
  home_team_logo?: string | null;
  away_team: string;
  away_team_logo?: string | null;
  date_time: string;
};