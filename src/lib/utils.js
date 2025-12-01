import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

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

export function findScore(data) {
  if (data === null || data === undefined || data === '') return null;

  const rank = typeof data === 'string' ? parseFloat(data) : data;
  if (isNaN(rank)) return null;

  let score;

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

export function calculateTournamentOdds(team) {
  const rankings = [team.bpi, team.sor, team.kpi, team.kenpom, team.torvik, team.wab];

  const scores = rankings.map((ranking) => findScore(ranking)).filter((score) => score !== null);

  const totalScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

  return totalScore;
}

