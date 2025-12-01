import React from 'react';

type RankingSparklineProps = {
  rank?: number | string | null;
  maxRank?: number;
  color?: string;
};

export function RankingSparkline({ rank, maxRank = 362, color = '#000' }: RankingSparklineProps) {
  if (rank === undefined || rank === null || rank === '—') return <div className="w-24 h-8"></div>;

  const numericRank = typeof rank === 'string' ? Number(rank) : rank;
  if (!Number.isFinite(numericRank)) return <div className="w-24 h-8"></div>;

  const position = ((maxRank - (numericRank as number)) / (maxRank - 1)) * 100;

  return (
    <div className="w-36 h-8 flex items-center relative">
      <div className="absolute w-full h-0.5 bg-gray-300"></div>
      <div className="absolute left-0 w-1 h-1 rounded-full bg-gray-400"></div>
      <div className="absolute right-0 w-1 h-1 rounded-full bg-gray-400"></div>
      <div
        className="absolute w-2.5 h-2.5 rounded-full border-2 border-white shadow-md"
        style={{ left: `${position}%`, transform: 'translateX(-50%)', backgroundColor: color }}
      ></div>
    </div>
  );
}
