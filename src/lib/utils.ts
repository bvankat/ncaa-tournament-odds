export function formatRelativeTime(dateString: string) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

export function findScore(data: number | string | null | undefined): number | null {
  if (data === null || data === undefined || data === '') return null;

  const rank = typeof data === 'string' ? parseFloat(data) : data;
  if (isNaN(rank)) return null;

  let score: number | null;

  if (rank <= 30) {
    score = 99;
  } else if (rank > 30 && rank <= 35) {
    score = 95;
  } else if (rank > 35 && rank <= 40) {
    score = 90;
  } else if (rank > 40 && rank <= 43) {
    score = 80;
  } else if (rank > 43 && rank <= 45) {
    score = 70;
  } else if (rank > 45 && rank <= 47) {
    score = 55;
  } else if (rank > 47 && rank <= 51) {
    score = 30;
  } else if (rank > 51 && rank <= 55) {
    score = 15;
  } else if (rank > 55 && rank <= 60) {
    score = 10;
  } else if (rank > 60 && rank <= 70) {
    score = 5;
  } else if (rank > 70 && rank <= 80) {
    score = 2;
  } else if (rank > 80) {
    score = 1;
  } else {
    score = null;
  }

  return score;
}

export function calculateTournamentOdds(team: any): number {
  // Define metrics with their weights
  // SOR, KPI, and WAB have 1.5x weight; others have 1.0x weight
  const metrics: Array<{ ranking: any; weight: number }> = [
    { ranking: team.bpi, weight: 1.0 },
    { ranking: team.sor, weight: 1.5 },
    { ranking: team.kpi, weight: 1.5 },
    { ranking: team.kenpom, weight: 1.0 },
    { ranking: team.torvik, weight: 1.0 },
    { ranking: team.wab, weight: 1.5 },
    { ranking: team.net, weight: 1.0 }
  ];

  // Calculate weighted scores
  let weightedSum = 0;
  let totalWeight = 0;

  for (const { ranking, weight } of metrics) {
    const score = findScore(ranking);
    if (score !== null) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
