export const TOURNAMENT_STATUS_THRESHOLDS = {
  LOCK: 90,
  SAFE: 65,
  BUBBLE: 15,
} as const;

export function getDashboardStatus(tournamentOdds: number): string | null {
  if (tournamentOdds > TOURNAMENT_STATUS_THRESHOLDS.LOCK) return 'Tournament Lock';
  if (tournamentOdds > TOURNAMENT_STATUS_THRESHOLDS.SAFE) return 'Safe For Now';
  if (tournamentOdds > TOURNAMENT_STATUS_THRESHOLDS.BUBBLE) return 'Bubble';
  return null;
}

export function formatRelativeTime(dateString: string | number) {
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

export type FormatPercentOptions = {
  decimals?: number;
  includeSymbol?: boolean;
  showLessThanOne?: boolean;
  lessThanOneLabel?: string;
  fallback?: string;
};

export function formatPercent(
  value?: number | null,
  options: FormatPercentOptions = {}
): string {
  const {
    decimals = 0,
    includeSymbol = true,
    showLessThanOne = true,
    lessThanOneLabel = '<1%',
    fallback = '—',
  } = options;

  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  const numeric = Number(value);

  if (showLessThanOne && numeric > 0 && numeric < 1) {
    if (includeSymbol) {
      return lessThanOneLabel;
    }
    return lessThanOneLabel.replace('%', '').trim();
  }

  const formatted = numeric.toFixed(decimals);
  return includeSymbol ? `${formatted}%` : formatted;
}
